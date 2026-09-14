export function createFighterResultReveal({ delayMs, onReveal }: { delayMs: number; onReveal: () => void }) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    start() {
      if (timer !== undefined) return
      timer = setTimeout(() => {
        timer = undefined
        onReveal()
      }, delayMs)
    },
    dispose() {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    },
  }
}
