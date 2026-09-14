import type { QuestionDifficulty, QuestionVariantState } from '../types/game'

export type QuestionVariant<T> = {
  variantId: string
  difficulty: QuestionDifficulty
  value: T
}

const normalizedOffset = (seed: number, length: number) => ((seed % length) + length) % length

export function chooseQuestionVariant<T>(
  candidates: QuestionVariant<T>[],
  previous: QuestionVariantState | undefined,
  seed: number,
  preferredInitialDifficulty?: QuestionDifficulty,
): QuestionVariant<T> | null {
  const unique = [...new Map(candidates.map((candidate) => [candidate.variantId, candidate])).values()]
  if (!unique.length) return null

  if (!previous) {
    const preferred = preferredInitialDifficulty
      ? unique.filter((candidate) => candidate.difficulty === preferredInitialDifficulty)
      : unique
    const pool = preferred.length ? preferred : unique
    return pool[normalizedOffset(seed, pool.length)]
  }

  const alternatives = unique.filter((candidate) => candidate.variantId !== previous.lastVariantId)
  const poolWithoutRepeat = alternatives.length ? alternatives : unique
  const desiredDifficulty = (previous.lastCorrect
    ? previous.difficulty
    : Math.min(3, previous.difficulty + 1)) as QuestionDifficulty
  const atOrAbove = poolWithoutRepeat.filter((candidate) => candidate.difficulty >= desiredDifficulty)

  if (atOrAbove.length) {
    const nearestDifficulty = Math.min(...atOrAbove.map((candidate) => candidate.difficulty))
    const nearest = atOrAbove.filter((candidate) => candidate.difficulty === nearestDifficulty)
    return nearest[normalizedOffset(seed, nearest.length)]
  }

  const hardestAvailable = Math.max(...poolWithoutRepeat.map((candidate) => candidate.difficulty))
  const fallback = poolWithoutRepeat.filter((candidate) => candidate.difficulty === hardestAvailable)
  return fallback[normalizedOffset(seed, fallback.length)]
}

export function recordQuestionVariant(
  state: Record<string, QuestionVariantState> | undefined,
  wordId: string,
  variantId: string,
  difficulty: QuestionDifficulty,
  correct: boolean,
): Record<string, QuestionVariantState> {
  const safeState = state ?? {}
  const previous = safeState[wordId]
  return {
    ...safeState,
    [wordId]: {
      lastVariantId: variantId,
      completedEncounters: (previous?.completedEncounters ?? 0) + 1,
      difficulty,
      lastCorrect: correct,
    },
  }
}
