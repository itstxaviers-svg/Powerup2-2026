import { useEffect, useRef, useState, type FormEvent, type SyntheticEvent } from 'react'
import { useVocabularyAudio } from '../../audio/useVocabularyAudio'
import { assets } from '../../data/assets'
import { coverageForTrainedWordIds } from '../../learning/moduleCoverage'
import { recordQuestionVariant } from '../../learning/questionVariation'
import { recordRecognitionMistake, recordReviewSuccess, recordSpellingMistake } from '../../learning/weakWordEngine'
import type { ModuleAttempt, QuestionVariantState, UnitData, UnitWord, WeakWordRecord } from '../../types/game'
import { CorrectionPractice } from '../CorrectionPractice'
import { useEnterAction } from '../useEnterAction'
import { createCodeFighterAudioGate, type CodeFighterAudioGate } from './codeFighterAudioGate'
import { createAnswerCountdown } from './codeFighterCountdown'
import { createFighterChallenge, opponents, opponentsForUnit, resolveCombat, type FighterChallenge, type OpponentId } from './codeFighterEngine'
import { ANSWER_TICK_MS, BATTLE_INTRO_HOLD_MS, ENEMY_RESULT_REVEAL_MS, answerWindowMs, answeringOpponentState, choreographyFor, createChoreographyRunner, presentationDuration, type ChoreographyStep, type CombatOutcome, type FighterEffectKind } from './fighterChoreography'
import { shouldMirrorOpponentFrame } from './fighterOrientation'
import type { FighterState } from './fighterStates'
import { opponentActionAsset, opponentFallbackAsset, opponentVictoryResultAsset, preloadOpponentActions } from './opponentActionRegistry'
import { opponentVisualAnchorStyle } from './opponentVisualAnchors'
import { PlayerActionArt } from './PlayerActionArt'
import { createFighterResultReveal } from './fighterResultReveal'
import { playFighterSound } from './sound'

type BattlePhase = 'intro' | 'answering' | 'choreography' | 'resolved' | 'victory' | 'defeat'
const MAX_PLAYER_HP = 10
const MAX_ENERGY = 4

type Battle = {
  phase: BattlePhase
  opponentId: OpponentId
  playerHp: number
  opponentHp: number
  energy: number
  challenge: FighterChallenge
  stepIndex: number
  exchangeCount: number
  taskCount: number
  correct: number
  combo: number
  weakWords: Record<string, WeakWordRecord>
  recentWordIds: string[]
  trainedWordIds: string[]
  variantStateByWordId: Record<string, QuestionVariantState>
  challengePerfect: boolean
  playerState: FighterState
  opponentState: FighterState
  feedback: string
  answerCorrect: boolean | null
  answerReady: boolean
  pendingOutcome: CombatOutcome
}

type CodeFighterProps = {
  unit: UnitData
  words: UnitWord[]
  scopeLabel: string
  avatarId: number
  playerName: string
  initialWeakWords: Record<string, WeakWordRecord>
  initialReviewClock: number
  initialTrainedWordIds?: string[]
  initialVariantStateByWordId?: Record<string, QuestionVariantState>
  reducedMotion?: boolean
  onAttempt: (attempt: ModuleAttempt) => void
  onBack: () => void
}

export function CodeFighter(props: CodeFighterProps) {
  const [opponentId, setOpponentId] = useState<OpponentId | null>(null)
  const initialChallenge = createFighterChallenge({
    unitId: props.unit.id,
    allWords: props.words,
    weakWords: props.initialWeakWords,
    reviewIndex: props.initialReviewClock,
    challengeIndex: props.initialReviewClock,
    recentWordIds: [],
    trainedWordIds: props.initialTrainedWordIds ?? [],
    variantStateByWordId: props.initialVariantStateByWordId ?? {},
    energy: 0,
  })

  if (!initialChallenge) return <FighterUnavailable scopeLabel={props.scopeLabel} onBack={props.onBack} />
  if (!opponentsForUnit(props.unit.id).length) return <FighterOpponentPending scopeLabel={props.scopeLabel} onBack={props.onBack} />
  if (!opponentId) return <OpponentSelect unitId={props.unit.id} scopeLabel={props.scopeLabel} onSelect={(id) => { setOpponentId(id); playFighterSound('battleStart') }} onBack={props.onBack} />
  return <FighterBattle key={opponentId} {...props} opponentId={opponentId} initialChallenge={initialChallenge} />
}

