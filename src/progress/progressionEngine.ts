import { moduleMedals, rewardsForUnit, type AchievementId, type ChestTier } from '../data/rewards'
import { units } from '../data/units'
import { coverageForModule, coverageForTrainedWordIds, eligibleWordIdsForModule } from '../learning/moduleCoverage'
import { recordQuestionVariant } from '../learning/questionVariation'
import { moduleIds, type ModuleAttempt, type PlayerProgress } from '../types/game'

export const completedModuleCount = (progress: PlayerProgress, unitId: string) => {
  const unit = units.find((candidate) => candidate.id === unitId)
  const unitProgress = progress.units[unitId]
  if (!unit || !unitProgress) return 0
  return moduleIds.filter((moduleId) => coverageForModule(unit, moduleId, unitProgress.modules[moduleId]).complete).length
}

export const isModuleComplete = (progress: PlayerProgress, unitId: string, moduleId: ModuleAttempt['moduleId']) => {
  const unit = units.find((candidate) => candidate.id === unitId)
  const moduleProgress = progress.units[unitId]?.modules[moduleId]
  return Boolean(unit && moduleProgress && coverageForModule(unit, moduleId, moduleProgress).complete)
}

export const isUnitComplete = (progress: PlayerProgress, unitId: string) => completedModuleCount(progress, unitId) === moduleIds.length

export const completedUnitCount = (progress: PlayerProgress) =>
  units.filter((unit) => isUnitComplete(progress, unit.id)).length

export function evolutionStageFor(completedUnits: number): 1 | 2 | 3 | 4 {
  if (completedUnits >= 8) return 4
  if (completedUnits >= 5) return 3
  if (completedUnits >= 3) return 2
  return 1
}

export const initiallyAvailableUnitIds = new Set(['unit-01', 'unit-02'])

export function isUnitUnlocked(progress: PlayerProgress, unitIndex: number, unlockAll = import.meta.env.VITE_UNLOCK_ALL_UNITS === 'true' || import.meta.env.VITE_DEMO_MODE === 'true') {
  const unit = units[unitIndex]
  const previousUnit = units[unitIndex - 1]
  return unlockAll || Boolean(unit && initiallyAvailableUnitIds.has(unit.id)) || Boolean(previousUnit && isUnitComplete(progress, previousUnit.id))
}

const withAchievement = (progress: PlayerProgress, id: AchievementId, now: number) =>
  progress.achievements[id] ? progress : { ...progress, achievements: { ...progress.achievements, [id]: { unlockedAt: now } } }

