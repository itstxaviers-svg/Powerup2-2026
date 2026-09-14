import { useEffect, useRef, useState } from 'react'
import { useVocabularyAudio } from '../../audio/useVocabularyAudio'
import { assets } from '../../data/assets'
import { coverageForTrainedWordIds } from '../../learning/moduleCoverage'
import { recordQuestionVariant } from '../../learning/questionVariation'
import { recordRecognitionMistake, recordReviewSuccess } from '../../learning/weakWordEngine'
import type { ModuleAttempt, QuestionVariantState, UnitData, UnitWord, WeakWordRecord } from '../../types/game'
import { useEnterAction } from '../useEnterAction'
import { createAudioStrikeReplayLifecycle, type AudioStrikeReplayLifecycle } from './audioStrikeReplay'
import { WordStrikeIntro } from './WordStrikeIntro'
import { WORD_STRIKE_CONFIG, availableWordStrikeLevels, chooseWordStrikeLevel, createWordStrikeRound, scoreForStrike, type WordStrikeRound } from './wordStrikeEngine'
import { playWordStrikeSound } from './sound'

export type StrikeSession = {
  roundIndex: number
  resolvedRounds: number
  shots: number
  correct: number
  combo: number
  bestCombo: number
  score: number
  weakWords: Record<string, WeakWordRecord>
  history: string[]
  trainedWordIds: string[]
  variantStateByWordId: Record<string, QuestionVariantState>
  roundVariantCommitted: boolean
  round: WordStrikeRound | null
  startedAt: number
}

type ShotState = {
  targetId: string
  targetLeft: number
  targetTop: number
  correct: boolean
}

