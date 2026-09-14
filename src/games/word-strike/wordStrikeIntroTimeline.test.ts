import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWordStrikeIntroTimeline, WORD_STRIKE_INTRO_ENTER_MS, WORD_STRIKE_INTRO_EXIT_MS, WORD_STRIKE_INTRO_WINK_MS, type WordStrikeIntroPhase } from './wordStrikeIntroTimeline'

afterEach(() => vi.useRealTimers())

describe('Word Strike intro timeline', () => {
  it('waits for Next after every phrase, then runs the wink-to-ready sequence', () => {
    vi.useFakeTimers()
    const phases: WordStrikeIntroPhase[] = ['enter']
    const timeline = createWordStrikeIntroTimeline({ onPhase: (phase) => phases.push(phase) })
    timeline.start()
    vi.advanceTimersByTime(WORD_STRIKE_INTRO_ENTER_MS)
    expect(phases).toEqual(['enter', 'greeting'])
    vi.advanceTimersByTime(10_000)
    expect(phases).toEqual(['enter', 'greeting'])
    timeline.advance('greeting')
    expect(phases.at(-1)).toBe('message')
    timeline.advance('greeting')
    expect(phases.at(-1)).toBe('message')
    timeline.advance('message')
    expect(phases.at(-1)).toBe('call')
    timeline.advance('call')
    expect(phases.at(-1)).toBe('wink')
    vi.advanceTimersByTime(WORD_STRIKE_INTRO_WINK_MS)
    expect(phases.at(-1)).toBe('exit')
    vi.advanceTimersByTime(WORD_STRIKE_INTRO_EXIT_MS)
    expect(phases.at(-1)).toBe('ready')
  })

  it('skip finishes at ready without starting gameplay or leaving stale timers', () => {
    vi.useFakeTimers()
    const phases: WordStrikeIntroPhase[] = []
    const timeline = createWordStrikeIntroTimeline({ onPhase: (phase) => phases.push(phase) })
    timeline.start()
    vi.advanceTimersByTime(WORD_STRIKE_INTRO_ENTER_MS)
    timeline.finish()
    expect(phases.at(-1)).toBe('ready')
    const phaseCount = phases.length
    vi.runAllTimers()
    expect(phases).toHaveLength(phaseCount)
  })

  it('ignores Next before a phrase and during the closing sequence', () => {
    vi.useFakeTimers()
    const phases: WordStrikeIntroPhase[] = ['enter']
    const timeline = createWordStrikeIntroTimeline({ onPhase: (phase) => phases.push(phase) })
    timeline.start()
    timeline.advance()
    expect(phases).toEqual(['enter'])
    vi.advanceTimersByTime(WORD_STRIKE_INTRO_ENTER_MS)
    timeline.advance()
    timeline.advance()
    timeline.advance()
    timeline.advance()
    expect(phases.at(-1)).toBe('wink')
  })

  it('cleans every pending transition on unmount', () => {
    vi.useFakeTimers()
    const onPhase = vi.fn()
    const timeline = createWordStrikeIntroTimeline({ onPhase })
    timeline.start()
    timeline.dispose()
    vi.runAllTimers()
    expect(onPhase).not.toHaveBeenCalled()
  })
})
