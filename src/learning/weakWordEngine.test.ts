import { describe, expect, it } from 'vitest'
import { chooseScheduledWord } from './taskScheduler'
import { recordRecognitionMistake, recordReviewSuccess, recordSpellingMistake, reviewCandidates, weakWordKey } from './weakWordEngine'
import type { UnitWord } from '../types/game'

const words: UnitWord[] = [
  { id: 'word-a', word: 'alpha' },
  { id: 'word-b', word: 'bravo' },
  { id: 'word-c', word: 'cello' },
]

describe('weak word review', () => {
  it('spaces a spelling error for three other tasks before review', () => {
    const weakWords = recordSpellingMistake({}, 'unit-01', 'word-a', 0, 100)
    expect(reviewCandidates(weakWords, 'unit-01', 3)).toHaveLength(0)
    expect(reviewCandidates(weakWords, 'unit-01', 4).map((record) => record.wordId)).toEqual(['word-a'])
  })

  it('requires two later successful review encounters to master a word', () => {
    const failed = recordSpellingMistake({}, 'unit-01', 'word-a', 0, 100)
    const firstReview = recordReviewSuccess(failed, 'unit-01', 'word-a', 4, 200)
    expect(firstReview[weakWordKey('unit-01', 'word-a')].mastered).toBe(false)
    expect(firstReview[weakWordKey('unit-01', 'word-a')].consecutiveReviewCorrect).toBe(1)
    const secondReview = recordReviewSuccess(firstReview, 'unit-01', 'word-a', 8, 300)
    expect(secondReview[weakWordKey('unit-01', 'word-a')].mastered).toBe(true)
    expect(reviewCandidates(secondReview, 'unit-01', 9)).toHaveLength(0)
  })

  it('resets the recovery streak and raises priority after another spelling failure', () => {
    const failed = recordSpellingMistake({}, 'unit-01', 'word-a', 0, 100)
    const oneCorrect = recordReviewSuccess(failed, 'unit-01', 'word-a', 4, 200)
    const failedAgain = recordSpellingMistake(oneCorrect, 'unit-01', 'word-a', 4, 300)
    const record = failedAgain[weakWordKey('unit-01', 'word-a')]
    expect(record.consecutiveReviewCorrect).toBe(0)
    expect(record.mistakeCount).toBe(2)
    expect(record.priority).toBeGreaterThan(oneCorrect[weakWordKey('unit-01', 'word-a')].priority)
  })

  it('uses a due weak word in a compatible later module task', () => {
    const weakWords = recordSpellingMistake({}, 'unit-01', 'word-a', 0, 100)
    const scheduled = chooseScheduledWord({ words, moduleId: 'error-hunt', unitId: 'unit-01', weakWords, taskIndex: 4, recentWordIds: ['word-b', 'word-c'] })
    expect(scheduled).toMatchObject({ isReview: true, word: { id: 'word-a' } })
  })

  it('uses the persisted learner-wide task clock across module sessions', () => {
    const weakWords = recordSpellingMistake({}, 'unit-01', 'word-a', 7, 100)
    expect(reviewCandidates(weakWords, 'unit-01', 0)).toHaveLength(0)
    expect(reviewCandidates(weakWords, 'unit-01', 11).map((record) => record.wordId)).toEqual(['word-a'])
  })

  it('records a recognition miss with lower priority than a spelling mistake', () => {
    const recognition = recordRecognitionMistake({}, 'unit-01', 'word-a', 0, 100)
    const spelling = recordSpellingMistake({}, 'unit-01', 'word-a', 0, 100)
    expect(recognition[weakWordKey('unit-01', 'word-a')].priority).toBeLessThan(spelling[weakWordKey('unit-01', 'word-a')].priority)
  })
})
