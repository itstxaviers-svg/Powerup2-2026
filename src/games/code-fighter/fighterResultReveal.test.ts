import { afterEach, describe, expect, it, vi } from 'vitest'
import { ENEMY_RESULT_REVEAL_MS } from './fighterChoreography'
import { createFighterResultReveal } from './fighterResultReveal'

afterEach(() => vi.useRealTimers())

describe('enemy victory result reveal', () => {
  it('reveals reserved art only after the stabilized result delay', () => {
    vi.useFakeTimers()
    const reveal = vi.fn()
    const gate = createFighterResultReveal({ delayMs: ENEMY_RESULT_REVEAL_MS, onReveal: reveal })
    gate.start()
    vi.advanceTimersByTime(ENEMY_RESULT_REVEAL_MS - 1)
    expect(reveal).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(reveal).toHaveBeenCalledTimes(1)
  })
})
