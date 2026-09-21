import { describe, expect, it } from 'vitest'
import { fightingPictureClueForWord, unit9PictureCandidateFiles } from '../games/fighting-level/fightingPictureClueAssets'
import { createFightingBattleRosters, cumulativeFightingPool, normalizeFightingCanonicalAnswer, rosterRecords, uniqueCanonicalFightingPool } from '../games/fighting-level/fightingLevelEngine'
import { fightingMilestones } from '../games/fighting-level/fightingLevelConfig'
import { eligibleWordsForModule } from '../learning/moduleCoverage'
import { availableVocabularyParts } from '../learning/vocabularyParts'
import { moduleIds } from '../types/game'
import { unit5Vocabulary } from './unit5Vocabulary'
import { unit6Vocabulary } from './unit6Vocabulary'
import { unit7Vocabulary } from './unit7Vocabulary'
import { unit8Vocabulary } from './unit8Vocabulary'
import { unit9PictureTargets, unit9Vocabulary } from './unit9Vocabulary'
import { units } from './units'
import { validateVocabulary } from './vocabularyValidation'

const laterUnits = [unit5Vocabulary, unit6Vocabulary, unit7Vocabulary, unit8Vocabulary, unit9Vocabulary]
const findWord = (unit: typeof unit5Vocabulary, target: string) => unit.find((word) => word.word === target)!

