import { describe, expect, it } from 'vitest'
import type { TeacherStudentSnapshot } from '../cloud/types'
import { studentMetrics, trainingFrequency, wordMistakeReport } from './TeacherApp'

const now = new Date(2026, 8, 20, 12).getTime()

function student(): TeacherStudentSnapshot {
  const attempt = (daysAgo: number, correct: boolean, sessionCompleted = false, moduleId: 'repair' | 'word-strike' = 'repair') => ({
    id: `${daysAgo}-${correct}-${moduleId}`,
    occurredAt: new Date(now - daysAgo * 86_400_000).toISOString(),
    payload: {
      unitId: 'unit-02',
      moduleId,
      wordId: 'u2-have-a-presentation',
      correct,
      weakWords: {},
      accuracy: correct ? 1 : 0,
      sessionCompleted,
    },
  })
  return {
    profile: { playerId: 'player', studentCode: 'PLAYER-001', name: 'Sofy', group: 'Power Up 2', joinCode: 'POWERUP2', avatarId: 1, createdAt: now - 30 * 86_400_000 },
    game: null,
    recentAttempts: [
      attempt(0, true),
      attempt(0, false),
      attempt(2, true, true, 'word-strike'),
      attempt(2, true),
      attempt(8, false),
    ],
  }
}

describe('teacher learning reports', () => {
  it('calculates seven-day training frequency and real recent accuracy', () => {
    const snapshot = student()
    const frequency = trainingFrequency(snapshot, now)

    expect(frequency.activeDays).toBe(2)
    expect(frequency.attempts).toBe(4)
    expect(frequency.sessions).toBe(1)
    expect(frequency.accuracy).toBe(75)
    expect(studentMetrics(snapshot, now).accuracy).toBe(60)
  })

  it('shows the vocabulary phrase and games where errors occurred', () => {
    const mistakes = wordMistakeReport(student())

    expect(mistakes).toHaveLength(1)
    expect(mistakes[0]).toMatchObject({
      word: 'have a presentation',
      unitNumber: 2,
      mistakes: 2,
      modules: ['Repair'],
    })
  })
})
