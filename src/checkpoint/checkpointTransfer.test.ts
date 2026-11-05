import { describe, expect, it } from 'vitest'
import { blankFightingLevelProgress } from '../games/fighting-level/fightingLevelEngine'
import { checkpointBackup, parseCheckpointBackup } from './checkpointTransfer'

describe('Checkpoint 1 backup transfer', () => {
  it('keeps the learner, attempt history and unfinished question', () => {
    const progress = blankFightingLevelProgress('after-unit-3')
    progress.attemptCount = 2
    const data = { profile: { name: 'Sofy', group: '5A', localId: 'one' }, progress, draft: { taskIndex: 14, correctCount: 11, mistakeWordIds: ['u1-word'], rosterIds: ['u1-word'] } }
    const imported = parseCheckpointBackup(checkpointBackup(data))
    expect(imported.profile.localId).toBe('one')
    expect(imported.progress.attemptCount).toBe(2)
    expect(imported.draft?.taskIndex).toBe(14)
  })

  it('rejects files for other game modes', () => {
    expect(() => parseCheckpointBackup('{"kind":"power-up-2-explorer-backup"}')).toThrow()
  })
})
