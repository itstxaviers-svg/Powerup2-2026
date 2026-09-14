import { openDB, type DBSchema } from 'idb'
import type { ModuleAttempt, SavedGame } from '../types/game'
import { getCloudSession } from './cloudSession'
import type { SyncEvent, SyncEventType } from './types'

interface PowerUpCloudDb extends DBSchema {
  syncQueue: { key: string; value: SyncEvent }
}

const database = typeof indexedDB === 'undefined' ? null : openDB<PowerUpCloudDb>('power-up-2-cloud-v1', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id' })
  },
})

const apiBaseUrl = (import.meta.env.VITE_YANDEX_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
export const cloudSyncEnabled = Boolean(apiBaseUrl)
let flushPromise: Promise<void> | null = null

async function enqueue(type: SyncEventType, entityId: string, payload: SavedGame | ModuleAttempt, coalesce = false) {
  const session = getCloudSession('student')
  const db = await database
  if (!session || !db || !cloudSyncEnabled) return
  if (coalesce) {
    const existing = await db.getAll('syncQueue')
    await Promise.all(existing.filter((item) => item.type === type && item.entityId === entityId).map((item) => db.delete('syncQueue', item.id)))
  }
  const event: SyncEvent = {
    id: crypto.randomUUID(),
    studentId: session.subjectId,
    type,
    entityId,
    occurredAt: new Date().toISOString(),
    payload,
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
  }
  await db.put('syncQueue', event)
  window.dispatchEvent(new Event('power-up-2:sync-ready'))
}

export function queueGameSnapshot(game: SavedGame) {
  return enqueue('game.snapshot', 'current', game, true)
}

export function queueAttempt(attempt: ModuleAttempt) {
  return enqueue('attempt.recorded', crypto.randomUUID(), attempt)
}

export async function pendingSyncCount() {
  return (await database)?.count('syncQueue') ?? 0
}

export async function flushCloudSync() {
  if (flushPromise || !cloudSyncEnabled || !navigator.onLine) return flushPromise ?? Promise.resolve()
  const session = getCloudSession('student')
  const db = await database
  if (!session || !db) return
  flushPromise = (async () => {
    const now = new Date().toISOString()
    const events = (await db.getAll('syncQueue')).filter((event) => event.nextAttemptAt <= now).slice(0, 50)
    if (!events.length) return
    try {
      const response = await fetch(`${apiBaseUrl}/sync/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      })
      if (!response.ok) throw new Error(`Sync failed (${response.status})`)
      const result = await response.json() as { acknowledgedIds: string[] }
      await Promise.all(result.acknowledgedIds.map((id) => db.delete('syncQueue', id)))
    } catch (error) {
      await Promise.all(events.map((event) => db.put('syncQueue', {
        ...event,
        attempts: event.attempts + 1,
        nextAttemptAt: new Date(Date.now() + Math.min(60_000, 1000 * 2 ** Math.min(event.attempts, 6))).toISOString(),
        lastError: error instanceof Error ? error.message : 'Unknown sync error',
      })))
    }
  })().finally(() => { flushPromise = null })
  return flushPromise
}

export function installCloudSync() {
  if (!cloudSyncEnabled || typeof window === 'undefined') return () => undefined
  const flush = () => { void flushCloudSync() }
  window.addEventListener('online', flush)
  window.addEventListener('power-up-2:sync-ready', flush)
  const timer = window.setInterval(flush, 15_000)
  flush()
  return () => {
    window.removeEventListener('online', flush)
    window.removeEventListener('power-up-2:sync-ready', flush)
    window.clearInterval(timer)
  }
}
