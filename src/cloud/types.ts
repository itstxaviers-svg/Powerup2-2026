import type { ModuleAttempt, SavedGame } from '../types/game'

export type CloudRole = 'student' | 'teacher'

export type CloudSession = {
  token: string
  role: CloudRole
  subjectId: string
  expiresAt: string
  studentCode?: string
  joinCode?: string
}

export type StudentCloudProfile = {
  playerId: string
  studentCode: string
  name: string
  group: string
  joinCode: string
  avatarId: number
  createdAt: number
}

export type StudentAuthResponse = {
  session: CloudSession
  profile: StudentCloudProfile
  game?: SavedGame | null
}

export type SyncEventType = 'game.snapshot' | 'attempt.recorded'

export type SyncEvent = {
  id: string
  studentId: string
  type: SyncEventType
  entityId: string
  occurredAt: string
  payload: SavedGame | ModuleAttempt
  attempts: number
  nextAttemptAt: string
  lastError?: string
}

export type TeacherAttempt = {
  id: string
  occurredAt: string
  payload: ModuleAttempt
}

export type TeacherStudentSnapshot = {
  profile: StudentCloudProfile
  game: SavedGame | null
  recentAttempts: TeacherAttempt[]
}

export type TeacherDashboardSnapshot = {
  group: { joinCode: string; displayName: string }
  students: TeacherStudentSnapshot[]
}