function FighterBattle({ unit, words, scopeLabel, avatarId, playerName, initialWeakWords, initialReviewClock, initialTrainedWordIds = [], initialVariantStateByWordId = {}, reducedMotion = false, onAttempt, onBack, opponentId, initialChallenge }: CodeFighterProps & { opponentId: OpponentId; initialChallenge: FighterChallenge }) {
  const opponent = opponents[opponentId]
  useEffect(() => { preloadOpponentActions(opponentId) }, [opponentId])
  const makeInitialBattle = (): Battle => ({
    phase: 'intro', opponentId, playerHp: MAX_PLAYER_HP, opponentHp: opponent.maxHp, energy: 0,
    challenge: initialChallenge, stepIndex: 0, exchangeCount: 0, taskCount: 0, correct: 0, combo: 0,
    weakWords: initialWeakWords, recentWordIds: [], trainedWordIds: initialTrainedWordIds,
    variantStateByWordId: initialVariantStateByWordId, challengePerfect: true,
    playerState: 'idle', opponentState: 'idle', feedback: '', answerCorrect: null,
    answerReady: false, pendingOutcome: 'continue',
  })
  const [battle, setBattle] = useState<Battle>(makeInitialBattle)
  const [answer, setAnswer] = useState('')
  const [sequence, setSequence] = useState<ChoreographyStep[]>([])
  const [sequenceIndex, setSequenceIndex] = useState(0)
  const [timeRemainingMs, setTimeRemainingMs] = useState(0)
  const submitRef = useRef<(value: string, timedOut?: boolean) => void>(() => undefined)
  const submissionLockedRef = useRef(false)
  const step = battle.challenge.steps[battle.stepIndex]
  const currentSequenceStep = battle.phase === 'choreography' ? sequence[sequenceIndex] : undefined
  const timeLimitMs = answerWindowMs(opponentId, battle.challenge.kind)

  useEffect(() => {
    if (battle.phase !== 'intro') return
    const timer = window.setTimeout(() => {
      submissionLockedRef.current = false
      setBattle((current) => ({ ...current, phase: 'answering', answerReady: !current.challenge.steps[current.stepIndex].audio, opponentState: answeringOpponentState(current.challenge.kind) }))
    }, presentationDuration(BATTLE_INTRO_HOLD_MS, reducedMotion))
    return () => window.clearTimeout(timer)
  }, [battle.phase, reducedMotion])

  useEffect(() => {
    if (battle.phase !== 'answering' || !battle.answerReady) {
      setTimeRemainingMs(0)
      return
    }
    const countdown = createAnswerCountdown({ durationMs: timeLimitMs, tickMs: ANSWER_TICK_MS, onTick: setTimeRemainingMs, onTimeout: () => submitRef.current('', true) })
    countdown.start()
    return countdown.dispose
  }, [battle.answerReady, battle.challenge.reviewIndex, battle.phase, battle.stepIndex, timeLimitMs])

  useEffect(() => {
    if (battle.phase !== 'choreography' || !sequence.length) return
    const runner = createChoreographyRunner({
      steps: sequence,
      reducedMotion,
      onStep: (action, index) => {
        setSequenceIndex(index)
        setBattle((current) => ({ ...current, playerState: action.playerState, opponentState: action.opponentState }))
        playChoreographySound(action)
      },
      onComplete: () => setBattle((current) => ({
        ...current,
        phase: current.answerCorrect === false ? 'resolved' : current.pendingOutcome === 'victory' ? 'victory' : current.pendingOutcome === 'defeat' ? 'defeat' : 'resolved',
        playerState: current.pendingOutcome === 'continue' ? 'idle' : current.playerState,
        opponentState: current.pendingOutcome === 'continue' ? 'idle' : current.opponentState,
      })),
    })
    runner.start()
    return runner.dispose
  }, [battle.phase, reducedMotion, sequence])

  const submit = (value: string, timedOut = false) => {
    if (battle.phase !== 'answering' || !battle.answerReady || submissionLockedRef.current) return
    submissionLockedRef.current = true
    const correct = !timedOut && value.trim().toLocaleLowerCase() === step.expected.trim().toLocaleLowerCase()
    const taskCount = battle.taskCount + 1
    let weakWords = battle.weakWords
    if (!correct) {
      weakWords = step.spelling
        ? recordSpellingMistake(weakWords, unit.id, battle.challenge.word.id, battle.challenge.reviewIndex)
        : recordRecognitionMistake(weakWords, unit.id, battle.challenge.word.id, battle.challenge.reviewIndex)
    }
    const finalStep = battle.stepIndex + 1 >= battle.challenge.steps.length
    const challengePerfect = battle.challengePerfect && correct
    if (correct && finalStep && challengePerfect && battle.challenge.isReview) weakWords = recordReviewSuccess(weakWords, unit.id, battle.challenge.word.id, battle.challenge.reviewIndex)
    const correctCount = battle.correct + (correct ? 1 : 0)
    const trainedWordIds = battle.trainedWordIds.includes(battle.challenge.word.id) ? battle.trainedWordIds : [...battle.trainedWordIds, battle.challenge.word.id]
    const chainContinues = correct && !finalStep
    const variantDifficulty = battle.challenge.kind === 'quick' || battle.challenge.kind === 'meaning' ? 1 as const : battle.challenge.kind === 'combo' || battle.challenge.kind === 'ultimate' ? 3 as const : 2 as const
    const variantStateByWordId = chainContinues
      ? battle.variantStateByWordId
      : recordQuestionVariant(battle.variantStateByWordId, battle.challenge.word.id, `code-fighter.${battle.challenge.kind}`, variantDifficulty, correct)
    const combat = chainContinues
      ? { playerHp: battle.playerHp, opponentHp: battle.opponentHp, outcome: 'continue' as const }
      : resolveCombat({ playerHp: battle.playerHp, opponentHp: battle.opponentHp, correct, challenge: battle.challenge, opponentDamage: opponent.damage })
    const sessionCompleted = combat.outcome === 'victory' || combat.outcome === 'defeat'
    onAttempt({
      unitId: unit.id, moduleId: 'code-fighter', wordId: battle.challenge.word.id, correct, weakWords,
      accuracy: correctCount / taskCount, sessionCompleted, sessionWon: combat.outcome === 'victory', advanceReviewClock: true,
      ...(chainContinues ? {} : { variantId: `code-fighter.${battle.challenge.kind}`, variantDifficulty }),
    })
    const nextEnergy = correct ? battle.challenge.kind === 'ultimate' ? 0 : Math.min(MAX_ENERGY, battle.energy + 1) : battle.energy
    const choreography = choreographyFor({ kind: battle.challenge.kind, correct, outcome: combat.outcome, comboComplete: finalStep })
    setSequence(choreography)
    setSequenceIndex(0)
    setBattle({
      ...battle, phase: 'choreography', playerHp: combat.playerHp, opponentHp: combat.opponentHp, energy: nextEnergy,
      taskCount, correct: correctCount, combo: correct ? battle.combo + 1 : 0, weakWords, trainedWordIds,
      variantStateByWordId, challengePerfect, playerState: choreography[0].playerState,
      opponentState: choreography[0].opponentState, answerReady: false, pendingOutcome: combat.outcome,
      feedback: chainContinues ? 'Combo link secured.' : correct ? `${battle.challenge.title} landed!` : timedOut ? `Time’s up. The answer was “${step.expected}”.` : `The answer was “${step.expected}”.`,
      answerCorrect: correct,
    })
    setAnswer('')
  }
  submitRef.current = submit

  const continueBattle = () => {
    if (battle.phase !== 'resolved') return
    submissionLockedRef.current = false
    if (battle.answerCorrect === false && battle.pendingOutcome === 'defeat') {
      setBattle({ ...battle, phase: 'defeat' })
      return
    }
    if (battle.answerCorrect && battle.stepIndex + 1 < battle.challenge.steps.length) {
      const nextStepIndex = battle.stepIndex + 1
      const nextStep = battle.challenge.steps[nextStepIndex]
      setBattle({ ...battle, phase: 'answering', stepIndex: nextStepIndex, playerState: 'idle', opponentState: answeringOpponentState(battle.challenge.kind), feedback: '', answerCorrect: null, answerReady: !nextStep.audio })
      return
    }
    const recentWordIds = [...battle.recentWordIds, battle.challenge.word.id].slice(-4)
    const reviewIndex = initialReviewClock + battle.taskCount
    const exchangeCount = battle.exchangeCount + 1
    const challenge = createFighterChallenge({ unitId: unit.id, allWords: words, weakWords: battle.weakWords, reviewIndex, challengeIndex: initialReviewClock + exchangeCount, recentWordIds, trainedWordIds: battle.trainedWordIds, variantStateByWordId: battle.variantStateByWordId, energy: battle.energy })
    if (!challenge) return
    if (challenge.kind === 'ultimate') playFighterSound('ultimateCharge')
    setBattle({ ...battle, phase: 'answering', challenge, stepIndex: 0, exchangeCount, recentWordIds, challengePerfect: true, playerState: 'idle', opponentState: answeringOpponentState(challenge.kind), feedback: '', answerCorrect: null, answerReady: !challenge.steps[0].audio, pendingOutcome: 'continue' })
  }

  const restartBattle = () => {
    submissionLockedRef.current = false
    setAnswer('')
    setSequence([])
    setSequenceIndex(0)
    setBattle(makeInitialBattle())
    playFighterSound('battleStart')
  }

  const coverage = coverageForTrainedWordIds(unit, 'code-fighter', battle.trainedWordIds)
  if (battle.phase === 'victory') return <BattleResult victory scopeLabel={scopeLabel} opponent={opponent.name} opponentId={battle.opponentId} avatarId={avatarId} accuracy={battle.correct / battle.taskCount} trained={coverage.trained} total={coverage.total} reducedMotion={reducedMotion} onBack={onBack} />
  if (battle.phase === 'defeat') return <BattleResult victory={false} scopeLabel={scopeLabel} opponent={opponent.name} opponentId={battle.opponentId} avatarId={avatarId} accuracy={battle.correct / battle.taskCount} trained={coverage.trained} total={coverage.total} reducedMotion={reducedMotion} onRetry={restartBattle} onBack={onBack} />

  return <main className={`fighter-shell ${reducedMotion ? 'fighter-reduced-motion' : ''}`}>
    <FighterRotatePrompt />
    <header className="fighter-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>{unit.title}</span></button><div className="fighter-status"><span className="training-scope-badge">{scopeLabel}</span><span>Combo <b>×{battle.combo}</b></span><span>Accuracy <b>{battle.taskCount ? Math.round(battle.correct / battle.taskCount * 100) : 100}%</b></span></div></header>
    <section className={`fighter-arena phase-${battle.phase} action-${battle.challenge.kind}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(3,16,33,.1), rgba(3,16,33,.45)), url(${assets.codeFighterArena})` }}>
      <div className="fighter-top-hud">
        <FighterHud name={playerName} hp={battle.playerHp} maxHp={MAX_PLAYER_HP} energy={battle.energy} side="left" />
        {battle.phase !== 'intro' && <FighterTimerHud answerReady={battle.answerReady} timeRemainingMs={timeRemainingMs} timeLimitMs={timeLimitMs} />}
        <FighterHud name={opponent.name} hp={battle.opponentHp} maxHp={opponent.maxHp} boss={opponent.boss} side="right" />
      </div>
      <div className="fighter-character player"><PlayerActionArt avatarId={avatarId} state={battle.playerState} label="Your fighter" /></div>
      <div className="fighter-character opponent"><OpponentActionFigure opponentId={battle.opponentId} state={battle.opponentState} label={opponent.name} /></div>
      {currentSequenceStep?.effect && <FighterEffect effect={currentSequenceStep.effect} targetsPlayer={currentSequenceStep.playerState === 'hitReaction'} />}
      <section className={`fighter-task-panel ${battle.phase === 'answering' && !battle.answerReady ? 'is-waiting' : ''}`} aria-live="polite">
        {battle.phase === 'intro' ? <div className="fighter-intro"><p className="eyebrow">Training duel</p><h1>Ready your light</h1><p>{opponent.name} is entering the arena…</p></div> : <>
          <div className="fighter-task-heading"><span>Exchange {battle.exchangeCount + 1} · {battle.challenge.isReview ? 'Spaced review' : battle.challenge.title}</span><b>{battle.challenge.kind === 'ultimate' ? 'ENERGY FULL' : battle.challenge.kind.toUpperCase()}</b></div>
          <h1>{step.prompt}</h1>
          {step.image && <img className="fighter-clue-image" src={step.image} alt="Vocabulary clue" />}
          {step.clue && <p className="fighter-clue">{step.clue}</p>}
          {battle.phase === 'answering' && step.audio && <FighterAudio key={`${battle.challenge.word.id}-${battle.challenge.reviewIndex}-${battle.stepIndex}`} audio={step.audio} word={battle.challenge.word.word} onFirstPlay={() => setBattle((current) => current.phase === 'answering' ? { ...current, answerReady: true } : current)} />}
          {battle.phase === 'answering' && step.mode === 'choice' && <div className="fighter-options">{step.choices?.map((choice) => <button type="button" key={choice} disabled={!battle.answerReady} onClick={() => submit(choice)}>{choice}</button>)}</div>}
          {battle.phase === 'answering' && step.mode === 'text' && <form className="fighter-answer" onSubmit={(event: FormEvent) => { event.preventDefault(); if (answer.trim() && battle.answerReady) submit(answer) }}><label><span className="sr-only">Your answer</span><input autoFocus={battle.answerReady} value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={!battle.answerReady} autoComplete="off" spellCheck={false} placeholder={battle.answerReady ? 'Type your answer' : 'Audio is loading…'} /></label><button className="primary-button compact" type="submit" disabled={!answer.trim() || !battle.answerReady}>Power move</button></form>}
          {battle.phase === 'choreography' && <p className="fighter-move-status">{battle.feedback.startsWith('Time’s up') ? 'Time’s up!' : 'Move in progress…'}</p>}
          {battle.phase === 'resolved' && (battle.answerCorrect
            ? <FighterFeedback correct message={battle.feedback} label={battle.stepIndex + 1 < battle.challenge.steps.length ? 'Next combo step →' : 'Next exchange →'} onContinue={continueBattle} />
            : <CorrectionPractice answer={step.expected} acceptedAnswers={step.expected === battle.challenge.word.word ? [step.expected, ...(battle.challenge.word.acceptedForms ?? [])] : [step.expected]} onContinue={continueBattle} continueLabel={battle.pendingOutcome === 'defeat' ? 'See result →' : 'Next exchange →'} />)}
        </>}
      </section>
    </section>
  </main>
}

