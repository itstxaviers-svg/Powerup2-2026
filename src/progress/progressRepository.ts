import type { SavedGame } from '../types/game'

export interface ProgressRepository {
  load(): SavedGame | null
  save(game: SavedGame): void
  clear(): void
}
