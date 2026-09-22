import type { UnitWord, VocabularySourcePart } from '../types/game'
import { vocabularyAudioPath } from '../audio/audioAssetPath'

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
  return seeds.map((seed) => {
    const id = seed.id ?? `u${unitNumber}-${slug(seed.word)}`
    return {
      id,
      word: seed.word,
      translation: seed.translation,
      definition: seed.definition,
      example: `Complete the phrase: ____.`,
      sourcePart,
      sourceTitle,
      audio: vocabularyAudioPath(unitNumber, id),
      fixedPhrase: /[\s?.]/u.test(seed.word),
      baseForm: seed.baseForm,
      allowDuplicateTarget: seed.allowDuplicateTarget,
      pictureEligible: Boolean(seed.pictureEligible),
      acceptedForms: seed.acceptedForms,
    }
  })
}
