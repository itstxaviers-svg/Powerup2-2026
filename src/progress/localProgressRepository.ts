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

const STORAGE_KEY = 'power-up-2-progress-v1'
const PROFILE_INDEX_KEY = 'power-up-2-profile-index-v1'
const ACTIVE_PROFILE_KEY = 'power-up-2-active-profile-v1'
const profileKey = (id: string) => `power-up-2-profile-v1:${id}`
export const CURRENT_SCHEMA_VERSION = 12
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

export const isSavedGame = (value: unknown): value is SavedGame => {
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

function profileIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROFILE_INDEX_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && id.length > 0) : []
  } catch { return [] }
}

function readGame(key: string): SavedGame | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSavedGame(parsed) ? migrateSavedGame(parsed) : null
  } catch { return null }
}

export function savedProfiles(): PlayerProfile[] {
  const profiles = profileIds().map((id) => readGame(profileKey(id))?.profile).filter((profile): profile is PlayerProfile => Boolean(profile))
  const legacy = readGame(STORAGE_KEY)?.profile
  if (legacy && !profiles.some((profile) => profile.playerId === legacy.playerId)) profiles.push(legacy)
  return profiles.sort((a, b) => b.createdAt - a.createdAt)
}

export function activateSavedProfile(id: string): SavedGame | null {
  const game = readGame(profileKey(id)) ?? (readGame(STORAGE_KEY)?.profile.playerId === id ? readGame(STORAGE_KEY) : null)
  if (!game || !localProgressRepository.save(game)) return null
  return game
}

export function signOutSavedProfile(): boolean {
  try { localStorage.setItem(ACTIVE_PROFILE_KEY, ''); return true }
  catch { return false }
}

export function migrateSavedGame(parsed: SavedGame): SavedGame {
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
      const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (activeId === '') return null
      if (activeId) {
        const active = readGame(profileKey(activeId))
        if (active) return active
        const legacy = readGame(STORAGE_KEY)
        return legacy?.profile.playerId === activeId ? legacy : null
      }
      const legacy = readGame(STORAGE_KEY)
      if (legacy) localProgressRepository.save(legacy)
      return legacy
    } catch {
      return null
    }
  },
  save(game) {
    try {
      const id = game.profile.playerId
      if (!id) return false
      localStorage.setItem(profileKey(id), JSON.stringify(game))
      const ids = profileIds()
      if (!ids.includes(id)) localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify([...ids, id]))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
      localStorage.setItem(ACTIVE_PROFILE_KEY, id)
      return true
    } catch {
      return false
    }
  },
  clear() {
    try {
      const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY) || readGame(STORAGE_KEY)?.profile.playerId
      if (activeId) {
        localStorage.removeItem(profileKey(activeId))
        localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(profileIds().filter((id) => id !== activeId)))
      }
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(ACTIVE_PROFILE_KEY, '')
      return true
    } catch {
      return false
    }
  },
}
