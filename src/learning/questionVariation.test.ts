import { describe, expect, it } from 'vitest'
import { chooseQuestionVariant, recordQuestionVariant, type QuestionVariant } from './questionVariation'

const variants: QuestionVariant<string>[] = [
  { variantId: 'easy-a', difficulty: 1, value: 'easy-a' },
  { variantId: 'easy-b', difficulty: 1, value: 'easy-b' },
  { variantId: 'guided', difficulty: 2, value: 'guided' },
  { variantId: 'recall-a', difficulty: 3, value: 'recall-a' },
  { variantId: 'recall-b', difficulty: 3, value: 'recall-b' },
]

describe('question variation', () => {
  it('avoids the immediately previous form and increases difficulty after a mistake', () => {
    const next = chooseQuestionVariant(variants, { lastVariantId: 'easy-a', completedEncounters: 1, difficulty: 1, lastCorrect: false }, 0)
    expect(next).toMatchObject({ variantId: 'guided', difficulty: 2 })
  })

  it('rotates at the hardest level instead of repeating the same form', () => {
    const next = chooseQuestionVariant(variants, { lastVariantId: 'recall-a', completedEncounters: 4, difficulty: 3, lastCorrect: false }, 0)
    expect(next).toMatchObject({ variantId: 'recall-b', difficulty: 3 })
  })

  it('records state only when the caller commits a completed encounter', () => {
    const state = recordQuestionVariant({}, 'u1-get-up', 'audio-code.choice', 1, false)
    expect(state['u1-get-up']).toEqual({ lastVariantId: 'audio-code.choice', completedEncounters: 1, difficulty: 1, lastCorrect: false })
    expect(recordQuestionVariant(state, 'u1-get-up', 'audio-code.assemble', 2, true)['u1-get-up']).toEqual({ lastVariantId: 'audio-code.assemble', completedEncounters: 2, difficulty: 2, lastCorrect: true })
  })
})
