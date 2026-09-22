import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useVocabularyAudio } from '../../audio/useVocabularyAudio'
import { assets } from '../../data/assets'
import type { FightingLevelProgress, FightingMilestoneId, UnitData, UnitWord } from '../../types/game'
import { CorrectionPractice } from '../CorrectionPractice'
import { useEnterAction } from '../useEnterAction'
import { createCodeFighterAudioGate, type CodeFighterAudioGate } from '../code-fighter/codeFighterAudioGate'
import { createAnswerCountdown } from '../code-fighter/codeFighterCountdown'
import { createManualIntroController, type ManualIntroState } from '../intro/manualIntroController'
import { isAcceptedRepairAnswer } from '../training/repairEngine'
import { fightingEnemies, fightingEnemyForBattle, fightingMilestones, resolveFightingEnemyAsset, type FightingEnemyAction, type FightingEnemyConfig } from './fightingLevelConfig'
import { buildFightingTasks, fallbackFightingTaskToAudio, fightingMilestoneDataStatus, markFightingEnemyIntroSeen, passesFightingBattle, recordFightingBattleResult, requiredFightingCorrect, rosterRecords, type FightingTask } from './fightingLevelEngine'

const FIGHTING_TICK_MS = 100

export function FightingLevel({ milestoneId, allUnits, progress, reducedMotion = false, demoMode = false, onProgressChange, onWordMistake, onBack }: {
  milestoneId: FightingMilestoneId
  allUnits: readonly UnitData[]
  progress: FightingLevelProgress
  reducedMotion?: boolean
  demoMode?: boolean
  onProgressChange: (progress: FightingLevelProgress) => void
  onWordMistake?: (unitId: string, wordId: string) => void
  onBack: () => void
}) {
  const status = fightingMilestoneDataStatus(allUnits, milestoneId)
  const roster = progress.battleRosterIds[progress.battleIndex] ?? []
  if ((!demoMode && !status.productionReady) || roster.length === 0) return <FightingLevelUnavailable milestoneId={milestoneId} status={status} onBack={onBack} />
  return <FightingBattle key={milestoneId} milestoneId={milestoneId} allUnits={allUnits} initialProgress={progress} reducedMotion={reducedMotion} onProgressChange={onProgressChange} onWordMistake={onWordMistake} onBack={onBack} />
}

