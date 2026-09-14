import type { WeakWordRecord } from '../types/game'

const keyFor = (unitId: string, wordId: string) => `${unitId}:${wordId}`
// A task index offset of four means the learner sees three other tasks before
// this word is eligible again (indexes 1, 2, and 3 after an error at index 0).
const REVIEW_SPACING = 4
const MASTERY_STREAK = 2

export const weakWordKey = keyFor

export function recordSpellingMistake(
  weakWords: Record<string, WeakWordRecord>,
  unitId: string,
  wordId: string,
  taskIndex: number,
  now = Date.now(),
): Record<string, WeakWordRecord> {
  const key = keyFor(unitId, wordId)
  const current = weakWords[key]
  const mistakeCount = (current?.mistakeCount ?? 0) + 1
  const next: WeakWordRecord = {
    unitId,
    wordId,
    mistakeCount,
    lastMistakeAt: now,
    lastSeenAt: now,
    reviewCount: current?.reviewCount ?? 0,
    consecutiveReviewCorrect: 0,
    nextReviewAfter: taskIndex + REVIEW_SPACING,
    priority: mistakeCount * 3 + 2,
    reviewStatus: 'active',
    mastered: false,
  }
  return { ...weakWords, [key]: next }
}

// Recognition misses are deliberately lighter than spelling failures: they
// schedule another encounter but do not reset an established spelling streak.
export function recordRecognitionMistake(
  weakWords: Record<string, WeakWordRecord>,
  unitId: string,
  wordId: string,
  taskIndex: number,
  now = Date.now(),
): Record<string, WeakWordRecord> {
  const key = keyFor(unitId, wordId)
  const current = weakWords[key]
  if (!current) {
    return {
      ...weakWords,
      [key]: {
        unitId,
        wordId,
        mistakeCount: 0,
        lastMistakeAt: now,
        lastSeenAt: now,
        reviewCount: 0,
        consecutiveReviewCorrect: 0,
        nextReviewAfter: taskIndex + REVIEW_SPACING,
        priority: 1,
        reviewStatus: 'active',
        mastered: false,
      },
    }
  }
  return {
    ...weakWords,
    [key]: {
      ...current,
      lastSeenAt: now,
      nextReviewAfter: Math.max(current.nextReviewAfter, taskIndex + REVIEW_SPACING),
      priority: current.mastered ? 1 : current.priority + 1,
      consecutiveReviewCorrect: current.mastered ? 0 : current.consecutiveReviewCorrect,
      reviewStatus: 'active',
      mastered: false,
    },
  }
}

export function recordReviewSuccess(
  weakWords: Record<string, WeakWordRecord>,
  unitId: string,
  wordId: string,
  taskIndex: number,
  now = Date.now(),
): Record<string, WeakWordRecord> {
  const key = keyFor(unitId, wordId)
  const current = weakWords[key]
  if (!current || current.mastered) return weakWords
  const consecutiveReviewCorrect = current.consecutiveReviewCorrect + 1
  const mastered = consecutiveReviewCorrect >= MASTERY_STREAK
  return {
    ...weakWords,
    [key]: {
      ...current,
      lastSeenAt: now,
      reviewCount: current.reviewCount + 1,
      consecutiveReviewCorrect,
      nextReviewAfter: taskIndex + REVIEW_SPACING,
      priority: mastered ? 0 : Math.max(1, current.priority - 2),
      reviewStatus: mastered ? 'mastered' : 'active',
      mastered,
    },
  }
}

export function reviewCandidates(
  weakWords: Record<string, WeakWordRecord>,
  unitId: string,
  taskIndex: number,
): WeakWordRecord[] {
  return Object.values(weakWords)
    .filter((record) => record.unitId === unitId && !record.mastered && record.nextReviewAfter <= taskIndex)
    .sort((a, b) => b.priority - a.priority || b.lastMistakeAt - a.lastMistakeAt)
}

export const weakWordSettings = { reviewSpacing: REVIEW_SPACING, masteryStreak: MASTERY_STREAK }
