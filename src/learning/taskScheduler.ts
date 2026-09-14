import type { TrainingModuleId, UnitWord, WeakWordRecord } from '../types/game'
import { reviewCandidates } from './weakWordEngine'

export type ReviewModuleId = TrainingModuleId | 'word-strike' | 'code-fighter'
export type ScheduledWord = { word: UnitWord; isReview: boolean }

const supportsModule = (word: UnitWord, moduleId: ReviewModuleId) =>
  moduleId !== 'audio-code' || Boolean(word.audio)

export function eligibleWords(words: UnitWord[], moduleId: ReviewModuleId): UnitWord[] {
  return words.filter((word) => word.word.trim().length > 1 && supportsModule(word, moduleId))
}

function variedFreshWord(pool: UnitWord[], byId: Map<string, UnitWord>, recentWordIds: string[], taskIndex: number) {
  const parts = [...new Set(pool.map((word) => word.sourcePart).filter((part): part is NonNullable<UnitWord['sourcePart']> => part !== undefined))]
  if (parts.length < 2) return pool[taskIndex % pool.length]
  const recentPartCounts = new Map(parts.map((part) => [part, 0]))
  recentWordIds.forEach((id) => {
    const part = byId.get(id)?.sourcePart
    if (part !== undefined && recentPartCounts.has(part)) recentPartCounts.set(part, (recentPartCounts.get(part) ?? 0) + 1)
  })
  const lowestCount = Math.min(...parts.map((part) => recentPartCounts.get(part) ?? 0))
  const leastRecentParts = parts.filter((part) => recentPartCounts.get(part) === lowestCount)
  const selectedPart = leastRecentParts[taskIndex % leastRecentParts.length]
  const partPool = pool.filter((word) => word.sourcePart === selectedPart)
  return partPool[taskIndex % partPool.length] ?? pool[taskIndex % pool.length]
}

export function chooseScheduledWord({
  words,
  moduleId,
  unitId,
  weakWords,
  taskIndex,
  recentWordIds,
  trainedWordIds = [],
}: {
  words: UnitWord[]
  moduleId: ReviewModuleId
  unitId: string
  weakWords: Record<string, WeakWordRecord>
  taskIndex: number
  recentWordIds: string[]
  trainedWordIds?: readonly string[]
}): ScheduledWord | null {
  const eligible = eligibleWords(words, moduleId)
  if (!eligible.length) return null
  const byId = new Map(eligible.map((word) => [word.id, word]))
  const review = reviewCandidates(weakWords, unitId, taskIndex)
    .map((record) => byId.get(record.wordId))
    .find((word): word is UnitWord => word !== undefined && word.id !== recentWordIds.at(-1))
  // Once a spaced review is due it takes precedence; mistakes are never replayed
  // immediately because nextReviewAfter leaves several other tasks in between.
  if (review) return { word: review, isReview: true }
  const trained = new Set(trainedWordIds)
  const unseen = eligible.filter((word) => !trained.has(word.id) && !recentWordIds.includes(word.id))
  const unseenFallback = eligible.filter((word) => !trained.has(word.id) && word.id !== recentWordIds.at(-1))
  const fresh = eligible.filter((word) => !recentWordIds.includes(word.id))
  const pool = unseen.length ? unseen : unseenFallback.length ? unseenFallback : fresh.length ? fresh : eligible.filter((word) => word.id !== recentWordIds.at(-1))
  return { word: variedFreshWord(pool.length ? pool : eligible, byId, recentWordIds, taskIndex) ?? eligible[0], isReview: false }
}
