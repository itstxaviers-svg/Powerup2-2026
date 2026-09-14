import type { UnitWord } from '../../types/game'

export type RepairClue = {
  type: 'definition' | 'example' | 'translation'
  label: 'Definition' | 'In a sentence' | 'Russian meaning'
  text: string
}

const isLetter = (character: string) => /[a-z]/i.test(character)
const normalize = (value: string) => value.trim().toLocaleLowerCase()

type LexicalWord = { positions: number[] }

function lexicalWords(characters: string[]): LexicalWord[] {
  const words: LexicalWord[] = []
  let current: number[] = []
  characters.forEach((character, position) => {
    if (isLetter(character)) {
      current.push(position)
      return
    }
    if (current.length) words.push({ positions: current })
    current = []
  })
  if (current.length) words.push({ positions: current })
  return words
}

const rotate = <T,>(values: T[], offset: number) => {
  if (!values.length) return values
  const shift = ((offset % values.length) + values.length) % values.length
  return [...values.slice(shift), ...values.slice(0, shift)]
}

export function damageRepairTarget(target: string, encounterIndex: number, difficulty: 1 | 2 | 3 = 2): string {
  const characters = [...target]
  const words = lexicalWords(characters)
  const letterCount = words.reduce((count, word) => count + word.positions.length, 0)
  const capacity = words.reduce((count, word) => count + Math.max(0, word.positions.length - 1), 0)
  if (!letterCount || !capacity) return target

  const missingRatio = difficulty === 1 ? .2 : difficulty === 2 ? .3 : .4
  const missingCount = Math.min(capacity, Math.max(1, Math.round(letterCount * missingRatio)))
  const preferredWords = [...words].sort((left, right) => right.positions.length - left.positions.length)
  const internalCandidates = preferredWords.map((word, wordIndex) =>
    rotate(word.positions.slice(1, -1), encounterIndex + wordIndex),
  )
  const edgeCandidates = preferredWords.map((word, wordIndex) =>
    rotate([word.positions.at(-1)!, word.positions[0]], encounterIndex + wordIndex).filter((position, index, values) => values.indexOf(position) === index),
  )
  const hidden = new Set<number>()

  const takeDistributed = (candidateGroups: number[][]) => {
    const maximumDepth = Math.max(0, ...candidateGroups.map((group) => group.length))
    for (let depth = 0; depth < maximumDepth && hidden.size < missingCount; depth += 1) {
      rotate(candidateGroups, encounterIndex + depth).forEach((group) => {
        if (hidden.size >= missingCount) return
        const position = group[depth]
        if (position === undefined) return
        const owner = words.find((word) => word.positions.includes(position))!
        const alreadyHidden = owner.positions.filter((candidate) => hidden.has(candidate)).length
        if (alreadyHidden < owner.positions.length - 1) hidden.add(position)
      })
    }
  }

  takeDistributed(internalCandidates)
  takeDistributed(edgeCandidates)
  return characters.map((character, position) => hidden.has(position) ? '_' : character).join('')
}

export function repairClueFor(word: UnitWord, encounterIndex: number): RepairClue | null {
  const clues: RepairClue[] = [
    word.definition?.trim() ? { type: 'definition', label: 'Definition', text: word.definition.trim() } : null,
    word.example?.trim() ? { type: 'example', label: 'In a sentence', text: word.example.trim() } : null,
    word.translation?.trim() ? { type: 'translation', label: 'Russian meaning', text: word.translation.trim() } : null,
  ].filter((clue): clue is RepairClue => clue !== null)
  return clues.length ? clues[((encounterIndex % clues.length) + clues.length) % clues.length] : null
}

export const isRepairEligible = (word: UnitWord) => word.word.trim().length > 1 && repairClueFor(word, 0) !== null

export function isAcceptedRepairAnswer(word: UnitWord, answer: string): boolean {
  const normalizedAnswer = normalize(answer)
  return [word.word, ...(word.acceptedForms ?? [])].some((candidate) => normalize(candidate) === normalizedAnswer)
}
