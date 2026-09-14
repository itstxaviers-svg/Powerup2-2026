export const AUDIO_TASK_AUTOPLAY_DELAY_MS = 450

type TimerHandle = ReturnType<typeof setTimeout>

export type AudioAutoplayOnceLifecycle = {
  start: () => void
  replayNow: () => void
  pause: () => void
  resume: () => void
  dispose: () => void
}

export function createAudioAutoplayOnceLifecycle({
  play,
  stop,
  delay = AUDIO_TASK_AUTOPLAY_DELAY_MS,
  schedule = setTimeout,
  cancel = clearTimeout,
}: {
  play: () => void
  stop: () => void
  delay?: number
  schedule?: (callback: () => void, delay: number) => TimerHandle
  cancel?: (handle: TimerHandle) => void
}): AudioAutoplayOnceLifecycle {
  let timer: TimerHandle | null = null
  let active = false
  let paused = false
  let automaticPlayConsumed = false

  const clearTimer = () => {
    if (timer !== null) cancel(timer)
    timer = null
  }

  const scheduleFirstPlay = () => {
    clearTimer()
    if (!active || paused || automaticPlayConsumed) return
    timer = schedule(() => {
      timer = null
      if (!active || paused || automaticPlayConsumed) return
      automaticPlayConsumed = true
      play()
    }, delay)
  }

  return {
    start() {
      active = true
      paused = false
      scheduleFirstPlay()
    },
    replayNow() {
      if (paused) return
      active = true
      automaticPlayConsumed = true
      clearTimer()
      play()
    },
    pause() {
      paused = true
      clearTimer()
      stop()
    },
    resume() {
      if (!active) return
      paused = false
      scheduleFirstPlay()
    },
    dispose() {
      active = false
      clearTimer()
      stop()
    },
  }
}
