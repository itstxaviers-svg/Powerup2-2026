import type { UnitWord } from '../types/game'

// This fixture is never merged into production UnitData. It exists only for
// local development with VITE_USE_DEV_FIXTURES=true, until course vocabulary
// and recorded audio are supplied.
const fixtureWords: UnitWord[] = [
  { id: 'dev-bridge', word: 'bridge', translation: 'мост', definition: 'a structure that crosses a gap', example: 'The airship crossed the ____.', typoForms: ['brigde'], audio: 'dev-speech' },
  { id: 'dev-library', word: 'library', translation: 'библиотека', definition: 'a place with books to read', example: 'We found old maps in the ____.', typoForms: ['libary'], audio: 'dev-speech' },
  { id: 'dev-passenger', word: 'passenger', translation: 'пассажир', definition: 'a person travelling in a vehicle', example: 'Every ____ boarded the skyship.', audio: 'dev-speech' },
  { id: 'dev-crystal', word: 'crystal', translation: 'кристалл', definition: 'a clear mineral that can shine', example: 'The blue ____ powered the machine.', typoForms: ['crytal'], audio: 'dev-speech', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" rx="18" fill="%23dff8fb"/%3E%3Cpath d="M100 15 147 69 100 137 53 69Z" fill="%2339cde2" stroke="%230d7395" stroke-width="7"/%3E%3Cpath d="M100 15v122M53 69h94" stroke="%23f7fdff" stroke-width="5" opacity=".8"/%3E%3C/svg%3E' },
  { id: 'dev-engine', word: 'engine', translation: 'двигатель', definition: 'a machine that provides power', example: 'The light ____ started to glow.', audio: 'dev-speech' },
]

export const developmentFixtureEnabled = import.meta.env.VITE_USE_DEV_FIXTURES === 'true'

export const developmentWordsForUnit = (unitId: string): UnitWord[] =>
  unitId === 'unit-01' && developmentFixtureEnabled ? fixtureWords : []