export function WordStrike({
  unit,
  words,
  scopeLabel,
  initialWeakWords,
  initialReviewClock,
  initialTrainedWordIds = [],
  initialVariantStateByWordId = {},
  tutorialSeen,
  reducedMotion = false,
  startImmediately = false,
  onTutorialSeen,
  onAttempt,
  onBack,
}: {
  unit: UnitData
  words: UnitWord[]
  scopeLabel: string
  initialWeakWords: Record<string, WeakWordRecord>
  initialReviewClock: number
  initialTrainedWordIds?: string[]
  initialVariantStateByWordId?: Record<string, QuestionVariantState>
  tutorialSeen: boolean
  reducedMotion?: boolean
  startImmediately?: boolean
  onTutorialSeen: () => void
  onAttempt: (attempt: ModuleAttempt) => void
  onBack: () => void
}) {
  const levels = availableWordStrikeLevels(words)
  const initialLevel = chooseWordStrikeLevel(words, initialReviewClock)
  const initial = { roundIndex: 0, resolvedRounds: 0, shots: 0, correct: 0, combo: 0, bestCombo: 0, score: 0, weakWords: initialWeakWords, history: [], trainedWordIds: initialTrainedWordIds, variantStateByWordId: initialVariantStateByWordId, roundVariantCommitted: false }
  const [session, setSession] = useState<StrikeSession>(() => ({
    ...initial,
    round: initialLevel ? createWordStrikeRound({ unitId: unit.id, level: initialLevel, allWords: words, weakWords: initialWeakWords, reviewIndex: initialReviewClock, recentWordIds: [], trainedWordIds: initialTrainedWordIds }) : null,
    startedAt: Date.now(),
  }))
  const [started, setStarted] = useState(startImmediately)
  const [shotState, setShotState] = useState<ShotState | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  if (!levels.length || !session.round) return <WordStrikeUnavailable scopeLabel={scopeLabel} onBack={onBack} />
  if (!started) return <WordStrikeIntro scopeLabel={scopeLabel} reducedMotion={reducedMotion} onStart={() => {
    if (!tutorialSeen) onTutorialSeen()
    setSession((current) => ({ ...current, startedAt: Date.now() }))
    setStarted(true)
  }} onBack={onBack} />
  if (finished) {
    const coverage = coverageForTrainedWordIds(unit, 'word-strike', session.trainedWordIds)
    return <WordStrikeResult session={session} scopeLabel={scopeLabel} trained={coverage.trained} totalWords={coverage.total} onBack={onBack} />
  }

  const round = session.round
  const accuracy = session.shots ? session.correct / session.shots : 0

  const hitTarget = (targetId: string) => {
    if (shotState) return
    const target = round.targets.find((candidate) => candidate.id === targetId)
    if (!target) return
    const correct = target.word === round.answer
    const shots = session.shots + 1
    const trainedWordIds = session.trainedWordIds.includes(round.word.id) ? session.trainedWordIds : [...session.trainedWordIds, round.word.id]
    const variantStateByWordId = session.roundVariantCommitted
      ? session.variantStateByWordId
      : recordQuestionVariant(session.variantStateByWordId, round.word.id, round.variantId, round.variantDifficulty, correct)
    const variantAttempt = session.roundVariantCommitted ? {} : { variantId: round.variantId, variantDifficulty: round.variantDifficulty }
    playWordStrikeSound('fire')
    if (!correct) {
      const weakWords = recordRecognitionMistake(session.weakWords, unit.id, round.word.id, round.reviewIndex)
      const next = { ...session, shots, combo: 0, weakWords, trainedWordIds, variantStateByWordId, roundVariantCommitted: true }
      onAttempt({ unitId: unit.id, moduleId: 'word-strike', wordId: round.word.id, correct: false, weakWords, accuracy: session.correct / shots, sessionCompleted: false, advanceReviewClock: false, ...variantAttempt })
      setSession(next)
      setShotState({ targetId, targetLeft: target.left, targetTop: target.top, correct: false })
      setNotice('Missed target — the correct word is still in the range.')
      playWordStrikeSound('incorrect')
      return
    }

    const combo = session.combo + 1
    const strike = scoreForStrike(combo, Date.now() - session.startedAt)
    const correctCount = session.correct + 1
    const weakWords = round.isReview ? recordReviewSuccess(session.weakWords, unit.id, round.word.id, round.reviewIndex) : session.weakWords
    const isLastRound = session.roundIndex + 1 >= WORD_STRIKE_CONFIG.roundsPerSession
    const nextAccuracy = correctCount / shots
    const next = { ...session, shots, correct: correctCount, combo, bestCombo: Math.max(session.bestCombo, combo), score: session.score + strike.points, weakWords, trainedWordIds, variantStateByWordId, roundVariantCommitted: true }
    onAttempt({ unitId: unit.id, moduleId: 'word-strike', wordId: round.word.id, correct: true, weakWords, accuracy: nextAccuracy, sessionCompleted: isLastRound, advanceReviewClock: true, ...variantAttempt })
    setSession(next)
    setShotState({ targetId, targetLeft: target.left, targetTop: target.top, correct: true })
    setNotice(`${combo >= 3 ? 'Perfect strike!' : 'Direct hit!'} +${strike.points}${strike.speedBonus ? ' speed bonus' : ''}`)
    playWordStrikeSound(combo >= 2 ? 'combo' : 'correct')
  }

  const nextRound = () => {
    if (!shotState?.correct) { setShotState(null); setNotice(null); return }
    const isLastRound = session.roundIndex + 1 >= WORD_STRIKE_CONFIG.roundsPerSession
    if (isLastRound) { playWordStrikeSound('levelComplete'); setFinished(true); return }
    const nextRoundIndex = session.roundIndex + 1
    const resolvedRounds = session.resolvedRounds + 1
    const history = [...session.history, round.word.id].slice(-4)
    const reviewIndex = initialReviewClock + resolvedRounds
    const nextLevel = chooseWordStrikeLevel(words, reviewIndex, round.level.id)
    if (!nextLevel) { setFinished(true); return }
    const nextRoundValue = createWordStrikeRound({ unitId: unit.id, level: nextLevel, allWords: words, weakWords: session.weakWords, reviewIndex, recentWordIds: history, trainedWordIds: session.trainedWordIds })
    if (!nextRoundValue) { setFinished(true); return }
    setSession({ ...session, roundIndex: nextRoundIndex, resolvedRounds, history, round: nextRoundValue, roundVariantCommitted: false, startedAt: Date.now() })
    setShotState(null); setNotice(null); playWordStrikeSound('spawn')
  }

  return <main className="word-strike-shell">
    <header className="strike-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>{unit.title}</span></button><div className="strike-scoreboard"><span className="training-scope-badge">{scopeLabel}</span><span>Score <b>{session.score}</b></span><span>Combo <b className={session.combo >= 2 ? 'combo-hot' : ''}>×{Math.max(1, 1 + Math.floor(session.combo / 2))}</b></span><span>{round.level.title} · {session.roundIndex + 1}/{WORD_STRIKE_CONFIG.roundsPerSession}</span></div></header>
    <section className={`strike-arena ${shotState ? `is-${shotState.correct ? 'hit' : 'miss'}` : ''}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(4,22,43,.18), rgba(4,22,43,.52)), url(${assets.wordStrikeRange})` }}>
      <div className="strike-prompt"><span className="eyebrow">{round.level.title}</span><strong>{round.level.prompt}</strong>{round.level.id === 'audio' && round.audio && !shotState && <StrikeAudio key={`${round.word.id}-${round.reviewIndex}`} audio={round.audio} word={round.word.word} />}</div>
      <div className="strike-hud"><span>Accuracy {Math.round(accuracy * 100)}%</span><span>{round.isReview ? 'Review target' : 'Target acquired'}</span></div>
      <div className="target-field" aria-label="Moving vocabulary targets">
        {round.targets.map((target) => <button key={target.id} type="button" className={`strike-target strike-target-skin-${target.skin % 3} motion-${target.motion} ${shotState?.targetId === target.id ? shotState.correct ? 'is-hit' : 'is-miss' : ''}`} style={{ left: `${target.left}%`, top: `${target.top}%` }} onClick={() => hitTarget(target.id)} aria-label={`Shoot ${target.word}`}><span>{target.word}</span></button>)}
        {shotState && <StrikeShotEffect shot={shotState} />}
      </div>
      <img className={`strike-fps-cannon ${shotState ? 'firing' : ''}`} src={assets.wordStrikeFpsCannon} alt="" aria-hidden="true" />
      {shotState && <StrikeFeedback correct={shotState.correct} notice={notice} onContinue={nextRound} />}
    </section>
  </main>
}

