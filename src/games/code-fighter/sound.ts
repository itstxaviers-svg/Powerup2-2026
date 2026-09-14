export type FighterSound = 'battleStart' | 'quickAttack' | 'heavyAttack' | 'block' | 'counter' | 'combo' | 'ultimateCharge' | 'ultimateImpact' | 'enemyHit' | 'playerHit' | 'victory' | 'defeat' | 'reward'

// Stable integration hook for the recorded effects package. Phase 3B ships
// without synthesizing substitute production audio.
export const playFighterSound = (_sound: FighterSound) => undefined
