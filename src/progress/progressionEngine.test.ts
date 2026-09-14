import { describe, expect, it } from 'vitest'
import { moduleMedals } from '../data/rewards'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { moduleIds, type ModuleAttempt, type ModuleId } from '../types/game'
import { recordSpellingMistake } from '../learning/weakWordEngine'
import { toCityRevealStage } from '../data/cityReveal'
import { createProgress } from './localProgressRepository'
import { applyModuleAttempt, chestTierForUnit, claimUnitReward, completedModuleCount, completedUnitCount, evolutionStageFor, isModuleComplete, isUnitComplete, isUnitUnlocked } from './progressionEngine'

const attempt = ({
  moduleId = 'repair',
  wordId,
  correct = true,
  weakWords = {},
  sessionCompleted = false,
  accuracy = .8,
  unitId = 'unit-01',
  variantId,
  variantDifficulty,
}: Partial<ModuleAttempt> & { moduleId?: ModuleId } = {}): ModuleAttempt => ({
  unitId,
  moduleId,
  wordId,
  correct,
  weakWords,
  accuracy,
  sessionCompleted,
  variantId,
  variantDifficulty,
})

function trainWords(moduleId: ModuleId, wordIds: string[], progress = createProgress(1)) {
  return wordIds.reduce((current, wordId, index) => applyModuleAttempt(current, attempt({ moduleId, wordId, sessionCompleted: index === wordIds.length - 1 })), progress)
}

function trainFullModule(moduleId: ModuleId, progress = createProgress(1)) {
  return trainWords(moduleId, unit1Vocabulary.map((word) => word.id), progress)
}