function FightingBattle({ milestoneId, allUnits, initialProgress, reducedMotion, onProgressChange, onWordMistake, onBack }: {
  milestoneId: FightingMilestoneId
  allUnits: readonly UnitData[]
  initialProgress: FightingLevelProgress
  reducedMotion: boolean
  onProgressChange: (progress: FightingLevelProgress) => void
  onWordMistake?: (unitId: string, wordId: string) => void
  onBack: () => void
}) {
  const config = fightingMilestones[milestoneId]
  const [activeProgress, setActiveProgress] = useState(initialProgress)
  const makeTasks = (progress: FightingLevelProgress) => buildFightingTasks(
    rosterRecords(allUnits, milestoneId, progress.battleRosterIds[progress.battleIndex] ?? []),
    progress.battleIndex * 101,
  )
  const [tasks, setTasks] = useState(() => makeTasks(initialProgress))
  const [taskIndex, setTaskIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answerReady, setAnswerReady] = useState(false)
  const [remainingMs, setRemainingMs] = useState(config.answerTimeMs)
  const [feedback, setFeedback] = useState<{ correct: boolean; timedOut: boolean } | null>(null)
  const [result, setResult] = useState<{ correct: number; total: number; battleIndex: number; progress: FightingLevelProgress } | null>(null)
  const [enemyAction, setEnemyAction] = useState<FightingEnemyAction>('idle')
  const [impactCount, setImpactCount] = useState(0)
  const firstEnemy = fightingEnemyForBattle(milestoneId, initialProgress.battleIndex) ?? fightingEnemies['inkbound-knight']
  const [battleStarted, setBattleStarted] = useState(() => initialProgress.seenEnemyIntros.includes(firstEnemy.id))
  const lockedRef = useRef(false)
  const resolveRef = useRef<(correct: boolean, timedOut?: boolean) => void>(() => undefined)
  const task = tasks[taskIndex]
  const records = rosterRecords(allUnits, milestoneId, activeProgress.battleRosterIds[activeProgress.battleIndex] ?? [])
  const word = records.find((record) => record.word.id === task?.wordId)?.word
  const enemy = fightingEnemyForBattle(milestoneId, activeProgress.battleIndex) ?? fightingEnemies['inkbound-knight']

  const resolve = (correct: boolean, timedOut = false) => {
    if (lockedRef.current || feedback || result) return
    lockedRef.current = true
    const nextCorrect = correctCount + Number(correct)
    setCorrectCount(nextCorrect)
    setFeedback({ correct, timedOut })
    setEnemyAction(correct ? 'hit' : taskIndex >= Math.floor(tasks.length * .7) ? 'heavy-attack' : 'quick-attack')
    if (!correct) {
      setImpactCount((count) => count + 1)
      if (task) onWordMistake?.(task.unitId, task.wordId)
    }
  }
  resolveRef.current = resolve

  useEffect(() => {
    if (!battleStarted || !answerReady || feedback || result || !task) return
    const countdown = createAnswerCountdown({
      durationMs: config.answerTimeMs,
      tickMs: FIGHTING_TICK_MS,
      onTick: setRemainingMs,
      onTimeout: () => resolveRef.current(false, true),
    })
    countdown.start()
    return () => countdown.dispose()
  }, [answerReady, battleStarted, config.answerTimeMs, feedback, result, task])

  useEffect(() => {
    if (!battleStarted) return
    const nextTask = tasks[taskIndex + 1]
    if (nextTask?.mode !== 'picture' || !nextTask.pictureSource) return
    const preload = new Image()
    preload.src = nextTask.pictureSource
    return () => { preload.onload = null; preload.onerror = null }
  }, [battleStarted, taskIndex, tasks])

  if (!battleStarted) return <FightingEnemyIntro enemy={enemy} milestoneLabel={config.label} reducedMotion={reducedMotion} onBack={onBack} onStart={() => {
    const nextProgress = markFightingEnemyIntroSeen(activeProgress, enemy.id)
    setActiveProgress(nextProgress)
    onProgressChange(nextProgress)
    setBattleStarted(true)
  }} />

  if (!task || !word) return <FightingLevelUnavailable milestoneId={milestoneId} status={fightingMilestoneDataStatus(allUnits, milestoneId)} onBack={onBack} />

  const continueBattle = () => {
    if (!feedback) return
    if (taskIndex + 1 >= tasks.length) {
      const nextProgress = recordFightingBattleResult(activeProgress, correctCount, tasks.length)
      setActiveProgress(nextProgress)
      onProgressChange(nextProgress)
      setResult({ correct: correctCount, total: tasks.length, battleIndex: activeProgress.battleIndex, progress: nextProgress })
      return
    }
    const nextTask = tasks[taskIndex + 1]
    lockedRef.current = false
    setTaskIndex((index) => index + 1)
    setAnswer('')
    setAnswerReady(false)
    setRemainingMs(config.answerTimeMs)
    setFeedback(null)
    setEnemyAction('idle')
  }

  const startBattle = (progress: FightingLevelProgress, retainedTasks?: FightingTask[]) => {
    const nextTasks = retainedTasks ?? makeTasks(progress)
    const nextEnemy = fightingEnemyForBattle(milestoneId, progress.battleIndex) ?? enemy
    setActiveProgress(progress)
    setBattleStarted(progress.seenEnemyIntros.includes(nextEnemy.id))
    lockedRef.current = false
    setTasks(nextTasks)
    setTaskIndex(0)
    setCorrectCount(0)
    setAnswer('')
    setAnswerReady(false)
    setRemainingMs(config.answerTimeMs)
    setFeedback(null)
    setResult(null)
    setEnemyAction('idle')
  }

  if (result) return <FightingLevelResult
    milestoneId={milestoneId}
    enemy={fightingEnemyForBattle(milestoneId, result.battleIndex) ?? enemy}
    result={result}
    reducedMotion={reducedMotion}
    onRepeat={() => startBattle(result.progress, tasks)}
    onNextBattle={() => startBattle(result.progress)}
    onBack={onBack}
  />

  const timerPercent = answerReady ? Math.max(0, remainingMs / config.answerTimeMs * 100) : 0
  const fallbackPictureToAudio = () => {
    if (task.mode !== 'picture') return
    if (import.meta.env.DEV) console.warn(`[fighting-level] Picture clue failed for ${task.wordId}; switching this question to audio.`)
    setAnswerReady(false)
    setTasks((current) => current.map((candidate, index) => index === taskIndex ? fallbackFightingTaskToAudio(candidate, word) : candidate))
  }
  return <main className={`fighting-level-shell${feedback && !feedback.correct ? ' learner-hit' : ''}${reducedMotion ? ' fighting-level-reduced' : ''}`} data-impact={impactCount}>
    <header className="fighting-level-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Milestone</span></button><strong>{config.label}</strong><span>Battle {activeProgress.battleIndex + 1}/{config.battleCount}</span></header>
    <section className={`fighting-level-arena${task.mode === 'picture' ? ' has-picture-clue' : ''}`} style={{ backgroundImage: `linear-gradient(180deg,rgba(3,16,33,.18),rgba(3,16,33,.68)),url(${assets.codeFighterArena})` }}>
      <div className="fighting-level-hud">
        <span>{taskIndex + 1}/{tasks.length}</span>
        <FightingTimer ready={answerReady} remainingMs={remainingMs} percent={timerPercent} />
        <span>{correctCount} correct</span>
      </div>
      <FightingEnemyStage enemy={enemy} action={enemyAction} />
      {feedback?.correct && <span className="fighting-level-player-strike" aria-hidden="true" />}
      {task.mode === 'picture' && task.pictureSource && <FightingPictureClue source={task.pictureSource} onReady={() => setAnswerReady(true)} onError={fallbackPictureToAudio} />}
      <section className="fighting-level-task" aria-live="polite">
        <p className="eyebrow">{task.mode === 'audio' ? 'Audio recall' : 'Picture recall'}</p>
        <h1>{task.mode === 'audio' ? 'Listen, then type the English answer.' : 'Name what you see in English.'}</h1>
        <FightingTaskPrompt key={`${task.wordId}-${taskIndex}-${task.mode}`} task={task} word={word} answer={answer} answerReady={answerReady} disabled={Boolean(feedback)} onAnswerChange={setAnswer} onPromptReady={() => setAnswerReady(true)} onSubmit={() => resolve(isAcceptedRepairAnswer(word, answer))} />
        {feedback && (feedback.correct
          ? <FightingFeedback correct timedOut={feedback.timedOut} word={word.word} isFinal={taskIndex + 1 === tasks.length} onContinue={continueBattle} />
          : <CorrectionPractice answer={word.word} acceptedAnswers={[word.word, ...(word.acceptedForms ?? [])]} onContinue={continueBattle} continueLabel={taskIndex + 1 === tasks.length ? 'See result →' : 'Next task →'} />)}
      </section>
    </section>
  </main>
}

