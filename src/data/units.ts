import type { UnitData } from '../types/game'
import { unit1Vocabulary } from './unit1Vocabulary'
import { unit2Vocabulary } from './unit2Vocabulary'
import { unit3Vocabulary } from './unit3Vocabulary'
import { unit4Vocabulary } from './unit4Vocabulary'
import { unit5Vocabulary } from './unit5Vocabulary'
import { unit6Vocabulary } from './unit6Vocabulary'
import { unit7Vocabulary } from './unit7Vocabulary'
import { unit8Vocabulary } from './unit8Vocabulary'
import { unit9Vocabulary } from './unit9Vocabulary'

// Every Unit contains teacher-approved production vocabulary.
export const units: UnitData[] = [
  { id: 'unit-01', number: 1, title: 'Skyport Basics', words: unit1Vocabulary },
  { id: 'unit-02', number: 2, title: 'Clockwork City', courseTitle: 'My week', words: unit2Vocabulary },
  { id: 'unit-03', number: 3, title: 'Garden of Words', courseTitle: 'Party time!', words: unit3Vocabulary },
  { id: 'unit-04', number: 4, title: 'Crystal Library', courseTitle: 'The family at home', words: unit4Vocabulary },
  { id: 'unit-05', number: 5, title: 'Light Engine Core', courseTitle: 'Animal world', words: unit5Vocabulary },
  { id: 'unit-06', number: 6, title: 'Echo Canyon', courseTitle: 'Our weather', words: unit6Vocabulary },
  { id: 'unit-07', number: 7, title: 'Starfall Observatory', courseTitle: "Let's cook", words: unit7Vocabulary },
  { id: 'unit-08', number: 8, title: 'Dreamspire Tower', courseTitle: 'Around town', words: unit8Vocabulary },
  { id: 'unit-09', number: 9, title: 'Radiant Citadel', courseTitle: 'A big change', words: unit9Vocabulary },
]

export const unitById = (unitId: string) => units.find((unit) => unit.id === unitId)
