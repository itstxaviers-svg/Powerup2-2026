import { useState } from 'react'
import { useVocabularyAudio } from '../../audio/useVocabularyAudio'
import { assets } from '../../data/assets'
import { coverageForTrainedWordIds, eligibleWordsForModule } from '../../learning/moduleCoverage'
import { chooseQuestionVariant, recordQuestionVariant, type QuestionVariant } from '../../learning/questionVariation'
import { eligibleWords, chooseScheduledWord } from '../../learning/taskScheduler'
import { recordRecognitionMistake, recordReviewSuccess, recordSpellingMistake } from '../../learning/weakWordEngine'
import type { ModuleAttempt, QuestionDifficulty, QuestionVariantState, TrainingModuleId, UnitData, UnitWord, WeakWordRecord } from '../../types/game'
import { isEnterActionKey, useEnterAction } from '../useEnterAction'
import { CorrectionPractice } from '../CorrectionPractice'
import { ManualGameIntro } from '../intro/ManualGameIntro'
import { trainingIntroConfigs } from '../intro/trainingIntroConfig'
import { assembledAudioAnswer, assemblySlotGroups, shuffledAudioLetters } from './audioCodePresentation'
import { errorHuntVariants, isCorrectErrorHuntAnswer } from './errorHuntEngine'
import { damageRepairTarget, isAcceptedRepairAnswer, isRepairEligible, repairClueFor, type RepairClue } from './repairEngine'

export const TRAINING_TASKS_PER_MODULE = 5

type BaseTask = { word: UnitWord; isReview: boolean; moduleId: TrainingModuleId; index: number; reviewIndex: number; variantId: string; variantDifficulty: QuestionDifficulty }
type RepairTask = BaseTask & { kind: 'repair'; damaged: string; clue: RepairClue }
type ErrorHuntTask = BaseTask & { kind: 'error-hunt'; corrupted: string }
export type AudioTask = BaseTask & { kind: 'audio-code'; mode: 'choice' | 'assemble' | 'type'; choices?: string[] }
type TrainingTask = RepairTask | ErrorHuntTask | AudioTask

type Session = {
  index: number
  correct: number
  history: string[]
  trainedWordIds: string[]
  variantStateByWordId: Record<string, QuestionVariantState>
  weakWords: Record<string, WeakWordRecord>
  task: TrainingTask | null
}

const moduleTitles: Record<TrainingModuleId, string> = {
  repair: 'Repair',
  'error-hunt': 'Error Hunt',
  'audio-code': 'Audio Code',
}

const normalize = (value: string) => value.trim().toLocaleLowerCase()
export const isDesktopContinueKey = isEnterActionKey
const moduleImage = (moduleId: TrainingModuleId) => moduleId === 'repair' ? assets.repairWorkshop : moduleId === 'error-hunt' ? assets.errorHuntLab : assets.audioChamber

function shuffled<T>(values: T[], offset: number): T[] {
  return values.map((value, index) => ({ value, rank: (index * 7 + offset * 3) % values.length })).sort((a, b) => a.rank - b.rank).map(({ value }) => value)
}

function repairVariants(word: UnitWord): QuestionVariant<{ damaged: string; clue: RepairClue }>[] {
  const variants: QuestionVariant<{ damaged: string; clue: RepairClue }>[] = []
  const presentations = new Set<string>()
  for (const difficulty of [1, 2, 3] as const) {
    for (let variation = 0; variation < 9; variation += 1) {
      const clue = repairClueFor(word, variation)
      if (!clue) continue
      const damaged = damageRepairTarget(word.word, variation, difficulty)
      const presentation = `${clue.type}|${clue.text}|${normalize(damaged)}`
      if (presentations.has(presentation)) continue
      presentations.add(presentation)
      variants.push({ variantId: `repair.${clue.type}.d${difficulty}.${normalize(damaged)}`, difficulty, value: { damaged, clue } })
    }
  }
  return variants
}

