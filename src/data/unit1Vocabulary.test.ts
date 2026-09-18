import { describe, expect, it } from 'vitest'
import { availableFighterKinds, createFighterChallenge, damagedSpelling, supportsFighterChallenge } from '../games/code-fighter/codeFighterEngine'
import { isPlausibleSpellingVariant } from '../games/training/errorHuntEngine'
import { availableWordStrikeLevels, createWordStrikeRound, eligibleForStrikeLevel, sentenceGap } from '../games/word-strike/wordStrikeEngine'
import { chooseScheduledWord, eligibleWords } from '../learning/taskScheduler'
import { recordSpellingMistake } from '../learning/weakWordEngine'
import type { UnitWord } from '../types/game'
import { unit1Vocabulary, unit1VocabularySources, type VocabularySourcePart } from './unit1Vocabulary'
import { units } from './units'
import { validateVocabulary } from './vocabularyValidation'

const byTarget = (target: string) => unit1Vocabulary.find((word) => word.word === target)!

const expectedTargetsByPart: Record<VocabularySourcePart, string[]> = {
  1: ['field', 'grass', 'ground', 'mountain', 'river', 'leaves', 'rock', 'lake', 'forest', 'tractor', 'flower'],
  2: ['awake', 'young', 'pretty', 'dirty', 'wash', 'naughty', 'lunch', 'clean', 'kitten', 'puppy', 'look at'],
  3: ['wake up', 'get up', 'have a shower', 'have breakfast', 'get dressed', 'toothpaste', 'toothbrush', 'towel', 'time to run'],
  4: ['air', 'oxygen', 'factory', 'pick up rubbish', 'grow plants', 'plastic bags', 'keep someone healthy', 'important', 'look after', 'turn off the lights', 'recycle', 'need', 'other'],
  5: ['race', 'win', 'fall down', 'call', 'come back', 'move'],
}

