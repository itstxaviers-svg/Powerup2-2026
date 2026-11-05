import type { FightingLevelProgress } from '../types/game'
import type { CheckpointDraft } from './fullCheckpointProgress'

export type CheckpointProfile = { name: string; group: string; localId: string }
export type CheckpointBackup = { profile: CheckpointProfile; progress: FightingLevelProgress; draft: CheckpointDraft | null }

export function checkpointBackup(data: CheckpointBackup): string {
  return JSON.stringify({ kind: 'power-up-2-checkpoint-1-backup', version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2)
}

export function parseCheckpointBackup(text: string): CheckpointBackup {
  const parsed: unknown = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') throw new Error('Это не резервная копия Checkpoint 1.')
  const data = parsed as Partial<CheckpointBackup> & { kind?: unknown; version?: unknown }
  if (data.kind !== 'power-up-2-checkpoint-1-backup' || data.version !== 1 ||
    !data.profile || typeof data.profile.name !== 'string' || !data.profile.name.trim() ||
    typeof data.profile.group !== 'string' || typeof data.profile.localId !== 'string' || !data.profile.localId ||
    !data.progress || data.progress.milestoneId !== 'after-unit-3' || !Array.isArray(data.progress.attemptHistory) ||
    !Array.isArray(data.progress.battleRosterIds) ||
    (data.draft !== null && data.draft !== undefined && (typeof data.draft !== 'object' || !Array.isArray(data.draft.rosterIds)))) {
    throw new Error('Файл Checkpoint 1 повреждён или имеет неверный формат.')
  }
  return { profile: data.profile, progress: data.progress, draft: data.draft ?? null }
}
