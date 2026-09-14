import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUDIO_STRIKE_INITIAL_DELAY_MS, AUDIO_STRIKE_REPLAY_INTERVAL_MS, createAudioStrikeReplayLifecycle } from './audioStrikeReplay'

describe('Audio Strike replay lifecycle', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('waits 1.5 seconds before first play and then replays every 7 seconds', () => {
    const play = vi.fn()
    const lifecycle = createAudioStrikeReplayLifecycle({ play, stop: vi.fn() })
    lifecycle.start()

    vi.advanceTimersByTime(AUDIO_STRIKE_INITIAL_DELAY_MS - 1)
    expect(play).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(play).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(AUDIO_STRIKE_REPLAY_INTERVAL_MS)
    expect(play).toHaveBeenCalledTimes(2)
    lifecycle.dispose()
  })

  it('manual replay safely resets the next automatic countdown', () => {
    const play = vi.fn()
    const lifecycle = createAudioStrikeReplayLifecycle({ play, stop: vi.fn() })
    lifecycle.start()
    vi.advanceTimersByTime(800)
    lifecycle.replayNow()
    expect(play).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(AUDIO_STRIKE_REPLAY_INTERVAL_MS - 1)
    expect(play).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(play).toHaveBeenCalledTimes(2)
    lifecycle.dispose()
  })

  it('cleans up timers and playback on answer, hidden state and unmount', () => {
    const play = vi.fn()
    const stop = vi.fn()
    const lifecycle = createAudioStrikeReplayLifecycle({ play, stop })
    lifecycle.start()
    lifecycle.pause()
    vi.runOnlyPendingTimers()
    expect(play).not.toHaveBeenCalled()
    expect(stop).toHaveBeenCalledTimes(1)

    lifecycle.resume()
    vi.advanceTimersByTime(AUDIO_STRIKE_INITIAL_DELAY_MS)
    expect(play).toHaveBeenCalledTimes(1)
    lifecycle.answer()
    vi.runOnlyPendingTimers()
    expect(play).toHaveBeenCalledTimes(1)
    expect(stop).toHaveBeenCalledTimes(2)

    lifecycle.dispose()
    expect(stop).toHaveBeenCalledTimes(3)
  })
})