describe('Units 5–9 production vocabulary', () => {
  it('preserves the supplied Part splits, totals and source metadata', () => {
    expect(laterUnits.map((words) => words.length)).toEqual([33, 24, 37, 48, 47])
    expect([1, 2, 3].map((part) => unit5Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([16, 12, 5])
    expect([1, 2, 3].map((part) => unit6Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([9, 10, 5])
    expect([1, 2, 3, 4].map((part) => unit7Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([11, 8, 14, 4])
    expect([1, 2, 3, 4].map((part) => unit8Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([11, 19, 11, 7])
    expect([1, 2, 3, 4].map((part) => unit9Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([11, 13, 18, 5])
    expect(laterUnits.flat().every((word) => word.sourcePart && word.sourceTitle && word.sourcePage === undefined)).toBe(true)
    expect(validateVocabulary(units)).toEqual([])
  })

  it('connects every later Unit to all five existing learning systems', () => {
    laterUnits.forEach((words) => {
      moduleIds.forEach((moduleId) => expect(eligibleWordsForModule(words, moduleId), `${words[0].id} ${moduleId}`).toHaveLength(words.length))
      expect(availableVocabularyParts(words)).toEqual(words === unit5Vocabulary || words === unit6Vocabulary ? [1, 2, 3] : [1, 2, 3, 4])
      expect(words.every((word) => word.audio === `/assets/audio/unit-0${word.id.slice(1, 2)}/${word.id}.mp3`)).toBe(true)
    })
  })

  it('keeps exact phrases, duplicate source records and irregular base forms', () => {
    expect(findWord(unit5Vocabulary, 'killer whale')).toBeDefined()
    expect(findWord(unit5Vocabulary, "What's the matter?")).toBeDefined()
    expect(findWord(unit6Vocabulary, "It's raining.")).toBeDefined()
    expect(findWord(unit6Vocabulary, 'a kind of')).toBeDefined()
    expect(findWord(unit6Vocabulary, 'I imagine that')).toBeDefined()
    expect(findWord(unit6Vocabulary, 'have lots of fun')).toBeDefined()
    expect(findWord(unit7Vocabulary, 'bean plants')).toBeDefined()
    expect(findWord(unit7Vocabulary, 'be ill')).toBeDefined()
    expect(findWord(unit5Vocabulary, 'carry').id).not.toBe(findWord(unit7Vocabulary, 'carry').id)
    expect(unit8Vocabulary.filter((word) => word.word === 'road')).toHaveLength(2)
    expect(unit8Vocabulary.filter((word) => word.word === 'road').every((word) => word.allowDuplicateTarget)).toBe(true)
    expect(findWord(unit8Vocabulary, 'grown-up')).toBeDefined()
    expect(Object.fromEntries(['found', 'lost', 'bought', 'came', 'chose', 'stood', 'thought'].map((target) => [target, findWord(unit8Vocabulary, target).baseForm]))).toEqual({
      found: 'find', lost: 'lose', bought: 'buy', came: 'come', chose: 'choose', stood: 'stand', thought: 'think',
    })
  })
})

describe('Unit 9 source and modality metadata', () => {
  const audioOnly = [
    'to be surprised about', 'be frightened of', 'be dangerous', 'be difficult', 'be easy', 'be hungry', 'be exciting', 'be boring', 'be afraid of', 'be tired', 'be thirsty',
    'adventure', 'on a world tour', 'be busy', 'call', 'text', 'travel round the world', 'round',
    'living things', 'on the Earth', 'kind of', 'give a picnic', 'carefully', 'in the wood', 'hide a clue', 'fantastic',
  ]

  it('preserves all canonical phrases, articles, capitals and supplied meanings', () => {
    const targets = unit9Vocabulary.map((word) => word.word)
    for (const target of [
      'to be surprised about', 'be frightened of', 'be afraid of', 'DVD', 'on a world tour', 'travel round the world',
      'Asia', 'Europe', 'North America', 'South America', 'Antarctica', 'Australia', 'Africa',
      'the Grand Canyon', 'the Taj Mahal', 'the Great Barrier Reef', 'Machu Picchu', 'the Victoria Falls', 'Stonehenge',
      'living things', 'on the Earth', 'kind of', 'give a picnic', 'in the wood',
    ]) expect(targets).toContain(target)
    expect(findWord(unit9Vocabulary, 'in the wood')).toMatchObject({ word: 'in the wood', definition: 'in the forest' })
    expect(findWord(unit9Vocabulary, 'living things').translation).toBe('живые существа')
  })

  it('marks exactly 21 picture candidates and 26 audio-only targets', () => {
    expect(unit9PictureTargets).toHaveLength(21)
    expect(Object.keys(unit9PictureCandidateFiles)).toHaveLength(21)
    expect(unit9Vocabulary.filter((word) => word.pictureEligible).map((word) => word.word)).toEqual([...unit9PictureTargets])
    expect(unit9Vocabulary.filter((word) => !word.pictureEligible).map((word) => word.word)).toEqual(audioOnly)
    expect(audioOnly).toHaveLength(26)
    for (const target of ['adventure', 'call', 'kind of']) expect(findWord(unit9Vocabulary, target).pictureEligible).toBe(false)
    expect(unit9Vocabulary.every((word) => fightingPictureClueForWord(word.id) === undefined)).toBe(true)
  })

  it('keeps repeated source records while canonical milestone normalization stays conservative', () => {
    expect(findWord(unit8Vocabulary, 'adventure')).toBeDefined()
    expect(findWord(unit9Vocabulary, 'adventure')).toBeDefined()
    expect(findWord(unit9Vocabulary, 'call')).toBeDefined()
    expect(normalizeFightingCanonicalAnswer('Adventure!')).toBe(normalizeFightingCanonicalAnswer(' adventure '))
    expect(normalizeFightingCanonicalAnswer('a kind of')).not.toBe(normalizeFightingCanonicalAnswer('kind of'))
  })
})

describe('later Fighting Level scopes and canonical no-repeat rules', () => {
  it('uses Units 4–7 only after Unit 7 and leaves the final scope unchanged', () => {
    expect(fightingMilestones['after-unit-7']).toMatchObject({ startUnit: 4, endUnit: 7, battleCount: 2, answerTimeMs: 8_000 })
    expect(fightingMilestones['after-unit-9']).toMatchObject({ startUnit: 1, endUnit: 9, battleCount: 2, answerTimeMs: 6_000 })
    expect(cumulativeFightingPool(units, 'after-unit-7').map((record) => record.unitNumber).every((unit) => unit >= 4 && unit <= 7)).toBe(true)
    expect(cumulativeFightingPool(units, 'after-unit-7')).toHaveLength(127)
    expect(uniqueCanonicalFightingPool(units, 'after-unit-7')).toHaveLength(126)
  })

  it('creates two 42-word Unit 7 milestone rosters with no ID or answer overlap', () => {
    const rosters = createFightingBattleRosters(units, 'after-unit-7', 2026)
    expect(rosters.map((roster) => roster.length)).toEqual([42, 42])
    expect(new Set(rosters.flat()).size).toBe(84)
    const records = rosters.flatMap((roster) => rosterRecords(units, 'after-unit-7', roster))
    const answers = records.map((record) => normalizeFightingCanonicalAnswer(record.word.word))
    expect(new Set(answers).size).toBe(84)
    expect(answers.filter((answer) => answer === 'carry')).toHaveLength(1)
    expect(records.some((record) => record.unitNumber < 4)).toBe(false)
  })

  it('deduplicates exact final-milestone answers but keeps a kind of separate from kind of', () => {
    const pool = uniqueCanonicalFightingPool(units, 'after-unit-9')
    const answers = pool.map((record) => normalizeFightingCanonicalAnswer(record.word.word))
    expect(new Set(answers).size).toBe(answers.length)
    expect(answers.filter((answer) => answer === 'adventure')).toHaveLength(1)
    expect(answers.filter((answer) => answer === 'call')).toHaveLength(1)
    expect(answers).toContain('a kind of')
    expect(answers).toContain('kind of')
  })
})
