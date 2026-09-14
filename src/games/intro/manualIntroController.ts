export type ManualIntroState = {
  phase: 'enter' | 'dialogue' | 'ready'
  stepIndex: number
  canAdvance: boolean
}

export const MANUAL_INTRO_ENTER_MS = 700
export const MANUAL_INTRO_NEXT_DELAY_MS = 650

export function createManualIntroController({ stepCount, onState }: { stepCount: number; onState: (state: ManualIntroState) => void }) {
  let state: ManualIntroState = { phase: 'enter', stepIndex: 0, canAdvance: false }
  let timer: ReturnType<typeof setTimeout> | undefined
  let started = false
  let stopped = false

  const clear = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }
  const emit = (next: ManualIntroState) => {
    if (stopped) return
    state = next
    onState(next)
  }
  const scheduleUnlock = () => {
    clear()
    timer = setTimeout(() => {
      timer = undefined
      if (state.phase === 'dialogue') emit({ ...state, canAdvance: true })
    }, MANUAL_INTRO_NEXT_DELAY_MS)
  }

  return {
    start() {
      if (stopped || started || stepCount < 1) return
      started = true
      timer = setTimeout(() => {
        timer = undefined
        emit({ phase: 'dialogue', stepIndex: 0, canAdvance: false })
        scheduleUnlock()
      }, MANUAL_INTRO_ENTER_MS)
    },
    advance(expectedStepIndex: number) {
      if (stopped || state.phase !== 'dialogue' || !state.canAdvance || state.stepIndex !== expectedStepIndex) return
      clear()
      if (state.stepIndex >= stepCount - 1) {
        emit({ phase: 'ready', stepIndex: state.stepIndex, canAdvance: false })
        return
      }
      emit({ phase: 'dialogue', stepIndex: state.stepIndex + 1, canAdvance: false })
      scheduleUnlock()
    },
    finish() {
      if (stopped) return
      clear()
      emit({ phase: 'ready', stepIndex: Math.max(0, stepCount - 1), canAdvance: false })
    },
    dispose() {
      stopped = true
      clear()
    },
  }
}