function FightingFeedback({ correct, timedOut, word, isFinal, onContinue }: { correct: boolean; timedOut: boolean; word: string; isFinal: boolean; onContinue: () => void }) {
  useEnterAction(onContinue)
  return <div className={`fighting-level-feedback ${correct ? 'correct' : 'incorrect'}`} role="status"><strong>{correct ? 'Direct hit!' : timedOut ? 'Time is up.' : 'The enemy strikes.'}</strong><span>{word}</span><button className="primary-button compact" type="button" onClick={onContinue} aria-keyshortcuts="Enter" data-enter-action>{isFinal ? 'See result' : 'Next task'} →</button></div>
}

export function FightingTaskPrompt({ task, word, answer, answerReady, disabled, onAnswerChange, onPromptReady, onSubmit }: {
  task: FightingTask
  word: UnitWord
  answer: string
  answerReady: boolean
  disabled: boolean
  onAnswerChange: (answer: string) => void
  onPromptReady: () => void
  onSubmit: () => void
}) {
  return <>
    {task.mode === 'audio' && <FightingAudioClue source={task.audioSource} spokenText={word.word} disabled={disabled} onReady={onPromptReady} />}
    <form className="fighting-level-answer" onSubmit={(event: FormEvent) => { event.preventDefault(); if (answerReady && answer.trim() && !disabled) onSubmit() }}>
      <label><span className="sr-only">English answer</span><input autoFocus={answerReady} value={answer} disabled={!answerReady || disabled} onChange={(event) => onAnswerChange(event.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={answerReady ? 'Type the English word or phrase' : 'Listen for the clue…'} /></label>
      <button className="primary-button compact" type="submit" disabled={!answerReady || disabled || !answer.trim()}>Attack</button>
    </form>
  </>
}

export function FightingPictureClue({ source, onReady, onError }: { source: string; onReady: () => void; onError: () => void }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return <div className="fighting-level-picture-frame"><img className="fighting-level-picture" src={source} alt="Vocabulary picture clue" draggable={false} onLoad={(event) => {
    const image = event.currentTarget
    const decoded = typeof image.decode === 'function' ? image.decode().catch(() => undefined) : Promise.resolve()
    void decoded.then(() => { if (image.isConnected) onReady() })
  }} onError={() => { setFailed(true); onError() }} /></div>
}

function FightingAudioClue({ source, spokenText, disabled, onReady }: { source?: string; spokenText: string; disabled: boolean; onReady: () => void }) {
  const { play, playing, unavailable } = useVocabularyAudio(source, spokenText)
  const gateRef = useRef<CodeFighterAudioGate | null>(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const gate = createCodeFighterAudioGate({ play, onFirstPlay: () => onReadyRef.current() })
    gateRef.current = gate
    const startWhenLoaded = () => gate.start()
    if (document.readyState === 'complete') startWhenLoaded()
    else window.addEventListener('load', startWhenLoaded, { once: true })
    return () => {
      window.removeEventListener('load', startWhenLoaded)
      if (gateRef.current === gate) gateRef.current = null
      gate.dispose()
    }
  }, [play, source, spokenText])

  return <div className="fighting-level-audio"><button type="button" disabled={disabled} className={playing ? 'is-playing' : ''} onClick={() => gateRef.current?.playNow()}><span aria-hidden="true">◖</span>{playing ? 'Listening…' : 'Replay clue'}</button>{unavailable && <small role="status">Audio could not play. Press Replay to try again.</small>}</div>
}

export function FightingEnemyStage({ enemy, action }: { enemy: FightingEnemyConfig; action: FightingEnemyAction }) {
  const [failedAssets, setFailedAssets] = useState<Set<string>>(() => new Set())
  const source = enemy.artAvailable ? resolveFightingEnemyAsset(enemy, action, failedAssets) : undefined
  if (!source) return <div className="fighting-enemy-art-pending" role="img" aria-label={`${enemy.displayName} artwork unavailable`}><span aria-hidden="true">✦</span><small>Enemy artwork unavailable</small><strong>{enemy.displayName}</strong></div>
  const anchor = enemy.visualAnchor
  const style = { '--enemy-scale': anchor.scale, '--enemy-x': `${anchor.x}%`, '--enemy-y': `${anchor.y}%`, '--enemy-ground-y': `${anchor.groundY}%`, '--enemy-mirror': anchor.mirrorX ? -1 : 1 } as CSSProperties
  return <div className={`fighting-enemy-stage action-${action}`} data-enemy-id={enemy.id} data-action={action} style={style}><img src={source} alt={`${enemy.displayName}: ${action}`} draggable={false} onError={() => {
    if (import.meta.env.DEV) console.warn(`[fighting-level] Could not load ${enemy.displayName} ${action} art; falling back to this enemy's idle art.`)
    setFailedAssets((current) => new Set([...current, source]))
  }} /></div>
}

export function FightingEnemyIntro({ enemy, milestoneLabel, reducedMotion, onStart, onBack }: { enemy: FightingEnemyConfig; milestoneLabel: string; reducedMotion: boolean; onStart: () => void; onBack: () => void }) {
  const [intro, setIntro] = useState<ManualIntroState>({ phase: 'enter', stepIndex: 0, canAdvance: false })
  const controllerRef = useRef<ReturnType<typeof createManualIntroController> | null>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    const controller = createManualIntroController({ stepCount: enemy.intro.lines.length, onState: setIntro })
    controllerRef.current = controller
    controller.start()
    return () => { controller.dispose(); if (controllerRef.current === controller) controllerRef.current = null }
  }, [enemy])
  const advance = () => controllerRef.current?.advance(intro.stepIndex)
  useEnterAction(intro.phase === 'ready' ? onStart : advance, intro.phase === 'ready' || intro.canAdvance)
  return <FightingEnemyIntroScene enemy={enemy} milestoneLabel={milestoneLabel} intro={intro} reducedMotion={reducedMotion} onNext={advance} onStart={onStart} onBack={onBack} />
}

