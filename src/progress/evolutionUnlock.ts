import type { EvolutionStage } from '../data/avatarEvolution'
import type { PlayerProgress } from '../types/game'

export type PendingEvolutionUnlock = {
  previousStage: EvolutionStage
  nextStage: EvolutionStage
}

export function pendingEvolutionUnlock(progress: PlayerProgress): PendingEvolutionUnlock | null {
  const nextStage = progress.avatarEvolutionStage
  if (nextStage <= progress.acknowledgedEvolutionStage || nextStage === 1) return null
  return { previousStage: (nextStage - 1) as EvolutionStage, nextStage }
}

export function acknowledgeEvolutionUnlock(progress: PlayerProgress, stage: EvolutionStage): PlayerProgress {
  const acknowledgedEvolutionStage = Math.min(stage, progress.avatarEvolutionStage) as EvolutionStage
  if (acknowledgedEvolutionStage <= progress.acknowledgedEvolutionStage) return progress
  return { ...progress, acknowledgedEvolutionStage }
}
