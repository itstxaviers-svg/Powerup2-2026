import { describe, expect, it } from 'vitest'
import { usableVocabulary, validateVocabulary } from './vocabularyValidation'

describe('future vocabulary validation', () => {
  it('accepts empty production Units and words with missing optional fields', () => {
    expect(validateVocabulary([{ id: 'unit-01', number: 1, title: 'Unit', words: [] }])).toEqual([])
    expect(usableVocabulary([{ id: 'one', word: 'one' }])).toEqual([{ id: 'one', word: 'one' }])
  })

  it('reports missing targets and duplicate ids while filtering unsafe entries', () => {
    const words = [{ id: 'same', word: 'first' }, { id: 'same', word: 'second' }, { id: '', word: 'third' }, { id: 'fourth', word: '' }]
    const issues = validateVocabulary([{ id: 'unit-01', number: 1, title: 'Unit', words }])
    expect(issues).toHaveLength(3)
    expect(usableVocabulary(words)).toEqual([{ id: 'same', word: 'first' }])
  })

  it('reports duplicate targets and incomplete source metadata', () => {
    const issues = validateVocabulary([{ id: 'unit-01', number: 1, title: 'Unit', words: [
      { id: 'one', word: 'Field', sourcePart: 1 },
      { id: 'two', word: 'field', sourcePart: 1, sourceTitle: 'Page 7' },
    ] }])
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'sourceTitle' }),
      expect.objectContaining({ field: 'word', message: 'Duplicate vocabulary target: field' }),
    ]))
  })
})
