export type WordStrikeIntroPhase = 'enter' | 'greeting' | 'message' | 'call' | 'wink' | 'exit' | 'ready'

export const WORD_STRIKE_INTRO_ENTER_MS = 700
export const WORD_STRIKE_INTRO_WINK_MS = 1100
export const WORD_STRIKE_INTRO_EXIT_MS = 650

export function createWordStrikeIntroTimeline({ onPhase }: { onPhase: (phase: WordStrikeIntroPhase) => void }) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let phase: WordStrikeIntroPhase = 'enter'
  let started = false
  let stopped = false

  const clear = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }
  const changePhase = (nextPhase: WordStrikeIntroPhase) => {
    if (stopped) return
    phase = nextPhase
    onPhase(nextPhase)
  }
  const scheduleClosingSequence = () => {
    timer = setTimeout(() => {
      timer = undefined
      changePhase('exit')
      timer = setTimeout(() => {
        timer = undefined
        changePhase('ready')
      }, WORD_STRIKE_INTRO_EXIT_MS)
    }, WORD_STRIKE_INTRO_WINK_MS)
  }

  return {
    start() {
      if (stopped || started) return
      started = true
      timer = setTimeout(() => {
        timer = undefined
        changePhase('greeting')
      }, WORD_STRIKE_INTRO_ENTER_MS)
    },
    advance(expectedPhase?: WordStrikeIntroPhase) {
      if (stopped) return
      if (expectedPhase && phase !== expectedPhase) return
      if (phase === 'greeting') changePhase('message')
      else if (phase === 'message') changePhase('call')
      else if (phase === 'call') {
        changePhase('wink')
        scheduleClosingSequence()
      }
    },
    finish() {
      if (stopped) return
      clear()
      changePhase('ready')
    },
    dispose() {
      stopped = true
      clear()
    },
  }
}
