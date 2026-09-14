export type AnswerCountdown = {
  start: () => void
  dispose: () => void
}

export function createAnswerCountdown({ durationMs, tickMs, onTick, onTimeout }: {
  durationMs: number
  tickMs: number
  onTick: (remainingMs: number) => void
  onTimeout: () => void
}): AnswerCountdown {
  let timer: ReturnType<typeof setInterval> | undefined
  let remainingMs = durationMs
  let finished = false

  const dispose = () => {
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
  }

  return {
    start() {
      if (timer !== undefined || finished) return
      onTick(remainingMs)
      timer = setInterval(() => {
        remainingMs = Math.max(0, remainingMs - tickMs)
        onTick(remainingMs)
        if (remainingMs === 0) {
          finished = true
          dispose()
          onTimeout()
        }
      }, tickMs)
    },
    dispose,
  }
}
