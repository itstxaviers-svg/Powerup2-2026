const visibleLetters = (target: string) => [...target].filter((character) => !/\s/u.test(character))

export function shuffledAudioLetters(target: string, seed: number): string[] {
  const canonical = visibleLetters(target)
  if (canonical.length < 2 || new Set(canonical).size < 2) return canonical

  const shuffled = [...canonical]
  let state = ((seed + 1) * 0x9e3779b1 ^ canonical.length) >>> 0
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  if (shuffled.every((letter, index) => letter === canonical[index])) {
    const differentIndex = shuffled.findIndex((letter) => letter !== shuffled[0])
    ;[shuffled[0], shuffled[differentIndex]] = [shuffled[differentIndex], shuffled[0]]
  }
  return shuffled
}

export function audioAnswerWordLengths(target: string): number[] {
  return target.trim().split(/\s+/u).filter(Boolean).map((word) => [...word].length)
}

export function assemblySlotGroups(target: string, selectedLetters: string[]): Array<Array<string | null>> {
  let selectedIndex = 0
  return audioAnswerWordLengths(target).map((length) => Array.from({ length }, () => selectedLetters[selectedIndex++] ?? null))
}

export function assembledAudioAnswer(target: string, selectedLetters: string[]): string {
  let selectedIndex = 0
  return audioAnswerWordLengths(target)
    .map((length) => selectedLetters.slice(selectedIndex, selectedIndex += length).join(''))
    .join(' ')
}
