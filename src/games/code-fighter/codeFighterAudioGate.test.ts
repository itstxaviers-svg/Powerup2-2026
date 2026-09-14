import { afterEach, describe, expect, it, vi } from 'vitest'
import { CODE_FIGHTER_AUDIO_DELAY_MS, createCodeFighterAudioGate } from './codeFighterAudioGate'

afterEach(() => vi.useRealTimers())

describe('Code Fighter audio gate', () => {
  it('starts the answer window only after delayed audio playback is invoked', () => {
    vi.useFakeTimers()
    const play = vi.fn()
    const ready = vi.fn()
    const gate = createCodeFighterAudioGate({ play, onFirstPlay: ready })
    gate.start()

    vi.advanceTimersByTime(CODE_FIGHTER_AUDIO_DELAY_MS - 1)
    expect(play).not.toHaveBeenCalled()
    expect(ready).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(play).toHaveBeenCalledTimes(1)
    expect(ready).toHaveBeenCalledTimes(1)
  })

  it('allows replay without restarting the answer window and cleans pending autoplay', () => {
    vi.useFakeTimers()
    const play = vi.fn()
    const ready = vi.fn()
    const gate = createCodeFighterAudioGate({ play, onFirstPlay: ready })

    gate.start()
    gate.playNow()
    gate.playNow()
    vi.runAllTimers()
    expect(play).toHaveBeenCalledTimes(2)
    expect(ready).toHaveBeenCalledTimes(1)

    const disposedPlay = vi.fn()
    const disposedGate = createCodeFighterAudioGate({ play: disposedPlay, onFirstPlay: vi.fn() })
    disposedGate.start()
    disposedGate.dispose()
    vi.runAllTimers()
    expect(disposedPlay).not.toHaveBeenCalled()
  })
})
