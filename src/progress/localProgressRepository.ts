import { moduleIds } from '../types/game'
import type { GameSettings, ModuleProgress, PlayerProfile, PlayerProgress, SavedGame, UnitProgress } from '../types/game'
import type { ProgressRepository } from './progressRepository'
import { moduleMedals } from '../data/rewards'
import { units } from '../data/units'
import { eligibleWordIdsForModule } from '../learning/moduleCoverage'
import { defaultVocabularyPartSelections, normalizeVocabularyPartSelections } from '../learning/vocabularyParts'
import { completedUnitCount, evolutionStageFor } from './progressionEngine'
import { blankFightingLevelProgress, normalizeFightingLevelProgress } from '../games/fighting-level/fightingLevelEngine'
import { fightingMilestoneIds } from '../games/fighting-level/fightingLevelConfig'
import { queueGameSnapshot } from '../cloud/syncQueue'

const STORAGE_KEY = 'power-up-2-progress-v1'
export const CURRENT_SCHEMA_VERSION = 11
export const defaultSettings: GameSettings = { musicEnabled: true, sfxEnabled: true, reducedMotion: false }

const blankModule = (): ModuleProgress => ({ completed: false, trainedWordIds: [], bestAccuracy: 0, attempts: 0, stars: 0, variantStateByWordId: {} })

const blankUnit = (): UnitProgress => ({
  modules: Object.fromEntries(moduleIds.map((moduleId) => [moduleId, blankModule()])) as UnitProgress['modules'],
  completed: false,
  rewardClaimed: false,
  restorationCelebrated: false,
})

export const createProgress = (avatarId: number): PlayerProgress => ({
  units: Object.fromEntries(units.map((unit) => [unit.id, blankUnit()])),
  weakWords: {},
  vocabularyPartSelections: defaultVocabularyPartSelections(units),
  inventory: {},
  avatarId,
  avatarEvolutionStage: 1,
  acknowledgedEvolutionStage: 1,
  reviewClock: 0,
  wordStrikeTutorialSeen: false,
  fightingLevels: Object.fromEntries(fightingMilestoneIds.map((id) => [id, blankFightingLevelProgress(id)])) as PlayerProgress['fightingLevels'],
  worldCompletionCelebrated: false,
  achievements: {},
})

export const createProfile = (name: string, group: string, avatarId: number): PlayerProfile => ({
  playerId: crypto.randomUUID(),
  name: name.trim(),
  group: group.trim(),
  avatarId,
  avatarEvolutionStage: 1,
  createdAt: Date.now(),
})

const isSavedGame = (value: unknown): value is SavedGame => {
  if (!value || typeof value !== 'object') return false
  const game = value as Partial<SavedGame>
  return Boolean(
    game.profile
      && game.progress
      && typeof game.profile.name === 'string'
      && Number.isInteger(game.profile.avatarId)
      && game.profile.avatarId >= 1
      && game.profile.avatarId <= 10
      && typeof game.progress === 'object'
      && game.progress.units
      && typeof game.progress.units === 'object',
  )
}

function migrateGame(parsed: SavedGame): SavedGame {
  const fresh = createProgress(parsed.profile.avatarId)
  const unitsProgress = Object.fromEntries(units.map((unit) => {
    const savedUnit = parsed.progress.units[unit.id]
    if (!savedUnit) return [unit.id, fresh.units[unit.id]]
    const modules = Object.fromEntries(moduleIds.map((moduleId) => {
      const savedModule = savedUnit.modules?.[moduleId]
      const requiredIds = new Set(eligibleWordIdsForModule(unit.words, moduleId))
      const trainedWordIds = [...new Set(Array.isArray(savedModule?.trainedWordIds)
        ? savedModule.trainedWordIds.filter((id): id is string => typeof id === 'string' && requiredIds.has(id))
        : [])]
      const variantStateByWordId = savedModule?.variantStateByWordId && typeof savedModule.variantStateByWordId === 'object'
        ? savedModule.variantStateByWordId
        : {}
      const completed = requiredIds.size > 0 && trainedWordIds.length === requiredIds.size
      return [moduleId, { ...blankModule(), ...savedModule, trainedWordIds, variantStateByWordId, completed, firstCompletedAt: completed ? savedModule?.firstCompletedAt : undefined }]
    })) as UnitProgress['modules']
    const completed = moduleIds.every((moduleId) => modules[moduleId].completed)
    return [unit.id, {
      ...fresh.units[unit.id],
      ...savedUnit,
      modules,
      completed,
      completedAt: completed ? savedUnit.completedAt : undefined,
      rewardClaimed: Boolean(savedUnit.rewardClaimed),
      restorationCelebrated: completed && Boolean(savedUnit.restorationCelebrated ?? savedUnit.rewardClaimed),
    }]
  })) as PlayerProgress['units']
  let progress: PlayerProgress = {
    ...fresh,
    ...parsed.progress,
    units: unitsProgress,
    weakWords: parsed.progress.weakWords ?? {},
    vocabularyPartSelections: normalizeVocabularyPartSelections(units, parsed.progress.vocabularyPartSelections),
    inventory: { ...(parsed.progress.inventory ?? {}) },
    reviewClock: Number.isFinite(parsed.progress.reviewClock) ? parsed.progress.reviewClock : 0,
    wordStrikeTutorialSeen: Boolean(parsed.progress.wordStrikeTutorialSeen),
    fightingLevels: Object.fromEntries(fightingMilestoneIds.map((id) => [id, normalizeFightingLevelProgress(id, parsed.progress.fightingLevels?.[id])])) as PlayerProgress['fightingLevels'],
    worldCompletionCelebrated: Boolean(parsed.progress.worldCompletionCelebrated),
    achievements: parsed.progress.achievements ?? {},
    acknowledgedEvolutionStage: 1,
  }
  moduleIds.forEach((moduleId) => {
    const medalId = moduleMedals[moduleId].id
    if (units.some((unit) => progress.units[unit.id].modules[moduleId].completed)) progress.inventory[medalId] = 1
    else delete progress.inventory[medalId]
  })
  const avatarEvolutionStage = evolutionStageFor(completedUnitCount(progress))
  progress = {
    ...progress,
    avatarEvolutionStage,
    acknowledgedEvolutionStage: Math.min(parsed.progress.acknowledgedEvolutionStage ?? avatarEvolutionStage, avatarEvolutionStage) as PlayerProgress['acknowledgedEvolutionStage'],
  }
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: { ...parsed.profile, avatarEvolutionStage: progress.avatarEvolutionStage },
    progress,
    settings: { ...defaultSettings, ...parsed.settings },
  }
}

export const localProgressRepository: ProgressRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed: unknown = JSON.parse(raw)
      if (!isSavedGame(parsed)) return null
      return migrateGame(parsed)
    } catch {
      return null
    }
  },
  save(game) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
      void queueGameSnapshot(game)
    } catch {
      // The app remains usable if browser storage is disabled or full.
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Deliberately ignore unavailable storage.
    }
  },
}