function playChoreographySound(step: ChoreographyStep) {
  if (step.playerState === 'hitReaction') return playFighterSound('playerHit')
  if (step.opponentState === 'hitReaction') return playFighterSound('enemyHit')
  if (step.effect === 'quick') return playFighterSound('quickAttack')
  if (step.effect === 'heavy' || step.effect === 'enemySuper') return playFighterSound('heavyAttack')
  if (step.effect === 'block') return playFighterSound('block')
  if (step.effect === 'counter') return playFighterSound('counter')
  if (step.effect === 'combo' || step.effect === 'guardBreak') return playFighterSound('combo')
  if (step.effect === 'ultimate') return playFighterSound('ultimateImpact')
  if (step.playerState === 'victory') return playFighterSound('victory')
  if (step.opponentState === 'victory') return playFighterSound('defeat')
}

function FighterEffect({ effect, targetsPlayer }: { effect: FighterEffectKind; targetsPlayer: boolean }) {
  return <div className={`fighter-effect effect-${effect} ${targetsPlayer ? 'targets-player' : 'targets-opponent'}`} style={{ backgroundImage: `url(${assets.codeFighterEffects})` }} aria-hidden="true" />
}

export function FighterTimerHud({ answerReady, timeRemainingMs, timeLimitMs }: { answerReady: boolean; timeRemainingMs: number; timeLimitMs: number }) {
  const secondsRemaining = Math.ceil(timeRemainingMs / 1000)
  const timerPercent = answerReady ? Math.max(0, Math.min(100, timeRemainingMs / timeLimitMs * 100)) : 0
  const urgent = answerReady && timeRemainingMs <= 2000
  return <div className={`fighter-timer-hud${urgent ? ' urgent' : ''}${answerReady ? '' : ' is-waiting'}`} role="timer" aria-label={answerReady ? `${secondsRemaining} seconds remaining` : 'Waiting for the task to be ready'}>
    <strong aria-hidden="true">{answerReady ? `${secondsRemaining}s` : 'READY'}</strong>
    <span className="fighter-timer-track" aria-hidden="true"><i style={{ width: `${timerPercent}%` }} /></span>
  </div>
}