export function applyModuleAttempt(progress: PlayerProgress, attempt: ModuleAttempt, now = Date.now()): PlayerProgress {
  const previousUnit = progress.units[attempt.unitId]
  const unitData = units.find((unit) => unit.id === attempt.unitId)
  if (!previousUnit || !unitData) return progress
  const previousModule = previousUnit.modules[attempt.moduleId]
  const requiredIds = eligibleWordIdsForModule(unitData.words, attempt.moduleId)
  const required = new Set(requiredIds)
  const trainedWordIds = [...new Set([
    ...previousModule.trainedWordIds.filter((id) => required.has(id)),
    ...(attempt.wordId && required.has(attempt.wordId) ? [attempt.wordId] : []),
  ])]
  const completed = coverageForTrainedWordIds(unitData, attempt.moduleId, trainedWordIds).complete
  const firstModuleCompletion = completed && !coverageForModule(unitData, attempt.moduleId, previousModule).complete
  const variantStateByWordId = attempt.wordId && attempt.variantId && attempt.variantDifficulty
    ? recordQuestionVariant(previousModule.variantStateByWordId, attempt.wordId, attempt.variantId, attempt.variantDifficulty, attempt.correct)
    : previousModule.variantStateByWordId
  const module = {
    ...previousModule,
    trainedWordIds,
    variantStateByWordId,
    attempts: previousModule.attempts + 1,
    bestAccuracy: attempt.sessionCompleted ? Math.max(previousModule.bestAccuracy, attempt.accuracy) : previousModule.bestAccuracy,
    stars: attempt.sessionCompleted ? Math.max(previousModule.stars, attempt.accuracy >= .8 ? 3 : attempt.accuracy >= .6 ? 2 : 1) : previousModule.stars,
    completed,
    firstCompletedAt: completed ? previousModule.firstCompletedAt ?? now : undefined,
  }
  const nextUnit = { ...previousUnit, modules: { ...previousUnit.modules, [attempt.moduleId]: module } }
  const unitCompleted = moduleIds.every((moduleId) => coverageForModule(unitData, moduleId, nextUnit.modules[moduleId]).complete)
  nextUnit.completed = unitCompleted
  nextUnit.completedAt = unitCompleted ? nextUnit.completedAt ?? now : undefined
  let next: PlayerProgress = {
    ...progress,
    reviewClock: progress.reviewClock + (attempt.advanceReviewClock === false ? 0 : 1),
    weakWords: attempt.weakWords,
    units: { ...progress.units, [attempt.unitId]: nextUnit },
  }
  if (firstModuleCompletion) {
    const medal = moduleMedals[attempt.moduleId]
    next = { ...next, inventory: { ...next.inventory, [medal.id]: Math.max(1, next.inventory[medal.id] ?? 0) } }
    if (attempt.moduleId === 'repair') next = withAchievement(next, 'first-repair', now)
  }
  if (attempt.moduleId === 'code-fighter' && attempt.sessionWon) next = withAchievement(next, 'fighter-victory', now)
  if (attempt.sessionCompleted && attempt.moduleId === 'audio-code' && attempt.accuracy === 1) next = withAchievement(next, 'perfect-audio', now)
  if (attempt.sessionCompleted && attempt.moduleId === 'word-strike' && attempt.accuracy >= .9) next = withAchievement(next, 'strike-champion', now)
  const masteredNow = Object.entries(attempt.weakWords).some(([key, record]) => record.mastered && !progress.weakWords[key]?.mastered)
  if (masteredNow) next = withAchievement(next, 'review-master', now)
  const completedUnits = completedUnitCount(next)
  next = { ...next, avatarEvolutionStage: evolutionStageFor(completedUnits) }
  if (completedUnits >= 1) next = withAchievement(next, 'first-unit', now)
  if (completedUnits >= 3) next = withAchievement(next, 'three-units', now)
  if (completedUnits >= 6) next = withAchievement(next, 'six-units', now)
  if (completedUnits >= 9) next = withAchievement(next, 'world-restored', now)
  return next
}

export function chestTierForUnit(progress: PlayerProgress, unitId: string): ChestTier {
  const unit = progress.units[unitId]
  if (!unit) return 'common'
  const modules = Object.values(unit.modules)
  const average = modules.reduce((sum, module) => sum + module.bestAccuracy, 0) / modules.length
  if (average >= .97) return 'mythic'
  if (average >= .9) return 'legendary'
  if (average >= .8) return 'epic'
  if (average >= .7) return 'rare'
  if (average >= .6) return 'uncommon'
  return 'common'
}

export function claimUnitReward(progress: PlayerProgress, unitId: string): PlayerProgress {
  const unitProgress = progress.units[unitId]
  const unit = units.find((candidate) => candidate.id === unitId)
  if (!unit || !unitProgress || !isUnitComplete(progress, unitId) || unitProgress.rewardClaimed) return progress
  const inventory = { ...progress.inventory }
  for (const reward of rewardsForUnit(unit.number)) inventory[reward.id] = (inventory[reward.id] ?? 0) + reward.quantity
  return {
    ...progress,
    inventory,
    units: { ...progress.units, [unitId]: { ...unitProgress, rewardClaimed: true, restorationCelebrated: true } },
  }
}
