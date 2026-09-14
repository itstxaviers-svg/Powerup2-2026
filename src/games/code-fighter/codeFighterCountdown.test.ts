import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAnswerCountdown } from './codeFighterCountdown'

afterEach(() => vi.useRealTimers())

describe('Code Fighter answer countdown', () => {
  it('times out once at the configured limit and stops itself', () => {
    vi.useFakeTimers()
    const onTick = vi.fn()
    const onTimeout = vi.fn()
    const countdown = createAnswerCountdown({ durationMs: 7000, tickMs: 100, onTick, onTimeout })
    countdown.start()

    vi.advanceTimersByTime(6900)
    expect(onTimeout).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onTick).toHaveBeenLastCalledWith(0)
    expect(onTimeout).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(7000)
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('cancels without allowing an old timeout into the next exchange', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const countdown = createAnswerCountdown({ durationMs: 5000, tickMs: 100, onTick: vi.fn(), onTimeout })
    countdown.start()
    vi.advanceTimersByTime(2000)
    countdown.dispose()
    vi.runAllTimers()
    expect(onTimeout).not.toHaveBeenCalled()
  })
})
