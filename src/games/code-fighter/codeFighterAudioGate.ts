export const CODE_FIGHTER_AUDIO_DELAY_MS = 450

export type CodeFighterAudioGate = {
  start: () => void
  playNow: () => void
  dispose: () => void
}

export function createCodeFighterAudioGate({ play, onFirstPlay, delay = CODE_FIGHTER_AUDIO_DELAY_MS }: {
  play: () => void
  onFirstPlay: () => void
  delay?: number
}): CodeFighterAudioGate {
  let timer: ReturnType<typeof setTimeout> | undefined
  let disposed = false
  let firstPlayStarted = false

  const run = () => {
    if (disposed) return
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    play()
    if (!firstPlayStarted) {
      firstPlayStarted = true
      onFirstPlay()
    }
  }

  return {
    start() {
      if (disposed || firstPlayStarted || timer !== undefined) return
      timer = setTimeout(run, delay)
    },
    playNow: run,
    dispose() {
      disposed = true
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    },
  }
}
