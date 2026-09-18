import type { UnitData } from '../types/game'
import { unit1Vocabulary } from './unit1Vocabulary'
import { unit2Vocabulary } from './unit2Vocabulary'
import { unit3Vocabulary } from './unit3Vocabulary'
import { unit4Vocabulary } from './unit4Vocabulary'

// Units 1–3 contain teacher-supplied production vocabulary. Units 4–9 remain
// empty until their final content is supplied.
export const units: UnitData[] = [
  { id: 'unit-01', number: 1, title: 'Skyport Basics', words: unit1Vocabulary },
  { id: 'unit-02', number: 2, title: 'Clockwork City', courseTitle: 'My week', words: unit2Vocabulary },
  { id: 'unit-03', number: 3, title: 'Garden of Words', courseTitle: 'Party time!', words: unit3Vocabulary },
  { id: 'unit-04', number: 4, title: 'Crystal Library', courseTitle: 'The family at home', words: unit4Vocabulary },
  { id: 'unit-05', number: 5, title: 'Light Engine Core', words: [] },
  { id: 'unit-06', number: 6, title: 'Echo Canyon', words: [] },
  { id: 'unit-07', number: 7, title: 'Starfall Observatory', words: [] },
  { id: 'unit-08', number: 8, title: 'Dreamspire Tower', words: [] },
  { id: 'unit-09', number: 9, title: 'Radiant Citadel', words: [] },
]

export const unitById = (unitId: string) => units.find((unit) => unit.id === unitId)
