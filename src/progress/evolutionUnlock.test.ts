import { describe, expect, it } from 'vitest'
import { createProgress } from './localProgressRepository'
import { acknowledgeEvolutionUnlock, pendingEvolutionUnlock } from './evolutionUnlock'
import type { EvolutionStage } from '../data/avatarEvolution'

describe('persisted evolution unlock acknowledgement', () => {
  it.each([
    [1, 2],
    [2, 3],
    [3, 4],
  ] as Array<[EvolutionStage, EvolutionStage]>)('detects stage %i → %i exactly once', (previousStage, nextStage) => {
    const progress = { ...createProgress(1), avatarEvolutionStage: nextStage, acknowledgedEvolutionStage: previousStage }
    expect(pendingEvolutionUnlock(progress)).toEqual({ previousStage, nextStage })

    const acknowledged = acknowledgeEvolutionUnlock(progress, nextStage)
    expect(acknowledged.acknowledgedEvolutionStage).toBe(nextStage)
    expect(pendingEvolutionUnlock(acknowledged)).toBeNull()
  })

  it('does not replay Explorer or an already acknowledged stage', () => {
    expect(pendingEvolutionUnlock(createProgress(1))).toBeNull()
    const complete = { ...createProgress(1), avatarEvolutionStage: 4 as const, acknowledgedEvolutionStage: 4 as const }
    expect(pendingEvolutionUnlock(complete)).toBeNull()
    expect(acknowledgeEvolutionUnlock(complete, 3)).toBe(complete)
  })
})
