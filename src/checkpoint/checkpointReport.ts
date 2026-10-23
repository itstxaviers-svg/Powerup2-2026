import type { FightingLevelProgress, UnitData } from '../types/game'

export function checkpointReport(name: string, group: string, progress: FightingLevelProgress, units: readonly UnitData[]): string {
  const words = new Map(units.flatMap((unit) => unit.words.map((word) => [word.id, word.word] as const)))
  const lines = [
    'POWER UP 2 · CHECKPOINT 1 · UNITS 1–3',
    `Ученик: ${name.trim()}`,
    `Группа: ${group.trim() || 'не указана'}`,
    `Итог: ${progress.completed ? 'ПРОЙДЕН' : 'не пройден'}`,
    `Всего попыток: ${progress.attemptHistory.length}`,
    '',
  ]
  if (!progress.attemptHistory.length) lines.push('Завершённых попыток пока нет.')
  for (const attempt of progress.attemptHistory) {
    const date = attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('ru-RU') : 'время не записано'
    const mistakes = attempt.mistakeWordIds.map((id) => words.get(id) ?? id)
    lines.push(`Попытка ${attempt.attemptNumber} · ${date} · ${attempt.passed ? 'ПРОЙДЕНА' : 'не пройдена'}`)
    lines.push(`Верно: ${attempt.correct}/${attempt.total}; ошибок: ${attempt.errorCount}`)
    lines.push(`Слова с ошибками: ${mistakes.length ? mistakes.join(', ') : 'нет'}`)
    lines.push('')
  }
  lines.push('Результат сохранён только в браузере ученика. Отправьте этот отчёт учителю.')
  return lines.join('\n')
}
