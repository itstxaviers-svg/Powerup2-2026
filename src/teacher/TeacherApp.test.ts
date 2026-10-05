import { describe, expect, it } from 'vitest'
import type { TeacherStudentSnapshot } from '../cloud/types'
import { checkpointReport, studentMetrics, trainingFrequency, wordMistakeReport } from './TeacherApp'
import { createProgress, CURRENT_SCHEMA_VERSION } from '../progress/localProgressRepository'

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

  it('reports the Checkpoint attempt number, error count and exact words', () => {
    const snapshot = student()
    const progress = createProgress(1)
    progress.fightingLevels['after-unit-3'] = {
      ...progress.fightingLevels['after-unit-3'],
      attemptCount: 2,
      completed: true,
      passedBattleIndexes: [0],
      attemptHistory: [
        { battleIndex: 0, attemptNumber: 1, correct: 3, total: 5, errorCount: 2, mistakeWordIds: ['u2-have-a-presentation'], passed: false, completedAt: 100 },
        { battleIndex: 0, attemptNumber: 2, correct: 5, total: 5, errorCount: 0, mistakeWordIds: [], passed: true, completedAt: 200 },
      ],
    }
    snapshot.game = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profile: { playerId: 'player', name: 'Sofy', group: 'Power Up 2', avatarId: 1, avatarEvolutionStage: 1, createdAt: now },
      progress,
      settings: { musicEnabled: true, sfxEnabled: true, reducedMotion: false },
    }

    expect(checkpointReport(snapshot)[0]).toMatchObject({ completed: true, attempts: 2, errors: 2 })
    expect(checkpointReport(snapshot)[0].battles[0]).toMatchObject({ passedAttemptNumber: 2, errors: 2 })
    expect(checkpointReport(snapshot)[0].battles[0].words).toEqual([{ wordId: 'u2-have-a-presentation', word: 'have a presentation', errors: 1 }])
  })
})
