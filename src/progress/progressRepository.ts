import type { SavedGame } from '../types/game'

export interface ProgressRepository {
  load(): SavedGame | null
  save(game: SavedGame): boolean
  clear(): boolean
}