export function FightingEnemyIntroScene({ enemy, milestoneLabel, intro, reducedMotion, onNext, onStart, onBack }: { enemy: FightingEnemyConfig; milestoneLabel: string; intro: ManualIntroState; reducedMotion: boolean; onNext: () => void; onStart: () => void; onBack: () => void }) {
  const ready = intro.phase === 'ready'
  const finalLine = intro.phase === 'dialogue' && intro.stepIndex === enemy.intro.lines.length - 1
  const action = finalLine || ready ? enemy.intro.finalAction : 'idle'
  const line = enemy.intro.lines[Math.min(intro.stepIndex, enemy.intro.lines.length - 1)]
  return <main className={`fighting-level-shell fighting-intro-shell${reducedMotion ? ' fighting-level-reduced' : ''}`}>
    <header className="fighting-level-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Return to unit</span></button><strong>{milestoneLabel}</strong><span>Enemy encounter</span></header>
    <section className={`fighting-level-arena fighting-intro-arena${enemy.id === 'corrupted-archivist' ? ' final-archivist-intro' : ''}`} style={{ backgroundImage: `linear-gradient(180deg,rgba(3,16,33,.18),rgba(3,16,33,.72)),url(${assets.codeFighterArena})` }}>
      <div className="fighting-intro-ambience" aria-hidden="true">{Array.from({ length: enemy.id === 'corrupted-archivist' ? 8 : 5 }, (_, index) => <i key={index} />)}</div>
      <FightingEnemyStage enemy={enemy} action={action} />
      <section className="fighting-intro-dialogue" role="status" aria-label={`${enemy.displayName} introduction`}>
        <p className="eyebrow">{enemy.displayName.toUpperCase()}</p>
        <div className="fighting-intro-line"><p>{line}</p></div>
        <div className="fighting-intro-actions">{ready ? <button className="primary-button fighting-intro-start" type="button" onClick={onStart} aria-keyshortcuts="Enter" data-enter-action>{enemy.intro.startLabel}</button> : intro.canAdvance && <button className="nova-intro-next" type="button" onClick={onNext} aria-keyshortcuts="Enter" data-enter-action>Next <span aria-hidden="true">→</span></button>}</div>
      </section>
    </section>
  </main>
}

