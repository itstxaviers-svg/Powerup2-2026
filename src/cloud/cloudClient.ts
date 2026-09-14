import { getCloudSession, saveCloudSession } from './cloudSession'
import type { StudentAuthResponse, TeacherDashboardSnapshot } from './types'

const apiBaseUrl = (import.meta.env.VITE_YANDEX_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
export const cloudApiEnabled = Boolean(apiBaseUrl)

async function request<T>(path: string, init: RequestInit = {}, authenticated = false) {
  if (!cloudApiEnabled) throw new Error('Cloud connection is not configured.')
  const session = authenticated ? getCloudSession() : null
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init.headers ?? {}),
    },
  })
  const body = await response.json().catch(() => ({})) as T & { message?: string }
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`)
  return body
}

export async function registerStudent(input: { displayName: string; joinCode: string; avatarId: number; pin: string }) {
  const result = await request<StudentAuthResponse>('/student/register', { method: 'POST', body: JSON.stringify(input) })
  saveCloudSession(result.session)
  return result
}

export async function loginStudent(studentCode: string, pin: string) {
  const result = await request<StudentAuthResponse>('/student/login', { method: 'POST', body: JSON.stringify({ studentCode, pin }) })
  saveCloudSession(result.session)
  return result
}

export async function loginTeacher(email: string, password: string) {
  const result = await request<{ session: StudentAuthResponse['session'] }>('/teacher/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  saveCloudSession(result.session)
  return result.session
}

export function getTeacherDashboard() {
  return request<TeacherDashboardSnapshot>('/teacher/dashboard', { method: 'GET' }, true)
}

export function resetStudentPin(studentCode: string) {
  return request<{ temporaryPin: string }>('/teacher/students/reset-pin', { method: 'POST', body: JSON.stringify({ studentCode }) }, true)
}

export function deleteStudent(studentCode: string) {
  return request<{ ok: true }>('/teacher/students/delete', { method: 'POST', body: JSON.stringify({ studentCode }) }, true)
}