export function OpponentActionFigure({ opponentId, state, label, result = false, reservedResult = false }: { opponentId: OpponentId; state: FighterState; label: string; result?: boolean; reservedResult?: boolean }) {
  const mirrored = shouldMirrorOpponentFrame(opponentId, state)
  const source = reservedResult ? opponentVictoryResultAsset(opponentId) : opponentActionAsset(opponentId, state)
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const fallback = opponentFallbackAsset(opponentId)
    if (event.currentTarget.getAttribute('src') === fallback) {
      event.currentTarget.onerror = null
      return
    }
    console.warn(`Could not load ${opponentId} ${state} art; using this opponent's idle art.`)
    event.currentTarget.src = fallback
  }
  return <div className={`opponent-action-pose state-${state}${result ? ' is-result' : ''}${reservedResult ? ' reserved-result-art' : ''}`} style={opponentVisualAnchorStyle(opponentId, state)} data-opponent-id={opponentId}>
    <img className={`opponent-action-image${mirrored ? ' is-mirrored' : ''}`} data-mirror={mirrored} src={source} onError={handleError} alt={`${label}: ${state}`} />
  </div>
}

function FighterFeedback({ correct, message, label, onContinue }: { correct: boolean; message: string; label: string; onContinue: () => void }) {
  useEnterAction(onContinue)
  return <div className={`fighter-feedback ${correct ? 'correct' : 'incorrect'}`}><strong>{message}</strong><button className="primary-button compact" type="button" onClick={onContinue} aria-keyshortcuts="Enter" data-enter-action>{label}</button></div>
}