describe('coverage-based progression', () => {
  it('maps genuinely completed cities to the four evolution stages', () => {
    expect([0, 2, 3, 5, 8, 9].map(evolutionStageFor)).toEqual([1, 1, 2, 3, 4, 4])
  })

  it('treats five answered tasks as one session and only 5/50 module coverage', () => {
    const progress = trainWords('repair', unit1Vocabulary.slice(0, 5).map((word) => word.id))
    const repair = progress.units['unit-01'].modules.repair
    expect(repair.trainedWordIds).toHaveLength(5)
    expect(repair.completed).toBe(false)
    expect(repair.bestAccuracy).toBe(.8)
    expect(repair.stars).toBe(3)
    expect(completedModuleCount(progress, 'unit-01')).toBe(0)
    expect(progress.inventory[moduleMedals.repair.id]).toBeUndefined()
  })

  it('does not increase coverage when the same five IDs are practised again', () => {
    const wordIds = unit1Vocabulary.slice(0, 5).map((word) => word.id)
    const first = trainWords('repair', wordIds)
    const repeated = trainWords('repair', wordIds, first)
    expect(repeated.units['unit-01'].modules.repair.trainedWordIds).toHaveLength(5)
  })

  it('accumulates coverage across Parts and preserves it when switching back', () => {
    const part1 = unit1Vocabulary.filter((word) => word.sourcePart === 1).map((word) => word.id)
    const part2 = unit1Vocabulary.filter((word) => word.sourcePart === 2).map((word) => word.id)
    const afterPart1 = trainWords('repair', part1)
    const afterPart2 = trainWords('repair', part2.slice(0, 5), afterPart1)
    const afterSwitchBack = trainWords('repair', part1.slice(0, 2), afterPart2)
    expect(part1).toHaveLength(11)
    expect(afterPart2.units['unit-01'].modules.repair.trainedWordIds).toHaveLength(16)
    expect(afterSwitchBack.units['unit-01'].modules.repair.trainedWordIds).toHaveLength(16)
  })

  it('counts a submitted wrong answer as exposure while Weak Word remains separate', () => {
    const word = unit1Vocabulary[0]
    const weakWords = recordSpellingMistake({}, 'unit-01', word.id, 0, 100)
    const progress = applyModuleAttempt(createProgress(1), attempt({ wordId: word.id, correct: false, weakWords, variantId: 'repair.definition.d1.mask', variantDifficulty: 1 }))
    expect(progress.units['unit-01'].modules.repair.trainedWordIds).toEqual([word.id])
    expect(progress.weakWords[`unit-01:${word.id}`].mistakeCount).toBe(1)
    expect(progress.units['unit-01'].modules.repair.completed).toBe(false)
    expect(progress.units['unit-01'].modules.repair.variantStateByWordId[word.id]).toMatchObject({ lastVariantId: 'repair.definition.d1.mask', difficulty: 1, lastCorrect: false })
  })

  it('does not count an abandoned or uncommitted task', () => {
    const untouched = createProgress(1)
    expect(untouched.units['unit-01'].modules.repair.trainedWordIds).toEqual([])
    const sessionSignalOnly = applyModuleAttempt(untouched, attempt({ sessionCompleted: true }))
    expect(sessionSignalOnly.units['unit-01'].modules.repair.trainedWordIds).toEqual([])
    expect(sessionSignalOnly.units['unit-01'].modules.repair.variantStateByWordId).toEqual({})
  })

  it('completes and medals a module exactly once at full eligible coverage', () => {
    let progress = trainFullModule('repair')
    const completedAt = progress.units['unit-01'].modules.repair.firstCompletedAt
    expect(progress.units['unit-01'].modules.repair).toMatchObject({ completed: true })
    expect(progress.units['unit-01'].modules.repair.trainedWordIds).toHaveLength(50)
    expect(progress.inventory[moduleMedals.repair.id]).toBe(1)
    expect(completedModuleCount(progress, 'unit-01')).toBe(1)

    progress = applyModuleAttempt(progress, attempt({ wordId: unit1Vocabulary[0].id }), 999)
    expect(progress.inventory[moduleMedals.repair.id]).toBe(1)
    expect(progress.units['unit-01'].modules.repair.firstCompletedAt).toBe(completedAt)
  })

  it('advances city stages only for fully covered modules', () => {
    let progress = trainWords('repair', unit1Vocabulary.slice(0, 5).map((word) => word.id))
    for (const moduleId of moduleIds.filter((id) => id !== 'repair')) {
      progress = trainWords(moduleId, unit1Vocabulary.slice(0, 5).map((word) => word.id), progress)
    }
    expect(completedModuleCount(progress, 'unit-01')).toBe(0)
    progress = trainFullModule('repair', progress)
    expect(completedModuleCount(progress, 'unit-01')).toBe(1)
    expect(progress.units['unit-01'].completed).toBe(false)
  })

  it('restores the Unit, unlocks the next city, and allows one chest only after all five full modules', () => {
    let progress = createProgress(1)
    for (const moduleId of moduleIds) progress = trainFullModule(moduleId, progress)
    expect(completedModuleCount(progress, 'unit-01')).toBe(5)
    expect(progress.units['unit-01'].completed).toBe(true)
    expect(isUnitUnlocked(progress, 1, false)).toBe(true)
    expect(moduleIds.every((moduleId) => progress.inventory[moduleMedals[moduleId].id] === 1)).toBe(true)

    const claimed = claimUnitReward(progress, 'unit-01')
    const replayClaim = claimUnitReward(claimed, 'unit-01')
    expect(claimed.inventory.starCoins).toBe(100)
    expect(replayClaim.inventory.starCoins).toBe(100)
    expect(chestTierForUnit(progress, 'unit-01')).toBe('epic')
  })

  it('advances the complete Unit 1 flow exactly 0→1→2→3→4→5 by independent full-module coverage', () => {
    let progress = createProgress(1)
    expect(completedModuleCount(progress, 'unit-01')).toBe(0)
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-01'))).toBe(0)
    expect(isUnitUnlocked(progress, 1, false)).toBe(true)
    expect(claimUnitReward(progress, 'unit-01')).toBe(progress)

    for (const [index, moduleId] of moduleIds.entries()) {
      if (moduleId === 'error-hunt') {
        progress = trainWords(moduleId, unit1Vocabulary.slice(0, 5).map((word) => word.id), progress)
        expect(completedModuleCount(progress, 'unit-01')).toBe(1)
        expect(isModuleComplete(progress, 'unit-01', moduleId)).toBe(false)
        progress = trainWords(moduleId, unit1Vocabulary.slice(5).map((word) => word.id), progress)
      } else {
        progress = trainFullModule(moduleId, progress)
      }

      const expectedCompleted = index + 1
      expect(completedModuleCount(progress, 'unit-01')).toBe(expectedCompleted)
      expect(toCityRevealStage(completedModuleCount(progress, 'unit-01'))).toBe(expectedCompleted)
      expect(isModuleComplete(progress, 'unit-01', moduleId)).toBe(true)
      expect(progress.inventory[moduleMedals[moduleId].id]).toBe(1)

      const completedAt = progress.units['unit-01'].modules[moduleId].firstCompletedAt
      progress = trainWords(moduleId, [unit1Vocabulary[0].id], progress)
      expect(progress.units['unit-01'].modules[moduleId].firstCompletedAt).toBe(completedAt)
      expect(progress.inventory[moduleMedals[moduleId].id]).toBe(1)

      if (expectedCompleted < moduleIds.length) {
        expect(isUnitComplete(progress, 'unit-01')).toBe(false)
        expect(isUnitUnlocked(progress, 1, false)).toBe(true)
        expect(claimUnitReward(progress, 'unit-01')).toBe(progress)
      }
    }

    expect(isUnitComplete(progress, 'unit-01')).toBe(true)
    expect(completedUnitCount(progress)).toBe(1)
    expect(isUnitUnlocked(progress, 1, false)).toBe(true)
    const claimed = claimUnitReward(progress, 'unit-01')
    expect(claimed.inventory.starCoins).toBe(100)
    expect(claimUnitReward(claimed, 'unit-01')).toBe(claimed)
  })

  it('does not trust stale completion flags for city count, chest or sequential unlock', () => {
    const progress = createProgress(1)
    progress.units['unit-01'].completed = true
    for (const moduleId of moduleIds) progress.units['unit-01'].modules[moduleId].completed = true

    expect(completedModuleCount(progress, 'unit-01')).toBe(0)
    expect(isUnitComplete(progress, 'unit-01')).toBe(false)
    expect(isUnitUnlocked(progress, 1, false)).toBe(true)
    expect(claimUnitReward(progress, 'unit-01')).toBe(progress)
  })

  it('keeps avatar evolution tied to demonstrably restored cities rather than stale flags or sessions', () => {
    let progress = createProgress(1)
    progress.units['unit-01'].completed = true
    expect(completedUnitCount(progress)).toBe(0)
    expect(evolutionStageFor(completedUnitCount(progress))).toBe(1)

    progress = trainWords('repair', unit1Vocabulary.slice(0, 5).map((word) => word.id), progress)
    expect(progress.avatarEvolutionStage).toBe(1)
  })

  it('keeps Units 3–9 pending while their production vocabulary is empty', () => {
    let progress = createProgress(1)
    for (let number = 3; number <= 9; number += 1) {
      progress = applyModuleAttempt(progress, attempt({ unitId: `unit-${String(number).padStart(2, '0')}`, moduleId: 'repair', wordId: 'invented' }))
    }
    for (let number = 3; number <= 9; number += 1) {
      const unitId = `unit-${String(number).padStart(2, '0')}`
      expect(progress.units[unitId].modules.repair.trainedWordIds).toEqual([])
      expect(progress.units[unitId].completed).toBe(false)
      expect(completedModuleCount(progress, unitId)).toBe(0)
    }
  })
})
