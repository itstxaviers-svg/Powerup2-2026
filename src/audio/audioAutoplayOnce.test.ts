import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUDIO_TASK_AUTOPLAY_DELAY_MS, createAudioAutoplayOnceLifecycle } from './audioAutoplayOnce'

describe('one-time task audio autoplay', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('plays once after the task-ready delay and never repeats automatically', () => {
    const play = vi.fn()
    const lifecycle = createAudioAutoplayOnceLifecycle({ play, stop: vi.fn() })
    lifecycle.start()

    vi.advanceTimersByTime(AUDIO_TASK_AUTOPLAY_DELAY_MS - 1)
    expect(play).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(play).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(30_000)
    expect(play).toHaveBeenCalledTimes(1)
    lifecycle.dispose()
  })

  it('treats an early manual replay as the first play and cancels pending autoplay', () => {
    const play = vi.fn()
    const lifecycle = createAudioAutoplayOnceLifecycle({ play, stop: vi.fn() })
    lifecycle.start()
    lifecycle.replayNow()

    expect(play).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(AUDIO_TASK_AUTOPLAY_DELAY_MS * 2)
    expect(play).toHaveBeenCalledTimes(1)
    lifecycle.replayNow()
    expect(play).toHaveBeenCalledTimes(2)
    lifecycle.dispose()
  })

  it('allows manual playback while the page-load trigger is still pending', () => {
    const play = vi.fn()
    const lifecycle = createAudioAutoplayOnceLifecycle({ play, stop: vi.fn() })

    lifecycle.replayNow()
    expect(play).toHaveBeenCalledTimes(1)
    lifecycle.start()
    vi.advanceTimersByTime(AUDIO_TASK_AUTOPLAY_DELAY_MS)
    expect(play).toHaveBeenCalledTimes(1)
    lifecycle.dispose()
  })

  it('pauses before playback and cleans up without leaving a delayed sound', () => {
    const play = vi.fn()
    const stop = vi.fn()
    const lifecycle = createAudioAutoplayOnceLifecycle({ play, stop })
    lifecycle.start()
    lifecycle.pause()
    vi.runOnlyPendingTimers()
    expect(play).not.toHaveBeenCalled()

    lifecycle.resume()
    vi.advanceTimersByTime(AUDIO_TASK_AUTOPLAY_DELAY_MS)
    expect(play).toHaveBeenCalledTimes(1)
    lifecycle.dispose()
    vi.runOnlyPendingTimers()
    expect(play).toHaveBeenCalledTimes(1)
    expect(stop).toHaveBeenCalledTimes(2)
  })
})