function FighterHud({ name, hp, maxHp, energy, boss, side }: { name: string; hp: number; maxHp: number; energy?: number; boss?: boolean; side: 'left' | 'right' }) {
  return <div className={`fighter-hud ${side}`}><div><strong>{name}</strong>{boss && <span>BOSS</span>}</div><div className="health-track"><span style={{ width: `${hp / maxHp * 100}%` }} /></div><small>{hp}/{maxHp} HP</small>{energy !== undefined && <div className="energy-orbs" aria-label={`${energy} of ${MAX_ENERGY} energy`}>{Array.from({ length: MAX_ENERGY }, (_, index) => <i className={index < energy ? 'charged' : ''} key={index} />)}</div>}</div>
}

function FighterAudio({ audio, word, onFirstPlay }: { audio: string; word: string; onFirstPlay: () => void }) {
  const { play, stop, playing, unavailable } = useVocabularyAudio(audio, word)
  const [hasStarted, setHasStarted] = useState(false)
  const gateRef = useRef<CodeFighterAudioGate | null>(null)
  const onFirstPlayRef = useRef(onFirstPlay)
  onFirstPlayRef.current = onFirstPlay

  useEffect(() => {
    const gate = createCodeFighterAudioGate({ play, onFirstPlay: () => { setHasStarted(true); onFirstPlayRef.current() } })
    gateRef.current = gate
    const startWhenLoaded = () => gate.start()
    if (document.readyState === 'complete') startWhenLoaded()
    else window.addEventListener('load', startWhenLoaded, { once: true })
    return () => {
      window.removeEventListener('load', startWhenLoaded)
      if (gateRef.current === gate) gateRef.current = null
      gate.dispose()
      stop()
    }
  }, [audio, play, stop, word])

  return <div className="fighter-audio-control"><button className={`fighter-audio ${playing ? 'playing' : ''}`} type="button" onClick={() => gateRef.current?.playNow()}>◖ {playing ? 'Listening…' : hasStarted ? 'Replay audio clue' : 'Play audio clue'}</button>{unavailable && <small role="status">Audio could not play. Try again.</small>}</div>
}

