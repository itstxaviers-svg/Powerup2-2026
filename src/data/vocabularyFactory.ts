import type { UnitWord, VocabularySourcePart } from '../types/game'

export type VocabularySeed = {
  word: string
  translation?: string
  definition?: string
  id?: string
  baseForm?: string
  allowDuplicateTarget?: boolean
  pictureEligible?: boolean
  acceptedForms?: string[]
}

const slug = (value: string) => value.toLocaleLowerCase().replace(/['’.]/gu, '').replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')

export function vocabularyFromPart(unitNumber: number, sourcePart: VocabularySourcePart, sourceTitle: string, seeds: readonly VocabularySeed[]): UnitWord[] {
  return seeds.map((seed) => ({
    id: seed.id ?? `u${unitNumber}-${slug(seed.word)}`,
    word: seed.word,
    translation: seed.translation,
    definition: seed.definition,
    example: `Complete the phrase: ____.`,
    sourcePart,
    sourceTitle,
    audio: `/assets/audio/unit-${String(unitNumber).padStart(2, '0')}/${seed.id ?? `u${unitNumber}-${slug(seed.word)}`}.mp3`,
    fixedPhrase: /[\s?.]/u.test(seed.word),
    baseForm: seed.baseForm,
    allowDuplicateTarget: seed.allowDuplicateTarget,
    pictureEligible: Boolean(seed.pictureEligible),
    acceptedForms: seed.acceptedForms,
  }))
}