function buildTask(moduleId: TrainingModuleId, unit: UnitData, words: UnitWord[], session: Omit<Session, 'task'>, reviewClock: number): TrainingTask | null {
  const reviewIndex = reviewClock + session.index
  const taskWords = moduleId === 'repair' ? words.filter(isRepairEligible) : words
  const scheduled = chooseScheduledWord({ words: taskWords, moduleId, unitId: unit.id, weakWords: session.weakWords, taskIndex: reviewIndex, recentWordIds: session.history.slice(-3), trainedWordIds: session.trainedWordIds })
  if (!scheduled) return null
  const previousVariant = session.variantStateByWordId[scheduled.word.id]
  const makeBase = (variantId: string, variantDifficulty: QuestionDifficulty): BaseTask => ({ word: scheduled.word, isReview: scheduled.isReview, moduleId, index: session.index, reviewIndex, variantId, variantDifficulty })
  if (moduleId === 'repair') {
    const variant = chooseQuestionVariant(repairVariants(scheduled.word), previousVariant, reviewIndex, 2)
    return variant ? { ...makeBase(variant.variantId, variant.difficulty), kind: 'repair', ...variant.value } : null
  }
  if (moduleId === 'error-hunt') {
    const initialDifficulty = ((session.index % 3) + 1) as QuestionDifficulty
    const variant = chooseQuestionVariant(errorHuntVariants(scheduled.word), previousVariant, reviewIndex, initialDifficulty)
    return variant ? { ...makeBase(variant.variantId, variant.difficulty), kind: 'error-hunt', corrupted: variant.value } : null
  }
  const distractors = scheduled.word.distractors?.length
    ? scheduled.word.distractors
    : words.filter((word) => word.id !== scheduled.word.id).map((word) => word.word)
  const options = shuffled([...new Set([scheduled.word.word, ...distractors])].slice(0, 4), reviewIndex)
  const audioVariants: QuestionVariant<AudioTask['mode']>[] = [
    { variantId: 'audio-code.choice', difficulty: 1, value: 'choice' },
    { variantId: 'audio-code.assemble', difficulty: 2, value: 'assemble' },
    { variantId: 'audio-code.type', difficulty: 3, value: 'type' },
  ]
  const initialDifficulty = ((session.index % 3) + 1) as QuestionDifficulty
  const variant = chooseQuestionVariant(audioVariants, previousVariant, reviewIndex, initialDifficulty)
  if (!variant) return null
  return { ...makeBase(variant.variantId, variant.difficulty), kind: 'audio-code', mode: variant.value, choices: variant.value === 'choice' ? options : undefined }
}

function isSpellingTask(task: TrainingTask) {
  return task.kind !== 'audio-code' || task.mode !== 'choice'
}

