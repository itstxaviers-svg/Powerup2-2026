import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../../data/unit1Vocabulary'
import { filterVocabularyByParts } from '../../learning/vocabularyParts'
import { createProgress } from '../../progress/localProgressRepository'
import { applyModuleAttempt } from '../../progress/progressionEngine'
import {
  audioStrikeOptions,
  availableWordStrikeLevels,
  chooseWordStrikeLevel,
  createWordStrikeRound,
  eligibleForStrikeLevel,
  scoreForStrike,
  sentenceGap,
  spellingStrikeOptions,
} from './wordStrikeEngine'

const byTarget = (target: string) => unit1Vocabulary.find((word) => word.word === target)!

describe('Word Strike engine', () => {
  it('schedules only balanced Spelling Strike and Audio Strike tasks', () => {
    expect(availableWordStrikeLevels(unit1Vocabulary).map((level) => level.id)).toEqual(['spelling', 'audio'])
    const sequence: string[] = []
    let previous: 'spelling' | 'audio' | undefined
    for (let index = 0; index < 6; index += 1) {
      const level = chooseWordStrikeLevel(unit1Vocabulary, index, previous)!
      sequence.push(level.id)
      previous = level.id
    }
    expect(sequence).toEqual(['spelling', 'audio', 'spelling', 'audio', 'spelling', 'audio'])
    expect(sequence).not.toContain('definition')
    expect(sequence).not.toContain('translation')
    expect(sequence).not.toContain('sentence')
    expect(sequence).not.toContain('picture')
  })

  it('builds exactly one canonical spelling and two configured same-word typo targets', () => {
    const word = byTarget('mountain')
    const options = spellingStrikeOptions(word, 0)!
    expect(options).toHaveLength(3)
    expect(options.filter((option) => option === word.word)).toHaveLength(1)
    expect(options.filter((option) => option !== word.word).every((option) => word.typoForms?.includes(option))).toBe(true)
  })

  it('moves the correct spelling position deterministically between encounters', () => {
    const word = byTarget('recycle')
    const positions = [0, 1, 2].map((reviewIndex) => spellingStrikeOptions(word, reviewIndex)!.indexOf(word.word))
    expect(new Set(positions)).toEqual(new Set([0, 1, 2]))
  })

  it('preserves multiword structure and changes only configured spelling components', () => {
    const word = byTarget('pick up rubbish')
    const options = spellingStrikeOptions(word, 2)!
    const canonicalTokens = word.word.split(' ')
    options.filter((option) => option !== word.word).forEach((option) => {
      const tokens = option.split(' ')
      expect(tokens).toHaveLength(canonicalTokens.length)
      expect(tokens.filter((token, index) => token !== canonicalTokens[index])).toHaveLength(1)
      expect(word.typoForms).toContain(option)
    })
  })

  it('uses only canonical audio-eligible words from the selected Part pool as audio choices', () => {
    const selectedPool = filterVocabularyByParts(unit1Vocabulary, [5])
    const word = selectedPool[0]
    const options = audioStrikeOptions(word, selectedPool, 4)!
    expect(options).toHaveLength(3)
    expect(options.filter((option) => option === word.word)).toHaveLength(1)
    expect(options.every((option) => selectedPool.some((candidate) => candidate.word === option))).toBe(true)
    expect(options.every((option) => !word.typoForms?.includes(option))).toBe(true)
  })

  it('creates exactly three targets and respects subtype eligibility', () => {
    const spellingLevel = availableWordStrikeLevels(unit1Vocabulary).find((level) => level.id === 'spelling')!
    const audioLevel = availableWordStrikeLevels(unit1Vocabulary).find((level) => level.id === 'audio')!
    const spellingRound = createWordStrikeRound({ unitId: 'unit-01', level: spellingLevel, allWords: unit1Vocabulary, weakWords: {}, reviewIndex: 0, recentWordIds: [] })!
    const audioRound = createWordStrikeRound({ unitId: 'unit-01', level: audioLevel, allWords: unit1Vocabulary, weakWords: {}, reviewIndex: 1, recentWordIds: [] })!

    expect(spellingRound.targets).toHaveLength(3)
    expect(spellingRound.targets.filter((target) => target.word === spellingRound.answer)).toHaveLength(1)
    expect(audioRound.targets).toHaveLength(3)
    expect(audioRound.audio).toBe(audioRound.word.audio)
    expect(eligibleForStrikeLevel(unit1Vocabulary, spellingLevel)).toHaveLength(50)
    expect(eligibleForStrikeLevel(unit1Vocabulary, audioLevel)).toHaveLength(50)
  })

  it('does not offer Audio Strike without three production-audio choices', () => {
    const tooSmall = unit1Vocabulary.slice(0, 2)
    expect(availableWordStrikeLevels(tooSmall).map((level) => level.id)).toEqual(['spelling'])
  })

  it('keeps Word Strike coverage unique across subtype encounters and repeated attempts', () => {
    const word = unit1Vocabulary[0]
    const first = applyModuleAttempt(createProgress(1), { unitId: 'unit-01', moduleId: 'word-strike', wordId: word.id, correct: false, weakWords: {}, accuracy: 0, variantId: 'word-strike.spelling', variantDifficulty: 2 })
    const repeated = applyModuleAttempt(first, { unitId: 'unit-01', moduleId: 'word-strike', wordId: word.id, correct: true, weakWords: {}, accuracy: .5, variantId: 'word-strike.audio', variantDifficulty: 2 })
    expect(repeated.units['unit-01'].modules['word-strike'].trainedWordIds).toEqual([word.id])
  })

  it('retains the contextual sentence-gap helper without scheduling sentence tasks', () => {
    expect(sentenceGap(byTarget('mountain'))).toBe('I like climbing ____.')
    expect(sentenceGap({ id: 'none', word: 'none', example: 'A different clue.' })).toBeNull()
  })

  it('rewards combo and quick reaction without relying on score for learning', () => {
    expect(scoreForStrike(1, 5000).points).toBe(10)
    expect(scoreForStrike(2, 2000)).toMatchObject({ multiplier: 2, points: 25, speedBonus: 5 })
  })
})
