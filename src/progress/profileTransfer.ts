import type { SavedGame } from '../types/game'
import { isSavedGame, migrateSavedGame } from './localProgressRepository'

const TRANSFER_KIND = 'power-up-2-explorer-backup'

export function explorerBackup(game: SavedGame): string {
  return JSON.stringify({ kind: TRANSFER_KIND, version: 1, exportedAt: new Date().toISOString(), game }, null, 2)
}

export function parseExplorerBackup(text: string): SavedGame {
  const backup: unknown = JSON.parse(text)
  if (!backup || typeof backup !== 'object') throw new Error('This is not a Power Up 2 profile backup.')
  const record = backup as { kind?: unknown; version?: unknown; game?: unknown }
  if (record.kind !== TRANSFER_KIND || record.version !== 1 || !isSavedGame(record.game) ||
    typeof record.game.profile.playerId !== 'string' || !record.game.profile.playerId) {
    throw new Error('This is not a valid Power Up 2 profile backup.')
  }
  try { return migrateSavedGame(record.game) }
  catch { throw new Error('The profile backup is damaged or incomplete.') }
}

export function downloadBackup(text: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