function FightingTimer({ ready, remainingMs, percent }: { ready: boolean; remainingMs: number; percent: number }) {
  const seconds = Math.ceil(remainingMs / 1000)
  return <div className={`fighting-level-timer${ready && remainingMs <= 2000 ? ' urgent' : ''}${ready ? '' : ' waiting'}`} role="timer" aria-label={ready ? `${seconds} seconds remaining` : 'Waiting for the audio clue'}><strong>{ready ? `${seconds}s` : 'READY'}</strong><i aria-hidden="true"><span style={{ width: `${percent}%` }} /></i></div>
}

export function FightingLevelResult({ milestoneId, enemy, result, reducedMotion, onRepeat, onNextBattle, onBack }: {
  milestoneId: FightingMilestoneId
  enemy: FightingEnemyConfig
  result: { correct: number; total: number; battleIndex?: number; progress: FightingLevelProgress }
  reducedMotion: boolean
  onRepeat: () => void
  onNextBattle: () => void
  onBack: () => void
}) {
  const passed = passesFightingBattle(result.correct, result.total)
  const [resultAction, setResultAction] = useState<FightingEnemyAction>(passed ? 'defeat' : 'ultimate')
  const config = fightingMilestones[milestoneId]
  const hasNextBattle = passed && !result.progress.completed && result.progress.battleIndex < config.battleCount
  useEffect(() => {
    if (passed) return
    const timer = window.setTimeout(() => setResultAction('victory'), reducedMotion ? 80 : 480)
    return () => window.clearTimeout(timer)
  }, [passed, reducedMotion])
  useEnterAction(passed ? hasNextBattle ? onNextBattle : onBack : onRepeat)
  const accuracy = Math.round(result.correct / result.total * 100)
  return <main className={`fighting-level-shell fighting-level-result${reducedMotion ? ' fighting-level-reduced' : ''}`}><section className="fighting-level-result-card"><p className="eyebrow">{config.label}</p><FightingEnemyStage enemy={enemy} action={resultAction} /><h1>{passed ? 'PASS' : 'REPEAT'}</h1><div className="result-score">{accuracy}%</div><p>{result.correct} / {result.total} correct · {requiredFightingCorrect(result.total)} required</p>{passed && enemy.victoryLine && <p className="fighting-result-enemy-line">{enemy.victoryLine}</p>}{passed ? hasNextBattle ? <button className="primary-button" type="button" onClick={onNextBattle} aria-keyshortcuts="Enter" data-enter-action>Next battle →</button> : <button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to the world →</button> : <button className="primary-button" type="button" onClick={onRepeat} aria-keyshortcuts="Enter" data-enter-action>Repeat battle</button>}</section></main>
}

