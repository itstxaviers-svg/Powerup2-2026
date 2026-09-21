import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { units } from '../data/units'
import { availableFighterKinds, supportsFighterChallenge } from '../games/code-fighter/codeFighterEngine'
import { isRepairEligible } from '../games/training/repairEngine'
import { availableWordStrikeLevels, eligibleForStrikeLevel } from '../games/word-strike/wordStrikeEngine'
import { createProgress } from '../progress/localProgressRepository'
import { chooseScheduledWord, eligibleWords } from './taskScheduler'
import { recordSpellingMistake } from './weakWordEngine'
import { allVocabularyPartsSelected, availableVocabularyParts, filterVocabularyByParts, normalizeVocabularyPartSelection, selectAllVocabularyParts, toggleVocabularyPart, vocabularyScopeLabel, withVocabularyPartSelection } from './vocabularyParts'

const partsOf = (words: typeof unit1Vocabulary) => [...new Set(words.map((word) => word.sourcePart))]

describe('vocabulary Part selection', () => {
  it('defaults to the first available Part and constructs the requested pools from metadata', () => {
    expect(availableVocabularyParts(unit1Vocabulary)).toEqual([1, 2, 3, 4, 5])
    expect(normalizeVocabularyPartSelection(unit1Vocabulary)).toEqual([1])
    expect(filterVocabularyByParts(unit1Vocabulary, [1])).toHaveLength(11)
    expect(filterVocabularyByParts(unit1Vocabulary, [4])).toHaveLength(13)
    expect(filterVocabularyByParts(unit1Vocabulary, [1, 3])).toHaveLength(20)
    expect(filterVocabularyByParts(unit1Vocabulary, [2, 4, 5])).toHaveLength(30)
    expect(filterVocabularyByParts(unit1Vocabulary, [1, 2, 3, 4, 5])).toHaveLength(50)
    expect(partsOf(filterVocabularyByParts(unit1Vocabulary, [2, 4, 5]))).toEqual([2, 4, 5])
    expect(filterVocabularyByParts(unit1Vocabulary, [1])[0]).toBe(unit1Vocabulary[0])
  })

  it('implements select-all and never allows a zero-Part state', () => {
    expect(toggleVocabularyPart(unit1Vocabulary, [1], 1)).toEqual([1])
    expect(toggleVocabularyPart(unit1Vocabulary, [1], 3)).toEqual([1, 3])
    expect(selectAllVocabularyParts(unit1Vocabulary)).toEqual([1, 2, 3, 4, 5])
    expect(allVocabularyPartsSelected(unit1Vocabulary, [1, 2, 3, 4, 5])).toBe(true)
    expect(toggleVocabularyPart(unit1Vocabulary, [1, 2, 3, 4, 5], 3)).toEqual([1, 2, 4, 5])
    expect(allVocabularyPartsSelected(unit1Vocabulary, [1, 2, 4, 5])).toBe(false)
    expect(normalizeVocabularyPartSelection(unit1Vocabulary, [])).toEqual([1])
  })

  it('summarizes single, multiple, and all-Part pools', () => {
    expect(vocabularyScopeLabel(unit1Vocabulary, [1])).toBe('Part 1')
    expect(vocabularyScopeLabel(unit1Vocabulary, [1, 3])).toBe('Parts 1 + 3')
    expect(vocabularyScopeLabel(unit1Vocabulary, [1, 2, 3, 4, 5])).toBe('All parts')
  })

  it('retains soft cross-Part mixing inside a selected combined pool', () => {
    const pool = filterVocabularyByParts(unit1Vocabulary, [1, 3])
    const recentWordIds: string[] = []
    const selectedParts = Array.from({ length: 6 }, (_, taskIndex) => {
      const scheduled = chooseScheduledWord({ words: pool, moduleId: 'word-strike', unitId: 'unit-01', weakWords: {}, taskIndex, recentWordIds: recentWordIds.slice(-4) })!
      recentWordIds.push(scheduled.word.id)
      return scheduled.word.sourcePart
    })
    expect(new Set(selectedParts)).toEqual(new Set([1, 3]))
    expect(selectedParts.every((part, index) => index === 0 || part !== selectedParts[index - 1])).toBe(true)
  })

  it('prefers module-untrained words inside the selected scope after due Weak Word review', () => {
    const pool = filterVocabularyByParts(unit1Vocabulary, [1])
    const unseen = pool.at(-1)!
    const trainedWordIds = pool.slice(0, -1).map((word) => word.id)
    const scheduled = chooseScheduledWord({ words: pool, moduleId: 'repair', unitId: 'unit-01', weakWords: {}, taskIndex: 7, recentWordIds: [], trainedWordIds })
    expect(scheduled).toMatchObject({ isReview: false, word: { id: unseen.id } })

    const dueWord = pool[0]
    const weakWords = recordSpellingMistake({}, 'unit-01', dueWord.id, 0, 100)
    const dueReview = chooseScheduledWord({ words: pool, moduleId: 'repair', unitId: 'unit-01', weakWords, taskIndex: 4, recentWordIds: [], trainedWordIds })
    expect(dueReview).toMatchObject({ isReview: true, word: { id: dueWord.id } })
  })

  it('keeps Weak Word history global while excluding unselected weak words from a session', () => {
    const weakPart1 = unit1Vocabulary.find((word) => word.sourcePart === 1)!
    const weakWords = recordSpellingMistake({}, 'unit-01', weakPart1.id, 0, 100)
    const part4Pool = filterVocabularyByParts(unit1Vocabulary, [4])
    const excluded = chooseScheduledWord({ words: part4Pool, moduleId: 'repair', unitId: 'unit-01', weakWords, taskIndex: 4, recentWordIds: [] })!
    expect(excluded).toMatchObject({ isReview: false, word: { sourcePart: 4 } })

    const part1Pool = filterVocabularyByParts(unit1Vocabulary, [1])
    const restored = chooseScheduledWord({ words: part1Pool, moduleId: 'repair', unitId: 'unit-01', weakWords, taskIndex: 4, recentWordIds: [] })
    expect(restored).toMatchObject({ isReview: true, word: { id: weakPart1.id } })

    const progress = createProgress(1)
    progress.weakWords = weakWords
    const changed = withVocabularyPartSelection(progress, 'unit-01', unit1Vocabulary, [2, 4, 5])
    expect(changed.weakWords).toBe(weakWords)
    expect(changed.units).toBe(progress.units)
    expect(changed.inventory).toBe(progress.inventory)
    expect(changed.vocabularyPartSelections['unit-01']).toEqual([2, 4, 5])
  })

  it('feeds the same selected pool into all five existing game eligibility layers', () => {
    const pool = filterVocabularyByParts(unit1Vocabulary, [2, 4, 5])
    expect(pool).toHaveLength(30)
    expect(pool.filter(isRepairEligible)).toHaveLength(30)
    expect(eligibleWords(pool, 'error-hunt')).toHaveLength(30)
    expect(eligibleWords(pool, 'audio-code')).toHaveLength(30)

    const strikeLevels = availableWordStrikeLevels(pool)
    expect(strikeLevels.map((level) => level.id)).toEqual(['spelling', 'audio'])
    strikeLevels.forEach((level) => expect(eligibleForStrikeLevel(pool, level)).toHaveLength(30))

    const fighterKinds = availableFighterKinds(pool, 4)
    expect(fighterKinds).toHaveLength(7)
    fighterKinds.forEach((kind) => expect(pool.filter((word) => supportsFighterChallenge(word, kind))).toHaveLength(30))
  })

  it('exposes the supplied Parts for Units 5–9', () => {
    expect(units.slice(4).map((unit) => availableVocabularyParts(unit.words))).toEqual([[1, 2, 3], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]])
  })
})
