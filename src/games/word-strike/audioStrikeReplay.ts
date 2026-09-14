export const AUDIO_STRIKE_INITIAL_DELAY_MS = 1500
export const AUDIO_STRIKE_REPLAY_INTERVAL_MS = 7000

type TimerHandle = ReturnType<typeof setTimeout>

export type AudioStrikeReplayLifecycle = {
  start: () => void
  replayNow: () => void
  pause: () => void
  resume: () => void
  answer: () => void
  dispose: () => void
}

export function createAudioStrikeReplayLifecycle({
  play,
  stop,
  schedule = setTimeout,
  cancel = clearTimeout,
}: {
  play: () => void
  stop: () => void
  schedule?: (callback: () => void, delay: number) => TimerHandle
  cancel?: (handle: TimerHandle) => void
}): AudioStrikeReplayLifecycle {
  let timer: TimerHandle | null = null
  let active = false
  let paused = false

  const clearTimer = () => {
    if (timer !== null) cancel(timer)
    timer = null
  }

  const schedulePlayback = (delay: number) => {
    clearTimer()
    if (!active || paused) return
    timer = schedule(() => {
      timer = null
      if (!active || paused) return
      play()
      schedulePlayback(AUDIO_STRIKE_REPLAY_INTERVAL_MS)
    }, delay)
  }

  return {
    start() {
      active = true
      paused = false
      schedulePlayback(AUDIO_STRIKE_INITIAL_DELAY_MS)
    },
    replayNow() {
      if (!active || paused) return
      clearTimer()
      play()
      schedulePlayback(AUDIO_STRIKE_REPLAY_INTERVAL_MS)
    },
    pause() {
      paused = true
      clearTimer()
      stop()
    },
    resume() {
      if (!active) return
      paused = false
      schedulePlayback(AUDIO_STRIKE_INITIAL_DELAY_MS)
    },
    answer() {
      active = false
      clearTimer()
      stop()
    },
    dispose() {
      active = false
      clearTimer()
      stop()
    },
  }
}
