export type WordStrikeSound = 'spawn' | 'fire' | 'correct' | 'incorrect' | 'combo' | 'levelComplete'

// Intentionally a safe hook until dedicated SFX assets are supplied.
export const playWordStrikeSound = (_sound: WordStrikeSound) => undefined
