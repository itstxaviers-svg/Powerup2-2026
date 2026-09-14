import type { ModuleId } from '../types/game'

export type ChestTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type RewardCategory = 'currency' | 'energy' | 'artifact' | 'crystal' | 'key' | 'medal' | 'accessory' | 'decoration'
export type RewardDefinition = { id: string; label: string; category: RewardCategory; quantity: number; icon: string }

export const moduleMedals: Record<ModuleId, RewardDefinition> = {
  repair: { id: 'medal.wordMaster', label: 'Word Engineer', category: 'medal', quantity: 1, icon: 'word-master' },
  'error-hunt': { id: 'medal.errorHunter', label: 'Error Hunter', category: 'medal', quantity: 1, icon: 'error-hunter' },
  'audio-code': { id: 'medal.audioExpert', label: 'Audio Expert', category: 'medal', quantity: 1, icon: 'audio-expert' },
  'word-strike': { id: 'medal.strikeChampion', label: 'Strike Champion', category: 'medal', quantity: 1, icon: 'strike-champion' },
  'code-fighter': { id: 'medal.codeFighter', label: 'Code Fighter', category: 'medal', quantity: 1, icon: 'code-fighter' },
}

const unitExtras: Record<number, RewardDefinition[]> = {
  1: [{ id: 'key.star', label: 'Star Key', category: 'key', quantity: 1, icon: 'star-key' }],
  2: [{ id: 'accessory.goggles', label: 'Arcane Goggles', category: 'accessory', quantity: 1, icon: 'goggles' }],
  3: [{ id: 'key.garden', label: 'Garden Key', category: 'key', quantity: 1, icon: 'garden-key' }],
  4: [{ id: 'accessory.scarf', label: 'Explorer Scarf', category: 'accessory', quantity: 1, icon: 'scarf' }],
  5: [{ id: 'key.engine', label: 'Engine Key', category: 'key', quantity: 1, icon: 'engine-key' }],
  6: [{ id: 'accessory.hat', label: 'Lightworld Hat', category: 'accessory', quantity: 1, icon: 'hat' }],
  7: [{ id: 'key.dreamspire', label: 'Dreamspire Key', category: 'key', quantity: 1, icon: 'dreamspire-key' }],
  8: [{ id: 'accessory.backGear', label: 'Winged Back Gear', category: 'accessory', quantity: 1, icon: 'back-gear' }],
  9: [{ id: 'key.citadel', label: 'Citadel Key', category: 'key', quantity: 1, icon: 'citadel-key' }, { id: 'accessory.pendant', label: 'Crystal Pendant', category: 'accessory', quantity: 1, icon: 'pendant' }, { id: 'decoration.crystalFountain', label: 'Crystal Fountain', category: 'decoration', quantity: 1, icon: 'crystal-fountain' }],
}

export function rewardsForUnit(unitNumber: number): RewardDefinition[] {
  return [
    { id: 'starCoins', label: 'Star Coins', category: 'currency', quantity: 75 + unitNumber * 25, icon: 'star-coins' },
    { id: 'lightShards', label: 'Light Shards', category: 'crystal', quantity: 3 + unitNumber, icon: 'light-shard' },
    { id: 'artifactTokens', label: 'Artifact Tokens', category: 'artifact', quantity: Math.ceil(unitNumber / 2), icon: 'artifact-token' },
    ...(unitExtras[unitNumber] ?? []),
  ]
}

export const achievements = {
  'first-repair': { title: 'First Restoration', description: 'Complete Repair for the first time.' },
  'perfect-audio': { title: 'Crystal Clear', description: 'Complete Audio Code with perfect accuracy.' },
  'strike-champion': { title: 'Sharp Aim', description: 'Complete Word Strike with at least 90% accuracy.' },
  'fighter-victory': { title: 'Arena Light', description: 'Win a Code Fighter duel.' },
  'first-unit': { title: 'City Restorer', description: 'Restore your first city.' },
  'three-units': { title: 'World Builder', description: 'Restore three cities.' },
  'six-units': { title: 'Lightworld Engineer', description: 'Restore six cities.' },
  'world-restored': { title: 'World Restored', description: 'Restore all nine Lightworld cities.' },
  'review-master': { title: 'Memory Keeper', description: 'Master a training word after spaced review.' },
} as const

export type AchievementId = keyof typeof achievements