function OpponentSelect({ unitId, scopeLabel, onSelect, onBack }: { unitId: string; scopeLabel: string; onSelect: (id: OpponentId) => void; onBack: () => void }) {
  return <main className="fighter-shell fighter-select"><FighterRotatePrompt /><header className="fighter-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Unit hub</span></button><span className="training-scope-badge">{scopeLabel}</span></header><section className="opponent-select"><p className="eyebrow">Code Fighter arena</p><h1>Choose your training opponent</h1><p>Correct answers power non-violent arcane moves. Empty an opponent’s energy bar to activate the final station.</p><div className="opponent-grid">{opponentsForUnit(unitId).map((id) => { const opponent = opponents[id]; return <button key={id} type="button" onClick={() => onSelect(id)}><OpponentActionFigure opponentId={id} state="idle" label={opponent.name} /><strong>{opponent.name}</strong><span>{opponent.subtitle} · {opponent.maxHp} HP</span>{opponent.boss && <b>Boss challenge</b>}</button> })}</div></section></main>
}

function FighterUnavailable({ scopeLabel, onBack }: { scopeLabel: string; onBack: () => void }) {
  useEnterAction(onBack)
  return <main className="fighter-shell awaiting-shell"><FighterRotatePrompt /><header className="fighter-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Unit hub</span></button><span className="training-scope-badge">{scopeLabel}</span></header><section className="awaiting-card"><p className="eyebrow">Content pending</p><h1>The arena is charging</h1><p>Your teacher will add this Unit’s vocabulary before Code Fighter challenges begin.</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}

function FighterOpponentPending({ scopeLabel, onBack }: { scopeLabel: string; onBack: () => void }) {
  useEnterAction(onBack)
  return <main className="fighter-shell awaiting-shell"><FighterRotatePrompt /><header className="fighter-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Unit hub</span></button><span className="training-scope-badge">{scopeLabel}</span></header><section className="awaiting-card"><p className="eyebrow">Opponent pending</p><h1>This Unit’s vocabulary is ready</h1><p>Code Fighter will open when this Unit’s approved opponents are added. No opponent from another Unit is used as a substitute.</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}

export function BattleResult({ victory, scopeLabel, opponent, opponentId, avatarId, accuracy, trained, total, reducedMotion = false, onRetry, onBack }: { victory: boolean; scopeLabel: string; opponent: string; opponentId: OpponentId; avatarId: number; accuracy: number; trained: number; total: number; reducedMotion?: boolean; onRetry?: () => void; onBack: () => void }) {
  useEnterAction(onBack)
  const [showReservedVictory, setShowReservedVictory] = useState(false)
  useEffect(() => {
    if (victory) return
    const reveal = createFighterResultReveal({ delayMs: ENEMY_RESULT_REVEAL_MS, onReveal: () => setShowReservedVictory(true) })
    reveal.start()
    return reveal.dispose
  }, [opponentId, victory])

  const moduleComplete = total > 0 && trained >= total
  const playerResultState = victory ? 'victory' : 'tiredDefeat'
  const opponentResultState = victory ? 'tiredDefeat' : 'victory'
  const opponentArtState = !victory && showReservedVictory ? 'ultimate' : opponentResultState
  return <main className={`fighter-shell fighter-result ${reducedMotion ? 'fighter-reduced-motion' : ''}`}><FighterRotatePrompt /><section className={`fighter-result-card ${victory ? 'victory' : 'defeat'}`}><div className="result-fighters"><div className="result-fighter-slot player-result-slot"><PlayerActionArt avatarId={avatarId} state={playerResultState} label="Player result" result /></div><div className="result-fighter-slot opponent-result-slot"><OpponentActionFigure opponentId={opponentId} state={opponentArtState} label={`${opponent} result`} result reservedResult={showReservedVictory} /></div></div><p className="eyebrow">{victory ? 'Arena victory' : 'Training reset'}</p><span className="training-scope-badge">{scopeLabel}</span><h1>{victory ? `${opponent} defeated` : 'Your light needs another charge'}</h1><p>{Math.round(accuracy * 100)}% accuracy · {trained} / {total} words trained overall. {moduleComplete ? 'Code Fighter is complete and its city station is now active.' : victory ? 'This battle is complete; your vocabulary coverage is saved for future battles.' : 'Mistakes remain in your personal review pool for the next attempt.'}</p><div className="result-actions">{!victory && <button className="primary-button" type="button" onClick={onRetry}>Retry opponent</button>}<button className="secondary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>{moduleComplete ? 'Activate the city →' : 'Return to unit'}</button></div></section></main>
}

function FighterRotatePrompt() {
  return <aside className="fighter-rotate-prompt" role="status" aria-live="polite"><div className="rotate-device-icon" aria-hidden="true"><span>↻</span></div><p className="eyebrow">Code Fighter arena</p><h1>Turn your device sideways</h1><p>Rotate your phone or tablet to landscape mode to continue.</p></aside>
}