export function TrainingModule({
  unit,
  words,
  scopeLabel,
  moduleId,
  initialWeakWords,
  initialReviewClock,
  initialTrainedWordIds = [],
  initialVariantStateByWordId = {},
  reducedMotion = false,
  startImmediately = false,
  onAttempt,
  onBack,
}: {
  unit: UnitData
  words: UnitWord[]
  scopeLabel: string
  moduleId: TrainingModuleId
  initialWeakWords: Record<string, WeakWordRecord>
  initialReviewClock: number
  initialTrainedWordIds?: string[]
  initialVariantStateByWordId?: Record<string, QuestionVariantState>
  reducedMotion?: boolean
  startImmediately?: boolean
  onAttempt: (attempt: ModuleAttempt) => void
  onBack: () => void
}) {
  const initial = { index: 0, correct: 0, history: [], trainedWordIds: initialTrainedWordIds, variantStateByWordId: initialVariantStateByWordId, weakWords: initialWeakWords }
  const [session, setSession] = useState<Session>({ ...initial, task: buildTask(moduleId, unit, words, initial, initialReviewClock) })
  const [feedback, setFeedback] = useState<{ correct: boolean; weakWords: Record<string, WeakWordRecord> } | null>(null)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(startImmediately)
  const eligible = moduleId === 'repair' ? words.filter(isRepairEligible) : eligibleWords(words, moduleId)

  if (!eligible.length) return <AwaitingContent moduleId={moduleId} onBack={onBack} />
  if (!session.task) return <AwaitingContent moduleId={moduleId} onBack={onBack} />
  if (!started) return <ManualGameIntro config={trainingIntroConfigs[moduleId]} scopeLabel={scopeLabel} reducedMotion={reducedMotion} onStart={() => setStarted(true)} onBack={onBack} />
  if (finished) {
    const coverage = coverageForTrainedWordIds(unit, moduleId, session.trainedWordIds)
    return <ModuleResult title={moduleTitles[moduleId]} correct={session.correct} trained={coverage.trained} total={coverage.total} onBack={onBack} />
  }
  const task = session.task

  const submit = (correct: boolean) => {
    if (feedback) return
    let weakWords = session.weakWords
    weakWords = correct
      ? task.isReview ? recordReviewSuccess(weakWords, unit.id, task.word.id, task.reviewIndex) : weakWords
      : isSpellingTask(task)
        ? recordSpellingMistake(weakWords, unit.id, task.word.id, task.reviewIndex)
        : recordRecognitionMistake(weakWords, unit.id, task.word.id, task.reviewIndex)
    const correctCount = session.correct + Number(correct)
    const sessionCompleted = session.index + 1 >= TRAINING_TASKS_PER_MODULE
    const trainedWordIds = session.trainedWordIds.includes(task.word.id) ? session.trainedWordIds : [...session.trainedWordIds, task.word.id]
    const variantStateByWordId = recordQuestionVariant(session.variantStateByWordId, task.word.id, task.variantId, task.variantDifficulty, correct)
    onAttempt({ unitId: unit.id, moduleId, wordId: task.word.id, correct, weakWords, accuracy: correctCount / (session.index + 1), sessionCompleted, variantId: task.variantId, variantDifficulty: task.variantDifficulty })
    setSession((current) => ({ ...current, correct: correctCount, trainedWordIds, variantStateByWordId, weakWords }))
    setFeedback({ correct, weakWords })
  }

  const continueTraining = () => {
    if (!feedback) return
    if (session.index + 1 >= TRAINING_TASKS_PER_MODULE) {
      setFinished(true)
      return
    }
    const next = { index: session.index + 1, correct: session.correct, history: [...session.history, task.word.id].slice(-4), trainedWordIds: session.trainedWordIds, variantStateByWordId: session.variantStateByWordId, weakWords: feedback.weakWords }
    setSession({ ...next, task: buildTask(moduleId, unit, words, next, initialReviewClock) })
    setFeedback(null)
  }

  return <main className={`training-shell ${moduleId}`}>
    <header className="training-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>{unit.title}</span></button><div><strong>{moduleTitles[moduleId]}</strong><span className="training-scope-badge">{scopeLabel}</span><span>{session.index + 1} / {TRAINING_TASKS_PER_MODULE}</span></div></header>
    <section className="training-stage" style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 36, 62, .84), rgba(5, 36, 62, .35)), url(${moduleImage(moduleId)})` }}>
      <div className="training-panel">
        {session.task.isReview && <span className="review-chip">Lightworld review</span>}
        <TaskPrompt task={task} words={words} onSubmit={submit} />
        {feedback && (feedback.correct
          ? <Feedback correct word={task.word.word} onContinue={continueTraining} isFinal={session.index + 1 >= TRAINING_TASKS_PER_MODULE} errorHunt={task.kind === 'error-hunt'} revealCorrectAnswer={task.kind === 'audio-code'} />
          : <CorrectionPractice answer={task.word.word} acceptedAnswers={[task.word.word, ...(task.word.acceptedForms ?? [])]} onContinue={continueTraining} continueLabel={session.index + 1 >= TRAINING_TASKS_PER_MODULE ? 'See results →' : 'Continue →'} />)}
      </div>
    </section>
  </main>
}

function TaskPrompt({ task, words, onSubmit }: { task: TrainingTask; words: UnitWord[]; onSubmit: (correct: boolean) => void }) {
  if (task.kind === 'repair') return <RepairPrompt key={`${task.index}-${task.word.id}`} task={task} onSubmit={onSubmit} />
  if (task.kind === 'error-hunt') return <ErrorHuntPrompt key={`${task.index}-${task.word.id}`} task={task} onSubmit={onSubmit} />
  return <AudioCodePrompt key={`${task.index}-${task.word.id}`} task={task} words={words} onSubmit={onSubmit} />
}

function RepairPrompt({ task, onSubmit }: { task: RepairTask; onSubmit: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState('')
  // The fallback also lets an open Vite session recover cleanly from a task
  // object created by the previous Repair implementation during hot reload.
  const clue = task.clue ?? repairClueFor(task.word, task.reviewIndex)
  const damaged = task.clue ? task.damaged : damageRepairTarget(task.word.word, task.reviewIndex)
  if (!clue) return null
  return <>
    <p className="eyebrow">Repair the word machine</p><h1>Repair the damaged word</h1>
    <div className="repair-clue"><span>{clue.label}</span><p>{clue.text}</p></div>
    <div className="word-display damaged-word" aria-label="Damaged word">{damaged.split(/\s+/).map((word, index) => <span className="damaged-token" key={`${word}-${index}`}>{word.replaceAll('_', '＿').toUpperCase()}</span>)}</div>
    <SpellingInput value={answer} onChange={setAnswer} onSubmit={() => onSubmit(isAcceptedRepairAnswer(task.word, answer))} label="Type the complete word or phrase" actionLabel="Repair" />
  </>
}

function ErrorHuntPrompt({ task, onSubmit }: { task: ErrorHuntTask; onSubmit: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState('')
  return <>
    <p className="eyebrow">Spelling analyzer</p><h1>Find the spelling error</h1><p className="task-instruction">One word is misspelled. Type it correctly.</p>
    <div className="error-word-holder"><span className="holder-decoration" style={{ backgroundImage: `url(${assets.errorHuntLetterHolders})` }} aria-hidden="true" /><div className="word-display corruption-word">{task.corrupted}</div></div>
    <SpellingInput value={answer} onChange={setAnswer} onSubmit={() => onSubmit(isCorrectErrorHuntAnswer(task.word, answer))} label="Correct spelling" />
  </>
}

export function AudioCodePrompt({ task, words, onSubmit }: { task: AudioTask; words: UnitWord[]; onSubmit: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState('')
  const [chosen, setChosen] = useState<number[]>([])
  const letters = shuffledAudioLetters(task.word.word, task.reviewIndex)
  const selectedLetters = chosen.map((index) => letters[index])
  const assembled = assembledAudioAnswer(task.word.word, selectedLetters)
  const slotGroups = assemblySlotGroups(task.word.word, selectedLetters)
  const assemblyComplete = chosen.length === letters.length
  return <>
    <p className="eyebrow">Audio code chamber</p><h1>Listen, then decode</h1><p className="task-instruction">Play the word and {task.mode === 'choice' ? 'select the matching code.' : 'spell what you hear.'}</p>
    <AudioButton audio={task.word.audio} word={task.word.word} />
    {task.mode === 'choice' && <div className="answer-options word-options">{task.choices?.map((choice) => <button key={choice} type="button" onClick={() => onSubmit(normalize(choice) === normalize(task.word.word))}>{choice}</button>)}</div>}
    {task.mode === 'assemble' && <><div className="assembled-word" aria-label="Your assembled answer">{slotGroups.map((slots, wordIndex) => <span className="answer-slot-group" key={wordIndex}>{slots.map((letter, slotIndex) => <span className={`answer-slot ${letter ? 'filled' : ''}`} key={slotIndex}>{letter?.toUpperCase() || '\u00a0'}</span>)}</span>)}</div><div className="letter-tiles" aria-label="Shuffled letter tiles">{letters.map((letter, index) => <button type="button" key={`${letter}-${index}`} disabled={chosen.includes(index)} onClick={() => setChosen((current) => [...current, index])}>{letter.toUpperCase()}</button>)}</div><div className="inline-actions"><button type="button" className="secondary-button" onClick={() => setChosen([])}>Clear</button><button type="button" className="primary-button compact" onClick={() => onSubmit(normalize(assembled) === normalize(task.word.word))} disabled={!assemblyComplete}>Decode</button></div></>}
    {task.mode === 'type' && <SpellingInput value={answer} onChange={setAnswer} onSubmit={() => onSubmit(normalize(answer) === normalize(task.word.word))} label="Type the word you heard" />}
  </>
}

function SpellingInput({ value, onChange, onSubmit, label, actionLabel = 'Check code' }: { value: string; onChange: (value: string) => void; onSubmit: () => void; label: string; actionLabel?: string }) {
  return <form className="spelling-form" onSubmit={(event) => { event.preventDefault(); onSubmit() }}><label>{label}<input autoFocus value={value} onChange={(event) => onChange(event.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></label><button className="primary-button compact" type="submit" disabled={!value.trim()}>{actionLabel}</button></form>
}

function AudioButton({ audio, word }: { audio?: string; word: string }) {
  const { play, playing, unavailable } = useVocabularyAudio(audio, word, { autoPlayOnce: true })
  return <div className="audio-control"><button type="button" className={`audio-button ${playing ? 'is-listening' : ''}`} onClick={play}><span aria-hidden="true">◖</span>{playing ? 'Listening…' : 'Play audio'}</button>{unavailable && <small role="status">Audio could not play. Try again.</small>}</div>
}

export function Feedback({ correct, word, onContinue, isFinal, errorHunt, revealCorrectAnswer = false }: { correct: boolean; word: string; onContinue: () => void; isFinal: boolean; errorHunt: boolean; revealCorrectAnswer?: boolean }) {
  useEnterAction(onContinue)

  return <div className={`task-feedback ${correct ? 'correct' : 'incorrect'}`} role="status">{errorHunt && <span className="effect-decoration" style={{ backgroundImage: `url(${assets.errorHuntEffects})` }} aria-hidden="true" />}<strong>{correct ? 'Code restored!' : 'Almost — the correct code is shown.'}</strong>{(!correct || revealCorrectAnswer) && <span>{word}</span>}<button className="primary-button compact" type="button" onClick={onContinue} aria-keyshortcuts="Enter" data-enter-action>{isFinal ? 'See results' : 'Continue'} →</button></div>
}

function AwaitingContent({ moduleId, onBack }: { moduleId: TrainingModuleId; onBack: () => void }) {
  useEnterAction(onBack)
  const audio = moduleId === 'audio-code'
  return <main className="training-shell awaiting-shell"><header className="training-topbar"><button className="back-button" type="button" onClick={onBack}>← <span>Unit hub</span></button></header><section className="awaiting-card"><p className="eyebrow">Content pending</p><h1>{moduleTitles[moduleId]} is preparing</h1><p>{audio ? 'This unit needs vocabulary with audio before this listening station can open.' : 'This unit needs its vocabulary list before this training station can open.'}</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}

export function ModuleResult({ title, correct, trained, total, onBack }: { title: string; correct: number; trained: number; total: number; onBack: () => void }) {
  useEnterAction(onBack)
  const accuracy = Math.round((correct / TRAINING_TASKS_PER_MODULE) * 100)
  const complete = total > 0 && trained === total
  return <main className="training-shell awaiting-shell"><section className="awaiting-card result-card"><p className="eyebrow">Practice session complete</p><h1>{complete ? `${title} complete` : `${title} session finished`}</h1><div className="result-score">{accuracy}%</div><p>{correct} of {TRAINING_TASKS_PER_MODULE} tasks solved · {trained} / {total} words trained overall. {complete ? 'This station is now active.' : 'Your coverage is saved for the next session.'}</p><button className="primary-button" type="button" onClick={onBack} aria-keyshortcuts="Enter" data-enter-action>Return to unit</button></section></main>
}
