import { developmentWordsForUnit } from './developmentFixture'
import type { UnitData, UnitWord } from '../types/game'
import { usableVocabulary } from './vocabularyValidation'

export const wordsForUnit = (unit: UnitData): UnitWord[] =>
  usableVocabulary(unit.words.length > 0 ? unit.words : developmentWordsForUnit(unit.id))
