import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CorrectionPractice, evaluateCorrectionAttempt, isCorrectionAnswerAccepted, MAX_CORRECTION_ATTEMPTS } from './CorrectionPractice'

describe('mistake correction practice', () => {
  it('accepts capitalization, spacing, curly apostrophes, and supplied answer forms', () => {
    expect(isCorrectionAnswerAccepted('  What’s   the matter? ', ["What's the matter?"])).toBe(true)
    expect(isCorrectionAnswerAccepted('mountains', ['mountain', 'mountains'])).toBe(true)
    expect(isCorrectionAnswerAccepted('mountan', ['mountain', 'mountains'])).toBe(false)
  })

  it('requires another try until the answer is correct or five correction attempts are used', () => {
    expect(evaluateCorrectionAttempt('wrong', ['right'], 0)).toEqual({ attemptsUsed: 1, status: 'retry' })
    expect(evaluateCorrectionAttempt('right', ['right'], 2)).toEqual({ attemptsUsed: 3, status: 'corrected' })
    expect(evaluateCorrectionAttempt('wrong', ['right'], MAX_CORRECTION_ATTEMPTS - 1)).toEqual({ attemptsUsed: 5, status: 'exhausted' })
  })

  it('shows the correct answer, the five-attempt counter, and an Enter-ready input', () => {
    const html = renderToStaticMarkup(<CorrectionPractice answer="secret phrase" onContinue={vi.fn()} />)
    expect(html).toContain('Fix the mistake')
    expect(html).toContain('<output>secret phrase</output>')
    expect(html).toContain('Correction attempt 1 of 5')
    expect(html).toContain('<input autofocus=""')
    expect(html).toContain('>Check</button>')
  })
})