function StrikeShotEffect({ shot }: { shot: ShotState }) {
  return <div className={`strike-shot-effect ${shot.correct ? 'correct' : 'incorrect'}`} aria-hidden="true">
    <svg className="strike-projectile-path" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="96" y1="93" x2={shot.targetLeft} y2={shot.targetTop} pathLength="1" />
    </svg>
    <i className="strike-muzzle-flash" />
    <i className="strike-impact" style={{ left: `${shot.targetLeft}%`, top: `${shot.targetTop}%` }} />
  </div>
}

function StrikeFeedback({ correct, notice, onContinue }: { correct: boolean; notice: string | null; onContinue: () => void }) {
  useEnterAction(onContinue)
  return <div className={`strike-feedback ${correct ? 'correct' : 'incorrect'}`} role="status"><strong>{notice}</strong><button className="primary-button compact" type="button" onClick={onContinue} aria-keyshortcuts="Enter" data-enter-action>{correct ? 'Next target →' : 'Try again'}</button></div>
}

function StrikeAudio({ audio, word }: { audio: string; word: string }) {
  const { play, stop, playing, unavailable } = useVocabularyAudio(audio, word)
  const replayLifecycle = useRef<AudioStrikeReplayLifecycle | null>(null)

  useEffect(() => {
    const lifecycle = createAudioStrikeReplayLifecycle({ play, stop })
    replayLifecycle.current = lifecycle
    lifecycle.start()
    if (document.visibilityState === 'hidden') lifecycle.pause()
    const handleVisibility = () => document.visibilityState === 'hidden' ? lifecycle.pause() : lifecycle.resume()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      replayLifecycle.current = null
      lifecycle.dispose()
    }
  }, [audio, play, stop])

  return <span className="strike-audio-control"><button className={`strike-audio ${playing ? 'is-playing' : ''}`} type="button" onClick={() => replayLifecycle.current?.replayNow()} aria-label="Replay audio">◖ {playing ? 'Listening…' : 'Replay audio'}</button>{unavailable && <small role="status">Audio could not play automatically. Use Replay audio to try again.</small>}</span>
}

function WordStrikeUnavailable({ scopeLabel, onBack }: { scopeLabel: string; onBack: () => void }) {
  useEnterAction(onBack)
  return <main className="word-strike-shell awaiting-shell"><header className="training-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Unit hub</span></button><span className="training-scope-badge">{scopeLabel}</span></header><section className="awaiting-card"><img className="awaiting-fps-cannon" src={assets.wordStrikeFpsCannon} alt="" aria-hidden="true" /><p className="eyebrow">Content pending</p><h1>Word Strike is preparing</h1><p>This Unit needs configured spelling variants or at least three production-audio vocabulary items before targets can launch.</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}

export function WordStrikeResult({ session, scopeLabel, trained, totalWords, onBack }: { session: StrikeSession; scopeLabel: string; trained: number; totalWords: number; onBack: () => void }) {
  useEnterAction(onBack)
  const accuracy = session.shots ? Math.round((session.correct / session.shots) * 100) : 0
  const completed = totalWords > 0 && trained >= totalWords
  return <main className="word-strike-shell awaiting-shell"><section className="awaiting-card result-card"><p className="eyebrow">Range session complete</p><span className="training-scope-badge">{scopeLabel}</span><h1>{completed ? 'Word Strike complete' : 'Range practice saved'}</h1><div className="result-score">{session.score}</div><p>{accuracy}% accuracy · best combo ×{Math.max(1, 1 + Math.floor(session.bestCombo / 2))} · {trained} / {totalWords} words trained overall. {completed ? 'This station is now active.' : 'Continue with this or another Part to grow your coverage.'}</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}
