export type FighterState = 'idle' | 'quickAttack' | 'heavyAttack' | 'block' | 'counter' | 'hitReaction' | 'ultimate' | 'victory' | 'tiredDefeat'

export const fighterStates: readonly FighterState[] = ['idle', 'quickAttack', 'heavyAttack', 'block', 'counter', 'hitReaction', 'ultimate', 'victory', 'tiredDefeat']
