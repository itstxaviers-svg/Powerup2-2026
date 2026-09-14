import { beforeEach, describe, expect, it } from 'vitest'
import { pendingEvolutionUnlock } from './evolutionUnlock'
import { moduleMedals } from '../data/rewards'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { CURRENT_SCHEMA_VERSION, createProgress, localProgressRepository } from './localProgressRepository'
import { claimUnitReward, completedModuleCount, isUnitComplete, isUnitUnlocked } from './progressionEngine'
import { moduleIds } from '../types/game'

const memory = new Map<string, string>()

beforeEach(() => {
  memory.clear()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  } })
})

describe('versioned local progress', () => {
  it('preserves legacy statistics and review history without trusting old completion flags', () => {
    memory.set('power-up-2-progress-v1', JSON.stringify({
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress: {
        units: { 'unit-01': { modules: { repair: { completed: true, bestAccuracy: .8, attempts: 5, stars: 3 } }, completed: false, rewardClaimed: false } },
        weakWords: { 'unit-01:word': { unitId: 'unit-01', wordId: 'word', mastered: false } },
        inventory: { starCoins: 10, [moduleMedals.repair.id]: 1 }, avatarId: 3, avatarEvolutionStage: 1,
      },
    }))
    const game = localProgressRepository.load()
    expect(game?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(game?.progress.units['unit-01'].modules.repair.completed).toBe(false)
    expect(game?.progress.units['unit-01'].modules.repair.trainedWordIds).toEqual([])
    expect(game?.progress.units['unit-01'].modules.repair.variantStateByWordId).toEqual({})
    expect(game?.progress.units['unit-01'].modules.repair.bestAccuracy).toBe(.8)
    expect(game?.progress.units['unit-01'].modules['code-fighter'].completed).toBe(false)
    expect(game?.progress.weakWords['unit-01:word']).toBeDefined()
    expect(game?.progress.vocabularyPartSelections['unit-01']).toEqual([1])
    expect(game?.settings.musicEnabled).toBe(true)
    expect(game?.progress.acknowledgedEvolutionStage).toBe(1)
    expect(game?.progress.inventory.starCoins).toBe(10)
    expect(game?.progress.inventory[moduleMedals.repair.id]).toBeUndefined()
  })

  it('preserves stable trained IDs and recognizes only demonstrable full coverage', () => {
    const progress = createProgress(3)
    progress.units['unit-01'].modules.repair.trainedWordIds = unit1Vocabulary.map((word) => word.id)
    localProgressRepository.save({
      schemaVersion: 6,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    })
    const migrated = localProgressRepository.load()
    expect(migrated?.progress.units['unit-01'].modules.repair.trainedWordIds).toHaveLength(50)
    expect(migrated?.progress.units['unit-01'].modules.repair.completed).toBe(true)
    expect(migrated?.progress.inventory[moduleMedals.repair.id]).toBe(1)
  })

  it('adds a clean Unit 2 progress record without changing legacy Unit 1 coverage', () => {
    const progress = createProgress(3)
    progress.units['unit-01'].modules.repair.trainedWordIds = unit1Vocabulary.slice(0, 7).map((word) => word.id)
    const { ['unit-02']: _missingUnit2, ...legacyUnits } = progress.units
    memory.set('power-up-2-progress-v1', JSON.stringify({
      schemaVersion: 8,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress: { ...progress, units: legacyUnits },
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    }))

    const migrated = localProgressRepository.load()!
    expect(migrated.progress.units['unit-01'].modules.repair.trainedWordIds).toHaveLength(7)
    expect(migrated.progress.units['unit-02'].modules.repair.trainedWordIds).toEqual([])
    expect(migrated.progress.vocabularyPartSelections['unit-02']).toEqual([1])
  })

  it('drops unknown coverage IDs and refuses legacy flags as proof for chest or next-city access', () => {
    const progress = createProgress(3)
    progress.units['unit-01'].completed = true
    progress.units['unit-01'].modules.repair = {
      ...progress.units['unit-01'].modules.repair,
      completed: true,
      trainedWordIds: ['u1-field', 'invented', 'field'],
    }
    localProgressRepository.save({
      schemaVersion: 8,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    })

    const migrated = localProgressRepository.load()!
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(migrated.progress.units['unit-01'].modules.repair.trainedWordIds).toEqual(['u1-field'])
    expect(migrated.progress.units['unit-01'].modules.repair.completed).toBe(false)
    expect(migrated.progress.units['unit-01'].completed).toBe(false)
    expect(isUnitUnlocked(migrated.progress, 1, false)).toBe(true)
    expect(claimUnitReward(migrated.progress, 'unit-01')).toBe(migrated.progress)
  })

  it('preserves independent full-module coverage and reward state after reload', () => {
    const progress = createProgress(3)
    for (const moduleId of moduleIds) {
      progress.units['unit-01'].modules[moduleId].trainedWordIds = unit1Vocabulary.map((word) => word.id)
      progress.units['unit-01'].modules[moduleId].completed = true
      progress.inventory[moduleMedals[moduleId].id] = 1
    }
    progress.units['unit-01'].completed = true
    progress.units['unit-01'].rewardClaimed = true
    progress.units['unit-01'].restorationCelebrated = true
    progress.inventory.starCoins = 100
    localProgressRepository.save({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    })

    const reloaded = localProgressRepository.load()!
    expect(completedModuleCount(reloaded.progress, 'unit-01')).toBe(5)
    expect(isUnitComplete(reloaded.progress, 'unit-01')).toBe(true)
    expect(reloaded.progress.units['unit-01'].rewardClaimed).toBe(true)
    expect(reloaded.progress.inventory.starCoins).toBe(100)
    expect(claimUnitReward(reloaded.progress, 'unit-01')).toBe(reloaded.progress)
  })

  it('reconciles historical evolution stages with demonstrable restored-city coverage', () => {
    const historical = createProgress(3)
    historical.avatarEvolutionStage = 3
    const baseSave = {
      schemaVersion: 4,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 3 as const, createdAt: 1 },
      progress: historical,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    }
    const { acknowledgedEvolutionStage: _ignored, ...legacyProgress } = historical
    memory.set('power-up-2-progress-v1', JSON.stringify({ ...baseSave, progress: legacyProgress }))
    const migrated = localProgressRepository.load()
    expect(migrated?.progress.avatarEvolutionStage).toBe(1)
    expect(migrated?.progress.acknowledgedEvolutionStage).toBe(1)
    expect(migrated && pendingEvolutionUnlock(migrated.progress)).toBeNull()
  })

  it('fails safely for malformed storage', () => {
    memory.set('power-up-2-progress-v1', '{not-json')
    expect(localProgressRepository.load()).toBeNull()
  })

  it('persists the latest vocabulary Part selection without changing learning progress', () => {
    const progress = createProgress(3)
    progress.vocabularyPartSelections['unit-01'] = [2, 4, 5]
    progress.weakWords['unit-01:u1-field'] = { unitId: 'unit-01', wordId: 'u1-field', mistakeCount: 1, lastMistakeAt: 1, lastSeenAt: 1, reviewCount: 0, consecutiveReviewCorrect: 0, nextReviewAfter: 4, priority: 2, reviewStatus: 'active', mastered: false }
    localProgressRepository.save({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    })
    const reloaded = localProgressRepository.load()
    expect(reloaded?.progress.vocabularyPartSelections['unit-01']).toEqual([2, 4, 5])
    expect(reloaded?.progress.weakWords['unit-01:u1-field'].mistakeCount).toBe(1)
  })

  it('persists per-module question variation without sharing it with other games', () => {
    const progress = createProgress(3)
    progress.units['unit-01'].modules['audio-code'].variantStateByWordId['u1-get-up'] = { lastVariantId: 'audio-code.assemble', completedEncounters: 2, difficulty: 2, lastCorrect: false }
    localProgressRepository.save({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    })
    const reloaded = localProgressRepository.load()
    expect(reloaded?.progress.units['unit-01'].modules['audio-code'].variantStateByWordId['u1-get-up']).toMatchObject({ lastVariantId: 'audio-code.assemble', difficulty: 2 })
    expect(reloaded?.progress.units['unit-01'].modules.repair.variantStateByWordId['u1-get-up']).toBeUndefined()
  })

  it('migrates and preserves independent Fighting Level rosters and Battle 1 exclusions', () => {
    const progress = createProgress(3)
    progress.fightingLevels['after-unit-7'] = {
      milestoneId: 'after-unit-7', battleIndex: 1, battleRosterIds: [['u1-a', 'u2-b'], ['u4-c', 'u7-d']],
      passedBattleIndexes: [0], attemptCount: 2, bestAccuracy: .9, completed: false, exclusionWordIds: ['stale'], seenEnemyIntros: ['prism-wraith'],
    }
    localProgressRepository.save({
      schemaVersion: 9,
      profile: { playerId: 'one', name: 'Learner', group: '2B', avatarId: 3, avatarEvolutionStage: 1, createdAt: 1 },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    })

    const reloaded = localProgressRepository.load()!
    expect(reloaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(reloaded.progress.fightingLevels['after-unit-7'].battleIndex).toBe(1)
    expect(reloaded.progress.fightingLevels['after-unit-7'].passedBattleIndexes).toEqual([0])
    expect(reloaded.progress.fightingLevels['after-unit-7'].battleRosterIds[1]).toEqual(['u4-c', 'u7-d'])
    expect(reloaded.progress.fightingLevels['after-unit-7'].exclusionWordIds).toEqual(['u1-a', 'u2-b'])
    expect(reloaded.progress.fightingLevels['after-unit-7'].seenEnemyIntros).toEqual(['prism-wraith'])
    expect(reloaded.progress.fightingLevels['after-unit-3'].battleRosterIds).toEqual([])
  })
})
