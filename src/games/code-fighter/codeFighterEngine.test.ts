import { describe, expect, it } from 'vitest'
import type { UnitWord } from '../../types/game'
import { availableFighterKinds, createFighterChallenge, damagedSpelling, opponents, resolveCombat, supportsFighterChallenge } from './codeFighterEngine'

const words: UnitWord[] = [
  { id: 'crystal', word: 'crystal', translation: 'кристалл', definition: 'a clear mineral', example: 'The ____ glowed.', image: 'crystal.png', audio: 'crystal.mp3', typoForms: ['crytal'] },
  { id: 'engine', word: 'engine', translation: 'двигатель', definition: 'a power machine', example: 'The ____ started.', audio: 'engine.mp3' },
]

describe('Code Fighter engine', () => {
  it('exposes all seven data-supported challenge types at full energy', () => {
    expect(availableFighterKinds(words, 4)).toEqual(['quick', 'defense', 'spelling', 'audio', 'meaning', 'combo', 'ultimate'])
    expect(availableFighterKinds(words, 3)).not.toContain('ultimate')
  })

  it('fails safely when vocabulary is empty or optional clues are absent', () => {
    expect(availableFighterKinds([], 4)).toEqual([])
    expect(createFighterChallenge({ unitId: 'unit-01', allWords: [], weakWords: {}, reviewIndex: 0, recentWordIds: [], energy: 0 })).toBeNull()
    expect(availableFighterKinds([{ id: 'plain', word: 'plain' }], 4)).toEqual(['defense', 'spelling'])
  })

  it('never uses Russian translations in Code Fighter clues or choices', () => {
    const translationOnly: UnitWord = { id: 'bridge', word: 'bridge', translation: 'мост' }
    expect(supportsFighterChallenge(translationOnly, 'quick')).toBe(false)
    expect(supportsFighterChallenge(translationOnly, 'meaning')).toBe(false)

    for (let challengeIndex = 0; challengeIndex < 7; challengeIndex += 1) {
      const challenge = createFighterChallenge({ unitId: 'unit-01', allWords: words, weakWords: {}, reviewIndex: challengeIndex, challengeIndex, recentWordIds: [], energy: 4 })
      const learnerText = challenge?.steps.flatMap((step) => [step.prompt, step.clue, ...(step.choices ?? [])]).filter(Boolean).join(' ') ?? ''
      expect(learnerText).not.toMatch(/[А-Яа-яЁё]/u)
    }
  })

  it('creates a three-stage combo with recognition, spelling, and context', () => {
    const challenge = createFighterChallenge({ unitId: 'unit-01', allWords: words, weakWords: {}, reviewIndex: 5, recentWordIds: [], energy: 4 })
    expect(challenge?.kind).toBe('combo')
    expect(challenge?.steps.map((step) => step.mode)).toEqual(['choice', 'text', 'choice'])
    expect(challenge?.steps.map((step) => step.spelling)).toEqual([false, true, false])
    expect(challenge?.steps[2].clue).toContain('____')
  })

  it('does not restart a mistaken word with the same easy challenge form', () => {
    const challenge = createFighterChallenge({
      unitId: 'unit-01', allWords: [words[0]], weakWords: {}, reviewIndex: 4, challengeIndex: 0, recentWordIds: [], energy: 4,
      variantStateByWordId: { crystal: { lastVariantId: 'code-fighter.quick', completedEncounters: 1, difficulty: 1, lastCorrect: false } },
    })!
    expect(challenge.kind).not.toBe('quick')
    expect(['spelling', 'defense', 'audio', 'combo', 'ultimate']).toContain(challenge.kind)
  })

  it('uses supplied spelling damage and supports both opponents', () => {
    expect(damagedSpelling(words[0])).toBe('crytal')
    expect(Object.keys(opponents)).toEqual(['kael', 'construct', 'lady-gearveil', 'chronofang', 'roseclock-duchess', 'thornbound-archivist'])
    expect(opponents.construct.boss).toBe(true)
  })

  it('resolves victory and defeat without negative health', () => {
    expect(resolveCombat({ playerHp: 10, opponentHp: 2, correct: true, challenge: { damage: 2 }, opponentDamage: 1 })).toMatchObject({ opponentHp: 0, outcome: 'victory' })
    expect(resolveCombat({ playerHp: 1, opponentHp: 9, correct: false, challenge: { damage: 1 }, opponentDamage: 2 })).toMatchObject({ playerHp: 0, outcome: 'defeat' })
  })
})
