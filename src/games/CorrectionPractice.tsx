import { useState, type FormEvent } from 'react'
import { useEnterAction } from './useEnterAction'

export const MAX_CORRECTION_ATTEMPTS = 5

export type CorrectionAttemptResult = {
  attemptsUsed: number
  status: 'retry' | 'corrected' | 'exhausted'
}

const normalizeCorrectionAnswer = (value: string) => value
  .normalize('NFKC')
  .trim()
  .toLocaleLowerCase()
  .replace(/[’]/gu, "'")
  .replace(/\s+/gu, ' ')

export const isCorrectionAnswerAccepted = (answer: string, acceptedAnswers: readonly string[]) => {
  const normalized = normalizeCorrectionAnswer(answer)
  return Boolean(normalized) && acceptedAnswers.some((candidate) => normalizeCorrectionAnswer(candidate) === normalized)
}

export function evaluateCorrectionAttempt(
  answer: string,
  acceptedAnswers: readonly string[],
  attemptsUsed: number,
  maximumAttempts = MAX_CORRECTION_ATTEMPTS,
): CorrectionAttemptResult {
  const nextAttemptsUsed = Math.min(maximumAttempts, attemptsUsed + 1)
  if (isCorrectionAnswerAccepted(answer, acceptedAnswers)) return { attemptsUsed: nextAttemptsUsed, status: 'corrected' }
  return { attemptsUsed: nextAttemptsUsed, status: nextAttemptsUsed >= maximumAttempts ? 'exhausted' : 'retry' }
}

export function CorrectionPractice({
  answer,
  acceptedAnswers = [answer],
  onContinue,
  continueLabel = 'Continue →',
  className = '',
}: {
  answer: string
  acceptedAnswers?: readonly string[]
  onContinue: () => void
  continueLabel?: string
  className?: string
}) {
  const [typedAnswer, setTypedAnswer] = useState('')
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [status, setStatus] = useState<CorrectionAttemptResult['status'] | 'active'>('active')
  const finished = status === 'corrected' || status === 'exhausted'
  useEnterAction(onContinue, finished)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!typedAnswer.trim() || finished) return
    const result = evaluateCorrectionAttempt(typedAnswer, acceptedAnswers, attemptsUsed)
    setAttemptsUsed(result.attemptsUsed)
    setStatus(result.status)
    if (result.status === 'retry') setTypedAnswer('')
  }

  return <div className={`correction-practice ${finished ? `is-${status}` : ''} ${className}`.trim()} role="status">
    <p className="correction-kicker">Fix the mistake</p>
    <strong>Correct answer</strong>
    <output>{answer}</output>
    {!finished ? <form onSubmit={submit}>
      <label><span>Type the correct answer to continue</span><input autoFocus value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} /></label>
      <button className="primary-button compact" type="submit" disabled={!typedAnswer.trim()}>Check</button>
      <small>Correction attempt {attemptsUsed + 1} of {MAX_CORRECTION_ATTEMPTS}</small>
      {status === 'retry' && <em>Not quite. Copy the answer exactly and try again.</em>}
    </form> : <div className="correction-complete">
      <span>{status === 'corrected' ? 'Corrected! This word will still return in review.' : 'Five tries used. This word will return in review.'}</span>
      <button className="primary-button compact" type="button" onClick={onContinue} aria-keyshortcuts="Enter" data-enter-action>{continueLabel}</button>
    </div>}
  </div>
}