export function FightingMilestoneCard({ milestoneId, progress, allUnits, unlocked, demoMode = false, onOpen }: {
  milestoneId: FightingMilestoneId
  progress: FightingLevelProgress
  allUnits: readonly UnitData[]
  unlocked: boolean
  demoMode?: boolean
  onOpen: () => void
}) {
  const config = fightingMilestones[milestoneId]
  const status = fightingMilestoneDataStatus(allUnits, milestoneId)
  const enemyNames = config.enemyIds.map((id) => fightingEnemies[id].displayName).join(' · ')
  const disabled = !unlocked || (!demoMode && !status.productionReady)
  const buttonLabel = progress.completed ? 'Replay milestone' : demoMode ? 'Preview Fighting Level' : !status.productionReady ? 'Awaiting vocabulary' : !unlocked ? 'Complete this Unit first' : 'Enter Fighting Level'
  useEnterAction(onOpen, !disabled)
  return <section className={`fighting-milestone-card${progress.completed ? ' completed' : ''}`} aria-labelledby={`${milestoneId}-title`}><div><p className="eyebrow">Cumulative milestone</p><h2 id={`${milestoneId}-title`}>{config.label}</h2><p>Units {config.startUnit}–{config.endUnit} · {config.battleCount} {config.battleCount === 1 ? 'battle' : 'battles'} · {config.answerTimeMs / 1000}s per answer</p><strong>{enemyNames}</strong></div>{status.productionReady ? <p>{status.eligibleCount} production vocabulary records ready. Each fight uses approximately one third.</p> : demoMode ? <p className="fighting-development-warning" role="status">Demo preview: battles use the production vocabulary currently available in the configured Unit range.</p> : <p className="fighting-development-warning" role="status">Development note: production vocabulary is still missing for Unit{status.missingUnitNumbers.length === 1 ? '' : 's'} {status.missingUnitNumbers.join(', ')}. No placeholder words were added.</p>}<button className="primary-button" type="button" disabled={disabled} onClick={onOpen} aria-keyshortcuts="Enter" data-enter-action>{buttonLabel}</button></section>
}

function FightingLevelUnavailable({ milestoneId, status, onBack }: { milestoneId: FightingMilestoneId; status: ReturnType<typeof fightingMilestoneDataStatus>; onBack: () => void }) {
  useEnterAction(onBack)
  return <main className="fighting-level-shell awaiting-shell"><section className="awaiting-card"><p className="eyebrow">Fighting Level preparation</p><h1>{fightingMilestones[milestoneId].label} is not production-ready</h1><p>Real vocabulary is still required for Unit{status.missingUnitNumbers.length === 1 ? '' : 's'} {status.missingUnitNumbers.join(', ') || 'in this milestone'}. No development words or enemy artwork substitutes are being used.</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}
