import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../../data/unit1Vocabulary'
import { filterVocabularyByParts } from '../../learning/vocabularyParts'
import { chooseScheduledWord } from '../../learning/taskScheduler'
import { recordSpellingMistake } from '../../learning/weakWordEngine'
import { createProgress } from '../../progress/localProgressRepository'
import { applyModuleAttempt } from '../../progress/progressionEngine'
import { errorHuntVariants, isCorrectErrorHuntAnswer, isPlausibleSpellingVariant, spellingVariantKind } from './errorHuntEngine'

const byTarget = (target: string) => unit1Vocabulary.find((word) => word.word === target)!

describe('Error Hunt spelling variants', () => {
  it('audits all 50 Unit 1 records as one plausible spelling edit', () => {
    expect(unit1Vocabulary).toHaveLength(50)
    unit1Vocabulary.forEach((word) => {
      expect(word.typoForms).toHaveLength(3)
      word.typoForms?.forEach((variant) => {
        expect(isPlausibleSpellingVariant(word, variant), `${word.word} -> ${variant}`).toBe(true)
        expect(variant.toLocaleLowerCase()).not.toBe(word.word.toLocaleLowerCase())
        expect(variant).not.toBe(word.word.slice(1))
      })
    })
  })

  it('uses curated variants without adding generated first-letter fragments', () => {
    const grass = byTarget('grass')
    const variants = errorHuntVariants(grass).map((variant) => variant.value)
    expect(variants).toEqual(grass.typoForms)
    expect(variants).not.toContain('rass')
  })

  it('supports internal omissions, substitutions and adjacent transpositions', () => {
    expect(spellingVariantKind(byTarget('grass'), 'grss')).toBe('omission')
    expect(spellingVariantKind(byTarget('grass'), 'gruss')).toBe('substitution')
    expect(spellingVariantKind(byTarget('field'), 'feild')).toBe('transposition')
  })

  it('keeps short words recognizable and rejects unsafe edge deletion', () => {
    expect(isPlausibleSpellingVariant(byTarget('win'), 'wn')).toBe(true)
    expect(isPlausibleSpellingVariant(byTarget('air'), 'eir')).toBe(true)
    expect(isPlausibleSpellingVariant(byTarget('puppy'), 'pupp')).toBe(false)
    expect(isPlausibleSpellingVariant(byTarget('grass'), 'rass')).toBe(false)
  })

  it('preserves phrase grammar, spaces and word order while changing one component', () => {
    for (const word of unit1Vocabulary.filter((candidate) => candidate.word.includes(' '))) {
      const canonicalTokens = word.word.split(' ')
      word.typoForms?.forEach((variant) => {
        const variantTokens = variant.split(' ')
        expect(variantTokens).toHaveLength(canonicalTokens.length)
        expect(variantTokens.filter((token, index) => token !== canonicalTokens[index])).toHaveLength(1)
        expect(isPlausibleSpellingVariant(word, variant)).toBe(true)
      })
    }
  })

  it('validates only the complete canonical answer without leaking metadata', () => {
    const word = byTarget('pick up rubbish')
    expect(isCorrectErrorHuntAnswer(word, 'pick up rubbish')).toBe(true)
    expect(isCorrectErrorHuntAnswer(word, '  PICK UP RUBBISH  ')).toBe(true)
    expect(isCorrectErrorHuntAnswer(word, 'pick up rubish')).toBe(false)
  })

  it('keeps due Weak Word review inside the selected Part pool', () => {
    const selectedPool = filterVocabularyByParts(unit1Vocabulary, [4])
    const dueWord = selectedPool[0]
    const weakWords = recordSpellingMistake({}, 'unit-01', dueWord.id, 0, 100)
    const scheduled = chooseScheduledWord({ words: selectedPool, moduleId: 'error-hunt', unitId: 'unit-01', weakWords, taskIndex: 4, recentWordIds: [] })
    expect(scheduled).toMatchObject({ isReview: true, word: { id: dueWord.id, sourcePart: 4 } })
  })

  it('keeps Error Hunt coverage unique while recording a spelling mistake as a Weak Word', () => {
    const word = byTarget('field')
    const weakWords = recordSpellingMistake({}, 'unit-01', word.id, 0, 100)
    const first = applyModuleAttempt(createProgress(1), {
      unitId: 'unit-01',
      moduleId: 'error-hunt',
      wordId: word.id,
      correct: false,
      weakWords,
      accuracy: 0,
      sessionCompleted: false,
    })
    const repeated = applyModuleAttempt(first, {
      unitId: 'unit-01',
      moduleId: 'error-hunt',
      wordId: word.id,
      correct: true,
      weakWords,
      accuracy: 0.5,
      sessionCompleted: false,
    })

    expect(repeated.units['unit-01'].modules['error-hunt'].trainedWordIds).toEqual([word.id])
    expect(repeated.weakWords[`unit-01:${word.id}`].mistakeCount).toBe(1)
  })
})
