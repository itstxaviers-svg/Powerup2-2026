import type { CloudSession } from './types'

const SESSION_KEY = 'power-up-2-cloud-session-v1'

export function getCloudSession(role?: CloudSession['role']) {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CloudSession
    if (!parsed?.token || !parsed.expiresAt || Date.parse(parsed.expiresAt) <= Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    if (role && parsed.role !== role) return null
    return parsed
  } catch {
    return null
  }
}

export function saveCloudSession(session: CloudSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearCloudSession() {
  localStorage.removeItem(SESSION_KEY)
}
