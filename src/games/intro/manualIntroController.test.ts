import { afterEach, describe, expect, it, vi } from 'vitest'
import { createManualIntroController, MANUAL_INTRO_ENTER_MS, MANUAL_INTRO_NEXT_DELAY_MS, type ManualIntroState } from './manualIntroController'

afterEach(() => vi.useRealTimers())

describe('manual mentor intro controller', () => {
  it('holds every phrase until Next and unlocks it after exactly 650 ms', () => {
    vi.useFakeTimers()
    const states: ManualIntroState[] = []
    const controller = createManualIntroController({ stepCount: 3, onState: (state) => states.push(state) })
    controller.start()
    vi.advanceTimersByTime(MANUAL_INTRO_ENTER_MS)
    expect(states.at(-1)).toEqual({ phase: 'dialogue', stepIndex: 0, canAdvance: false })
    vi.advanceTimersByTime(MANUAL_INTRO_NEXT_DELAY_MS - 1)
    expect(states.at(-1)?.canAdvance).toBe(false)
    vi.advanceTimersByTime(1)
    expect(states.at(-1)?.canAdvance).toBe(true)
    vi.advanceTimersByTime(10_000)
    expect(states.at(-1)?.stepIndex).toBe(0)

    controller.advance(0)
    expect(states.at(-1)).toEqual({ phase: 'dialogue', stepIndex: 1, canAdvance: false })
    vi.advanceTimersByTime(MANUAL_INTRO_NEXT_DELAY_MS)
    expect(states.at(-1)?.canAdvance).toBe(true)
  })

  it('accepts one step per click and rejects a stale double click', () => {
    vi.useFakeTimers()
    const states: ManualIntroState[] = []
    const controller = createManualIntroController({ stepCount: 3, onState: (state) => states.push(state) })
    controller.start()
    vi.advanceTimersByTime(MANUAL_INTRO_ENTER_MS + MANUAL_INTRO_NEXT_DELAY_MS)
    controller.advance(0)
    controller.advance(0)
    expect(states.at(-1)?.stepIndex).toBe(1)
    expect(states.at(-1)?.canAdvance).toBe(false)
  })

  it('skip cancels timers and moves only to ready', () => {
    vi.useFakeTimers()
    const states: ManualIntroState[] = []
    const controller = createManualIntroController({ stepCount: 4, onState: (state) => states.push(state) })
    controller.start()
    controller.finish()
    expect(states).toEqual([{ phase: 'ready', stepIndex: 3, canAdvance: false }])
    vi.runAllTimers()
    expect(states).toHaveLength(1)
  })

  it('cleans pending entrance and Next timers on unmount', () => {
    vi.useFakeTimers()
    const onState = vi.fn()
    const entrance = createManualIntroController({ stepCount: 3, onState })
    entrance.start()
    entrance.dispose()
    vi.runAllTimers()
    expect(onState).not.toHaveBeenCalled()

    const dialogue = createManualIntroController({ stepCount: 3, onState })
    dialogue.start()
    vi.advanceTimersByTime(MANUAL_INTRO_ENTER_MS)
    dialogue.dispose()
    const callCount = onState.mock.calls.length
    vi.runAllTimers()
    expect(onState).toHaveBeenCalledTimes(callCount)
  })
})