describe('Unit 1 production vocabulary', () => {
  it('preserves all five source parts and keeps Units 4–9 empty', () => {
    expect(unit1Vocabulary).toHaveLength(50)
    expect([1, 2, 3, 4, 5].map((part) => unit1Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([11, 11, 9, 13, 6])
    ;([1, 2, 3, 4, 5] as VocabularySourcePart[]).forEach((part) => {
      expect(unit1Vocabulary.filter((word) => word.sourcePart === part).map((word) => word.word)).toEqual(expectedTargetsByPart[part])
    })
    expect(unit1VocabularySources).toEqual({
      1: { title: 'Unit 1. A day on the farm', page: 7 },
      2: { title: 'Unit 1. A day at the farm', page: 8 },
      3: { title: 'Unit 1. A day on the farm', page: 10 },
      4: { title: 'Unit 1. Look after our planet' },
      5: { title: 'Unit 1. A day at the farm. Literature' },
    })
    unit1Vocabulary.forEach((word) => {
      expect([1, 2, 3, 4, 5]).toContain(word.sourcePart)
      const source = unit1VocabularySources[word.sourcePart as VocabularySourcePart]
      expect(word.sourceTitle).toBe(source.title)
      expect(word.sourcePage).toBe(source.page)
    })
    expect(units.slice(4).every((unit) => unit.words.length === 0)).toBe(true)
  })

  it('contains complete, unique production records with stable local production audio', () => {
    expect(validateVocabulary(units)).toEqual([])
    expect(new Set(unit1Vocabulary.map((word) => word.id)).size).toBe(50)
    expect(new Set(unit1Vocabulary.map((word) => word.word.toLocaleLowerCase())).size).toBe(50)
    expect(new Set(unit1Vocabulary.map((word) => word.audio)).size).toBe(50)
    unit1Vocabulary.forEach((word) => {
      expect(word.id).toMatch(/^u1-/)
      expect(word.definition?.trim()).toBeTruthy()
      expect(word.translation?.trim()).toBeTruthy()
      expect(word.example?.trim()).toBeTruthy()
      expect(word.audio).toBe(`/assets/audio/unit-01/${word.id}.mp3`)
      expect(word.audio).not.toBe('dev-speech')
      expect(word.image).toBeUndefined()
    })
  })

  it('stores the required accepted and contextual forms without teaching invalid awake forms', () => {
    expect(byTarget('mountain')).toMatchObject({ contextForm: 'mountains', acceptedForms: ['mountains'] })
    expect(byTarget('flower')).toMatchObject({ contextForm: 'flowers', acceptedForms: ['flowers'] })
    expect(byTarget('factory')).toMatchObject({ contextForm: 'factories', acceptedForms: ['factories'] })
    expect(byTarget('leaves').acceptedForms).toEqual(['leaf'])
    expect(byTarget('plastic bags').acceptedForms).toEqual(['plastic bag'])
    expect(byTarget('keep someone healthy')).toMatchObject({
      contextForm: 'keep us healthy',
      acceptedForms: ['keep us healthy', 'keep them healthy', 'keep me healthy'],
    })
    expect(byTarget('awake').acceptedForms ?? []).not.toEqual(expect.arrayContaining(['awoke', 'awoken']))
    expect(unit1Vocabulary.filter((word) => word.word.includes(' ')).every((word) => word.fixedPhrase)).toBe(true)
  })

  it('keeps corrected examples and uses contextual answers in sentence gaps', () => {
    expect(byTarget('leaves').example).toContain('a lot of leaves')
    expect(byTarget('oxygen').example).toContain('breathe')
    expect(unit1Vocabulary.map((word) => word.example).join(' ')).not.toMatch(/\balot\b|\bbreath\b/i)
    expect(byTarget('look after').example).toBe('We must look after our planet.')
    expect(sentenceGap(byTarget('mountain'))).toBe('I like climbing ____.')
    expect(sentenceGap(byTarget('flower'))).toBe('There are a lot of purple ____ on the ground.')
    expect(sentenceGap(byTarget('factory'))).toBe('____ can make the air dirty.')
    expect(sentenceGap(byTarget('keep someone healthy'))).toBe('Clean air and clean water ____.')
  })

  it('provides spelling-only Error Hunt variants, including one changed token per phrase', () => {
    unit1Vocabulary.forEach((word) => {
      expect(word.typoForms?.length).toBeGreaterThanOrEqual(2)
      expect(word.typoForms?.length).toBeLessThanOrEqual(3)
      expect(new Set(word.typoForms).size).toBe(word.typoForms?.length)
      word.typoForms?.forEach((typo) => {
        expect(typo.toLocaleLowerCase()).not.toBe(word.word.toLocaleLowerCase())
        expect(typo).not.toBe(word.word.slice(1))
        expect(isPlausibleSpellingVariant(word, typo), `${word.word} -> ${typo}`).toBe(true)
        expect(typo.split(' ')).toHaveLength(word.word.split(' ').length)
        if (word.word.includes(' ')) {
          const changedTokens = typo.split(' ').filter((token, index) => token !== word.word.split(' ')[index])
          expect(changedTokens).toHaveLength(1)
        }
      })
      expect(damagedSpelling(word)).toBe(word.typoForms?.[0])
    })
  })

  it('passes the real selectors for every supported game without fake Picture mode', () => {
    expect(eligibleWords(unit1Vocabulary, 'repair')).toHaveLength(50)
    expect(eligibleWords(unit1Vocabulary, 'error-hunt')).toHaveLength(50)
    expect(eligibleWords(unit1Vocabulary, 'audio-code')).toHaveLength(50)

    const strikeLevels = availableWordStrikeLevels(unit1Vocabulary)
    expect(strikeLevels.map((level) => level.id)).toEqual(['spelling', 'audio'])
    strikeLevels.forEach((level, index) => {
      expect(eligibleForStrikeLevel(unit1Vocabulary, level)).toHaveLength(50)
      const round = createWordStrikeRound({
        unitId: 'unit-01', level, allWords: unit1Vocabulary, weakWords: {}, reviewIndex: index,
        recentWordIds: [],
      })
      expect(round).not.toBeNull()
      expect(round?.targets).toHaveLength(3)
      if (level.id === 'audio') expect(round?.audio).toBe(round?.word.audio)
    })

    expect(availableFighterKinds(unit1Vocabulary, 4)).toEqual(['quick', 'defense', 'spelling', 'audio', 'meaning', 'combo', 'ultimate'])
    availableFighterKinds(unit1Vocabulary, 4).forEach((kind, index) => {
      expect(unit1Vocabulary.filter((word) => supportsFighterChallenge(word, kind))).toHaveLength(50)
      const challenge = createFighterChallenge({
        unitId: 'unit-01', allWords: unit1Vocabulary, weakWords: {}, reviewIndex: index,
        recentWordIds: [], energy: 4, challengeIndex: index,
      })
      expect(challenge?.kind).toBe(kind)
      if (kind === 'audio') expect(challenge?.steps[0].audio).toBe(challenge?.word.audio)
    })
  })

  it('softly mixes source parts while preserving Unit-wide weak-word review priority', () => {
    const recentWordIds: string[] = []
    const selectedParts: Array<UnitWord['sourcePart']> = []
    for (let taskIndex = 0; taskIndex < 10; taskIndex += 1) {
      const scheduled = chooseScheduledWord({
        words: unit1Vocabulary, moduleId: 'word-strike', unitId: 'unit-01', weakWords: {},
        taskIndex, recentWordIds: recentWordIds.slice(-4),
      })!
      selectedParts.push(scheduled.word.sourcePart)
      recentWordIds.push(scheduled.word.id)
    }
    expect(new Set(selectedParts.slice(0, 5))).toEqual(new Set([1, 2, 3, 4, 5]))
    expect(selectedParts.every((part, index) => index === 0 || part !== selectedParts[index - 1])).toBe(true)

    const weakWord = unit1Vocabulary.find((word) => word.sourcePart === 1)!
    const weakWords = recordSpellingMistake({}, 'unit-01', weakWord.id, 0, 100)
    const scheduledReview = chooseScheduledWord({
      words: unit1Vocabulary, moduleId: 'code-fighter', unitId: 'unit-01', weakWords, taskIndex: 4,
      recentWordIds: [2, 3, 4, 5].map((part) => unit1Vocabulary.find((word) => word.sourcePart === part)!.id),
    })
    expect(scheduledReview).toMatchObject({ isReview: true, word: { id: weakWord.id, sourcePart: 1 } })
  })
})
