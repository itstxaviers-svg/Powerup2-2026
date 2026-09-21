import type { UnitData, UnitWord } from '../types/game'

export type VocabularyIssue = { unitId: string; index: number; field: 'id' | 'word' | 'sourcePart' | 'sourceTitle'; message: string }

export function validateVocabulary(units: UnitData[]): VocabularyIssue[] {
  const issues: VocabularyIssue[] = []
  for (const unit of units) {
    const ids = new Set<string>()
    const targets = new Map<string, Partial<UnitWord>>()
    unit.words.forEach((candidate, index) => {
      const word = candidate as Partial<UnitWord>
      if (!word.id?.trim()) issues.push({ unitId: unit.id, index, field: 'id', message: 'A vocabulary item needs a non-empty id.' })
      else if (ids.has(word.id)) issues.push({ unitId: unit.id, index, field: 'id', message: `Duplicate vocabulary id: ${word.id}` })
      else ids.add(word.id)
      if (!word.word?.trim()) issues.push({ unitId: unit.id, index, field: 'word', message: 'A vocabulary item needs a non-empty target word.' })
      else {
        const target = word.word.trim().toLocaleLowerCase()
        const existing = targets.get(target)
        if (existing && !(existing.allowDuplicateTarget && word.allowDuplicateTarget)) issues.push({ unitId: unit.id, index, field: 'word', message: `Duplicate vocabulary target: ${word.word}` })
        else targets.set(target, word)
      }
      if (word.sourcePart !== undefined && (![1, 2, 3, 4, 5].includes(word.sourcePart) || !Number.isInteger(word.sourcePart))) {
        issues.push({ unitId: unit.id, index, field: 'sourcePart', message: 'sourcePart must be an integer from 1 to 5.' })
      }
      if (word.sourcePart !== undefined && !word.sourceTitle?.trim()) {
        issues.push({ unitId: unit.id, index, field: 'sourceTitle', message: 'A sourced vocabulary item needs its source title.' })
      }
    })
  }
  return issues
}

export function usableVocabulary(words: UnitWord[]): UnitWord[] {
  const ids = new Set<string>()
  return words.filter((candidate) => {
    if (!candidate?.id?.trim() || !candidate.word?.trim() || ids.has(candidate.id)) return false
    ids.add(candidate.id)
    return true
  })
}
