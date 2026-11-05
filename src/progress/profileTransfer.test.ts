import { describe, expect, it } from 'vitest'
import { createProgress, CURRENT_SCHEMA_VERSION, defaultSettings } from './localProgressRepository'
import { explorerBackup, parseExplorerBackup } from './profileTransfer'

describe('explorer backup transfer', () => {
  it('round-trips identity, progress and settings without changing the learner id', () => {
    const progress = createProgress(2)
    progress.units['unit-01'].modules.repair.attempts = 7
    const game = { schemaVersion: CURRENT_SCHEMA_VERSION, profile: { playerId: 'learner-1', name: 'Sofy', group: '5A', avatarId: 2, avatarEvolutionStage: 1 as const, createdAt: 1 }, progress, settings: defaultSettings }
    const imported = parseExplorerBackup(explorerBackup(game))
    expect(imported.profile.playerId).toBe('learner-1')
    expect(imported.progress.units['unit-01'].modules.repair.attempts).toBe(7)
    expect(imported.settings).toEqual(defaultSettings)
  })

  it('rejects unrelated or damaged files', () => {
    expect(() => parseExplorerBackup('{"kind":"other"}')).toThrow()
    expect(() => parseExplorerBackup('{"kind":"power-up-2-explorer-backup","version":1,"game":{}}')).toThrow()
  })
})
