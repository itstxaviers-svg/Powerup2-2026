import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { unit2Vocabulary } from '../data/unit2Vocabulary'
import { unit3Vocabulary } from '../data/unit3Vocabulary'
import { recordFightingBattleResult } from '../games/fighting-level/fightingLevelEngine'
import type { UnitData } from '../types/game'
import { prepareFullCheckpointProgress, validCheckpointDraft } from './fullCheckpointProgress'

const units: UnitData[] = [
  { id: 'unit-01', number: 1, title: 'Unit 1', words: unit1Vocabulary },
  { id: 'unit-02', number: 2, title: 'Unit 2', words: unit2Vocabulary },
  { id: 'unit-03', number: 3, title: 'Unit 3', words: unit3Vocabulary },
]

describe('standalone full Checkpoint 1', () => {
  it('includes every word exactly once and restores a completed-question draft', () => {
    const progress = prepareFullCheckpointProgress(null, units, 'learner-1')
    const roster = progress.battleRosterIds[0]
    expect(roster).toHaveLength(134)
    expect(new Set(roster).size).toBe(134)
    expect(validCheckpointDraft({ taskIndex: 2, correctCount: 1, mistakeWordIds: [roster[0]], rosterIds: roster }, progress)?.taskIndex).toBe(2)
  })

  it('keeps old attempts but requires a new 134-word pass', () => {
    const progress = prepareFullCheckpointProgress(null, units, 'learner-1')
    const legacy = recordFightingBattleResult({ ...progress, battleRosterIds: [progress.battleRosterIds[0].slice(0, 45)] }, 45, 45, [], 1_000)
    expect(legacy.completed).toBe(true)
    const migrated = prepareFullCheckpointProgress(legacy, units, 'learner-1')
    expect(migrated.completed).toBe(false)
    expect(migrated.attemptHistory).toHaveLength(1)
    expect(migrated.battleRosterIds[0]).toHaveLength(134)
    expect(recordFightingBattleResult(migrated, 114, 134, [], 2_000).completed).toBe(true)
  })
})
