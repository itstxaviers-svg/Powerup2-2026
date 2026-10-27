import { describe, expect, it } from 'vitest'
import { blankFightingLevelProgress } from '../games/fighting-level/fightingLevelEngine'
import type { UnitData } from '../types/game'
import { checkpointReport } from './checkpointReport'

describe('standalone Checkpoint 1 report', () => {
  it('shows the passing attempt, error count and actual words', () => {
    const progress = blankFightingLevelProgress('after-unit-3')
    progress.completed = true
    progress.attemptHistory = [{ battleIndex: 0, attemptNumber: 2, correct: 8, total: 9, errorCount: 1, mistakeWordIds: ['u1-rock'], passed: true, completedAt: 1_000 }]
    const units: UnitData[] = [{ id: 'unit-01', number: 1, title: 'Unit 1', words: [{ id: 'u1-rock', word: 'rock' }, ...Array.from({ length: 8 }, (_, index) => ({ id: `word-${index}`, word: `word ${index}` }))] }]
    const text = checkpointReport('Sophie', '5A', progress, units)
    expect(text).toContain('Ученик: Sophie')
    expect(text).toContain('Группа: 5A')
    expect(text).toContain('Итог: ПРОЙДЕН')
    expect(text).toContain('Попытка 2')
    expect(text).toContain('Верно: 8/9; ошибок: 1')
    expect(text).toContain('Слова с ошибками: rock')
  })

  it('marks an old 45-question attempt as not counting toward the new format', () => {
    const progress = blankFightingLevelProgress('after-unit-3')
    progress.attemptHistory = [{ battleIndex: 0, attemptNumber: 1, correct: 45, total: 45, errorCount: 0, mistakeWordIds: [], passed: true, completedAt: 1_000 }]
    const units: UnitData[] = [{ id: 'unit-01', number: 1, title: 'Unit 1', words: [{ id: 'u1-rock', word: 'rock' }] }]
    expect(checkpointReport('Sophie', '', progress, units)).toContain('старая версия — не засчитывается')
  })
})
