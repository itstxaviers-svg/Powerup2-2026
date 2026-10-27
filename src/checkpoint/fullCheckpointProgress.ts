import { cumulativeFightingPool, fightingSeed, normalizeFightingLevelProgress } from '../games/fighting-level/fightingLevelEngine'
import type { FightingLevelProgress, UnitData } from '../types/game'

export type CheckpointDraft = {
  taskIndex: number
  correctCount: number
  mistakeWordIds: string[]
  rosterIds: string[]
}

export function prepareFullCheckpointProgress(saved: FightingLevelProgress | null, units: readonly UnitData[], learnerId: string): FightingLevelProgress {
  const progress = normalizeFightingLevelProgress('after-unit-3', saved ?? undefined)
  const ids = cumulativeFightingPool(units, 'after-unit-3').map(({ word }) => word.id)
  const existing = progress.battleRosterIds[0] ?? []
  const completeRoster = existing.length === ids.length && new Set(existing).size === ids.length && existing.every((id) => ids.includes(id))
  const roster = completeRoster ? existing : [...ids].sort((left, right) =>
    fightingSeed(`${learnerId}:${left}`) - fightingSeed(`${learnerId}:${right}`) || left.localeCompare(right),
  )
  const fullAttempts = progress.attemptHistory.filter((attempt) => attempt.total === ids.length)
  const completed = fullAttempts.some((attempt) => attempt.passed)
  return {
    ...progress,
    battleIndex: 0,
    battleRosterIds: [roster],
    exclusionWordIds: roster,
    passedBattleIndexes: completed ? [0] : [],
    completed,
    attemptCount: progress.attemptHistory.length,
    bestAccuracy: fullAttempts.reduce((best, attempt) => Math.max(best, attempt.total ? attempt.correct / attempt.total : 0), 0),
  }
}

export function validCheckpointDraft(value: CheckpointDraft | null, progress: FightingLevelProgress): CheckpointDraft | null {
  const roster = progress.battleRosterIds[0] ?? []
  if (!value || !Array.isArray(value.rosterIds) || value.rosterIds.length !== roster.length || value.rosterIds.some((id, index) => id !== roster[index])) return null
  if (!Number.isInteger(value.taskIndex) || value.taskIndex < 0 || value.taskIndex >= roster.length) return null
  if (!Number.isInteger(value.correctCount) || value.correctCount < 0 || value.correctCount > value.taskIndex) return null
  if (!Array.isArray(value.mistakeWordIds) || value.mistakeWordIds.length > value.taskIndex || value.mistakeWordIds.some((id) => !roster.includes(id))) return null
  if (value.correctCount + value.mistakeWordIds.length !== value.taskIndex) return null
  return value
}
