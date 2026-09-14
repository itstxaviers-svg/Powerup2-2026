import type { PlayerProgress, UnitData, UnitWord, VocabularySourcePart } from '../types/game'

export const vocabularyPartLabels: Record<string, Partial<Record<VocabularySourcePart, string>>> = {
  'unit-01': {
    1: 'Part 1 · Farm p.7',
    2: 'Part 2 · Farm p.8',
    3: 'Part 3 · Daily Routine p.10',
    4: 'Part 4 · Our Planet',
    5: 'Part 5 · Literature',
  },
  'unit-02': {
    1: 'Part 1 · My week. Vocabulary 1',
    2: 'Part 2 · My week. Vocabulary 2',
    3: "Part 3 · Let's be healthy",
    4: 'Part 4 · Literature',
  },
  'unit-03': {
    1: 'Part 1 · Party time. Vocabulary 1',
    2: 'Part 2 · Party time. Vocabulary 2',
    3: 'Part 3 · Party time! People who help us',
    4: 'Part 4 · Party time! Literature',
  },
}

export function availableVocabularyParts(words: UnitWord[]): VocabularySourcePart[] {
  return [...new Set(words.map((word) => word.sourcePart).filter((part): part is VocabularySourcePart => part !== undefined))].sort((left, right) => left - right)
}

export function normalizeVocabularyPartSelection(words: UnitWord[], requested?: readonly number[]): VocabularySourcePart[] {
  const available = availableVocabularyParts(words)
  if (!available.length) return []
  const selected = [...new Set((requested ?? []).filter((part): part is VocabularySourcePart => available.includes(part as VocabularySourcePart)))].sort((left, right) => left - right)
  return selected.length ? selected : [available[0]]
}

export function filterVocabularyByParts(words: UnitWord[], requested?: readonly number[]): UnitWord[] {
  const available = availableVocabularyParts(words)
  if (!available.length) return words
  const selected = new Set(normalizeVocabularyPartSelection(words, requested))
  return words.filter((word) => word.sourcePart !== undefined && selected.has(word.sourcePart))
}

export function toggleVocabularyPart(words: UnitWord[], current: readonly number[], part: VocabularySourcePart): VocabularySourcePart[] {
  const selected = normalizeVocabularyPartSelection(words, current)
  if (!availableVocabularyParts(words).includes(part)) return selected
  if (!selected.includes(part)) return [...selected, part].sort((left, right) => left - right)
  if (selected.length === 1) return selected
  return selected.filter((selectedPart) => selectedPart !== part)
}

export const selectAllVocabularyParts = (words: UnitWord[]) => availableVocabularyParts(words)

export function allVocabularyPartsSelected(words: UnitWord[], selected: readonly number[]): boolean {
  const available = availableVocabularyParts(words)
  const normalized = normalizeVocabularyPartSelection(words, selected)
  return available.length > 0 && normalized.length === available.length && available.every((part) => normalized.includes(part))
}

export function vocabularyScopeLabel(words: UnitWord[], selected: readonly number[]): string {
  const normalized = normalizeVocabularyPartSelection(words, selected)
  if (!normalized.length) return 'Unit vocabulary'
  if (allVocabularyPartsSelected(words, normalized)) return 'All parts'
  if (normalized.length === 1) return `Part ${normalized[0]}`
  return `Parts ${normalized.join(' + ')}`
}

export function vocabularyPartLabel(unitId: string, part: VocabularySourcePart): string {
  return vocabularyPartLabels[unitId]?.[part] ?? `Part ${part}`
}

export function defaultVocabularyPartSelections(allUnits: UnitData[]): PlayerProgress['vocabularyPartSelections'] {
  return Object.fromEntries(allUnits.flatMap((unit) => {
    const parts = availableVocabularyParts(unit.words)
    return parts.length ? [[unit.id, [parts[0]]]] : []
  }))
}

export function normalizeVocabularyPartSelections(allUnits: UnitData[], saved?: Record<string, readonly number[]>): PlayerProgress['vocabularyPartSelections'] {
  return Object.fromEntries(allUnits.flatMap((unit) => {
    const parts = availableVocabularyParts(unit.words)
    return parts.length ? [[unit.id, normalizeVocabularyPartSelection(unit.words, saved?.[unit.id])]] : []
  }))
}

export function withVocabularyPartSelection(progress: PlayerProgress, unitId: string, words: UnitWord[], requested: readonly number[]): PlayerProgress {
  const selected = normalizeVocabularyPartSelection(words, requested)
  if (!selected.length) return progress
  return {
    ...progress,
    vocabularyPartSelections: { ...progress.vocabularyPartSelections, [unitId]: selected },
  }
}
