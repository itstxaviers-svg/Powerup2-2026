import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../../data/unit1Vocabulary'
import { recordSpellingMistake, weakWordKey } from '../../learning/weakWordEngine'
import type { UnitWord } from '../../types/game'
import { damageRepairTarget, isAcceptedRepairAnswer, isRepairEligible, repairClueFor } from './repairEngine'

const targetsToCheck = [
  'air',
  'field',
  'mountain',
  'tractor',
  'toothbrush',
  'pick up rubbish',
  'turn off the lights',
  'keep someone healthy',
  'time to run',
]

const wordByTarget = (target: string) => unit1Vocabulary.find((word) => word.word === target)!
const letterCount = (value: string) => [...value].filter((character) => /[a-z]/i.test(character)).length

describe('Repair engine', () => {
  it('damages approximately 20–40% of letters without producing blank or unchanged targets', () => {
    unit1Vocabulary.forEach((word, index) => {
      const damaged = damageRepairTarget(word.word, index)
      const missing = [...damaged].filter((character) => character === '_').length
      const ratio = missing / letterCount(word.word)
      expect(damaged).not.toBe(word.word)
      expect(missing).toBeGreaterThan(0)
      expect(missing).toBeLessThan(letterCount(word.word))
      expect(ratio).toBeGreaterThanOrEqual(.2)
      expect(ratio).toBeLessThanOrEqual(.4)
    })
  })

  it('keeps short and normal words recognizable with internal letters preferred', () => {
    expect(damageRepairTarget('air', 0)).toBe('a_r')
    for (const target of ['field', 'mountain', 'tractor', 'toothbrush']) {
      const damaged = damageRepairTarget(target, 2)
      expect(damaged[0]).toBe(target[0])
      expect(damaged.at(-1)).toBe(target.at(-1))
      expect(damaged).toMatch(/_/)
    }
  })

  it('can increase the amount of guided damage on later variants', () => {
    const missing = ([1, 2, 3] as const).map((difficulty) => [...damageRepairTarget('toothbrush', 2, difficulty)].filter((character) => character === '_').length)
    expect(missing[1]).toBeGreaterThanOrEqual(missing[0])
    expect(missing[2]).toBeGreaterThan(missing[1])
  })

  it.each(targetsToCheck)('preserves spelling structure for %s', (target) => {
    const damaged = damageRepairTarget(target, 4)
    expect(damaged).toHaveLength(target.length)
    ;[...target].forEach((character, index) => {
      if (!/[a-z]/i.test(character)) expect(damaged[index]).toBe(character)
      else if (damaged[index] !== '_') expect(damaged[index]).toBe(character)
    })
    target.split(' ').forEach((word, index) => {
      expect(damaged.split(' ')[index]).toMatch(/[a-z]/i)
      expect(damaged.split(' ')[index]).toHaveLength(word.length)
    })
  })

  it('preserves spaces, apostrophes, and punctuation across phrase variants', () => {
    const target = "don't move, please!"
    const damaged = damageRepairTarget(target, 3)
    expect(damaged.match(/ /g)).toEqual(target.match(/ /g))
    expect(damaged).toContain("'")
    expect(damaged).toContain(',')
    expect(damaged).toContain('!')
    expect(damaged.split(' ').every((word) => /[a-z]/i.test(word))).toBe(true)
  })

  it('selects exactly one meaningful production clue and varies its source', () => {
    const tractor = wordByTarget('tractor')
    const clues = [0, 1, 2].map((index) => repairClueFor(tractor, index))
    expect(clues).toEqual([
      { type: 'definition', label: 'Definition', text: 'a farm vehicle used for pulling machines' },
      { type: 'example', label: 'In a sentence', text: 'The tractor is blue.' },
      { type: 'translation', label: 'Russian meaning', text: 'трактор' },
    ])
    expect(unit1Vocabulary.every(isRepairEligible)).toBe(true)
    expect(repairClueFor({ id: 'empty', word: 'empty' }, 0)).toBeNull()
  })

  it('validates the complete canonical target and configured accepted forms only', () => {
    expect(isAcceptedRepairAnswer(wordByTarget('mountain'), 'mountain')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('mountain'), 'mountains')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('flower'), 'flowers')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('factory'), 'factories')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('leaves'), 'leaf')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('keep someone healthy'), 'keep us healthy')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('keep someone healthy'), 'keep them healthy')).toBe(true)
    expect(isAcceptedRepairAnswer(wordByTarget('mountain'), 'ountai')).toBe(false)
    expect(isAcceptedRepairAnswer(wordByTarget('mountain'), 'mountan')).toBe(false)
  })

  it('never uses Error Hunt typo metadata to build a Repair pattern', () => {
    const word: UnitWord = { id: 'tractor', word: 'tractor', definition: 'a farm vehicle', typoForms: ['tracter'] }
    const damaged = damageRepairTarget(word.word, 0)
    expect(damaged).not.toBe(word.typoForms?.[0])
    ;[...damaged].forEach((character, index) => {
      if (character !== '_') expect(character).toBe(word.word[index])
    })
  })

  it('keeps an incorrect complete Repair answer compatible with the existing Weak Word path', () => {
    const word = wordByTarget('field')
    expect(isAcceptedRepairAnswer(word, 'fild')).toBe(false)
    const weakWords = recordSpellingMistake({}, 'unit-01', word.id, 0, 100)
    expect(weakWords[weakWordKey('unit-01', word.id)]).toMatchObject({ wordId: word.id, mistakeCount: 1, mastered: false })
  })
})
