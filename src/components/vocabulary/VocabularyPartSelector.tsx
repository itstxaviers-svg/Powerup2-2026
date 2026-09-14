import { allVocabularyPartsSelected, availableVocabularyParts, filterVocabularyByParts, normalizeVocabularyPartSelection, selectAllVocabularyParts, toggleVocabularyPart, vocabularyPartLabel, vocabularyScopeLabel } from '../../learning/vocabularyParts'
import type { UnitData, UnitWord, VocabularySourcePart } from '../../types/game'

export function VocabularyPartSelector({ unit, words, selectedParts, onChange }: {
  unit: UnitData
  words: UnitWord[]
  selectedParts: VocabularySourcePart[]
  onChange: (parts: VocabularySourcePart[]) => void
}) {
  const parts = availableVocabularyParts(words)
  if (!parts.length) return null
  const normalizedSelection = normalizeVocabularyPartSelection(words, selectedParts)
  const allSelected = allVocabularyPartsSelected(words, normalizedSelection)
  const activeWords = filterVocabularyByParts(words, normalizedSelection)

  return <section className="vocabulary-part-selector" aria-labelledby="vocabulary-parts-title">
    <div className="part-selector-heading"><div><p className="eyebrow">Vocabulary scope</p><h2 id="vocabulary-parts-title">Choose training parts</h2></div><p aria-live="polite">Training: <strong>{vocabularyScopeLabel(words, normalizedSelection)}</strong> · {activeWords.length} words</p></div>
    <div className="part-selector-controls">
      {parts.map((part) => {
        const selected = normalizedSelection.includes(part)
        const count = words.filter((word) => word.sourcePart === part).length
        return <button className={selected ? 'selected' : ''} type="button" key={part} aria-pressed={selected} onClick={() => onChange(toggleVocabularyPart(words, normalizedSelection, part))}><span>{vocabularyPartLabel(unit.id, part)}</span><small>{count} words</small></button>
      })}
      <button className={`all-parts ${allSelected ? 'selected' : ''}`} type="button" aria-pressed={allSelected} onClick={() => onChange(selectAllVocabularyParts(words))}><span>All parts</span><small>{words.length} words</small></button>
    </div>
  </section>
}
