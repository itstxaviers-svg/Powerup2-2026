import type { FightingEnemyId, FightingMilestoneId } from '../../types/game'
import { fightingLevelEnemyAssetSets } from './fightingLevelAssets'

export type { FightingEnemyId } from '../../types/game'

export type FightingEnemyAction = 'base' | 'idle' | 'quick-attack' | 'heavy-attack' | 'block' | 'counter' | 'hit' | 'ultimate' | 'victory' | 'defeat'

export type FightingEnemyConfig = {
  id: FightingEnemyId
  displayName: string
  milestoneId: FightingMilestoneId
  battleIndex: number
  assetRoot: string
  artAvailable: boolean
  orientation: 'front'
  visualAnchor: { scale: number; x: number; y: number; groundY: number; mirrorX: boolean }
  actionAssets: Record<FightingEnemyAction, string>
  intro: { lines: readonly [string, string, string]; startLabel: string; finalAction: FightingEnemyAction }
  victoryLine?: string
}

export type FightingMilestoneConfig = {
  id: FightingMilestoneId
  label: string
  startUnit: 1 | 4
  endUnit: 3 | 7 | 9
  battleCount: 1 | 2
  answerTimeMs: number
  enemyIds: FightingEnemyId[]
}

export const fightingEnemyActions: FightingEnemyAction[] = ['base', 'idle', 'quick-attack', 'heavy-attack', 'block', 'counter', 'hit', 'ultimate', 'victory', 'defeat']

const enemy = (
  id: FightingEnemyId,
  displayName: string,
  milestoneId: FightingMilestoneId,
  battleIndex: number,
  visualAnchor: FightingEnemyConfig['visualAnchor'],
  intro: FightingEnemyConfig['intro'],
  victoryLine?: string,
): FightingEnemyConfig => {
  const assetRoot = `Assets/05-games/code-fighter/opponents/${id}`
  return { id, displayName, milestoneId, battleIndex, assetRoot, artAvailable: true, orientation: 'front', visualAnchor, actionAssets: fightingLevelEnemyAssetSets[id], intro, victoryLine }
}

export const fightingEnemies: Record<FightingEnemyId, FightingEnemyConfig> = {
  'inkbound-knight': enemy('inkbound-knight', 'The Inkbound Knight', 'after-unit-3', 0, { scale: .94, x: 50, y: 4, groundY: 97, mirrorX: false }, { lines: ['So... you made it this far.', 'Words are easy when you can see them.', 'But can you remember them when I take the letters away?'], startLabel: 'Start battle', finalAction: 'heavy-attack' }),
  'prism-wraith': enemy('prism-wraith', 'Prism Wraith', 'after-unit-7', 0, { scale: .9, x: 50, y: 3, groundY: 97, mirrorX: false }, { lines: ['Seven worlds. So many words.', 'Let us see what is still clear in your memory.', 'One mistake... and the prism cracks.'], startLabel: 'Start battle', finalAction: 'heavy-attack' }, 'Interesting... You remember more than I expected.'),
  bellkeeper: enemy('bellkeeper', 'The Bellkeeper', 'after-unit-7', 1, { scale: .9, x: 50, y: 3, groundY: 98, mirrorX: false }, { lines: ['I heard your victory.', 'But every word leaves an echo.', 'Show me which echoes you can still hear.'], startLabel: 'Start battle', finalAction: 'heavy-attack' }, 'The bells remember you.'),
  'crownless-marionette': enemy('crownless-marionette', 'Crownless Marionette', 'after-unit-9', 0, { scale: .86, x: 50, y: 2, groundY: 97, mirrorX: false }, { lines: ['Nine cities restored... How impressive.', 'But are those words truly yours?', 'Let me pull the strings and find out.'], startLabel: 'Start super battle', finalAction: 'counter' }, 'You cut every string...'),
  'corrupted-archivist': enemy('corrupted-archivist', 'Corrupted Archivist', 'after-unit-9', 1, { scale: .88, x: 50, y: 2, groundY: 97, mirrorX: false }, { lines: ['ARCHIVE ACCESS: DENIED.', 'Nine units detected. Memory verification required.', 'Prove that nothing you learned has been lost.'], startLabel: 'Begin final battle', finalAction: 'ultimate' }, 'VERIFICATION COMPLETE.\nKnowledge preserved.\nACCESS GRANTED.'),
}

export const fightingMilestones: Record<FightingMilestoneId, FightingMilestoneConfig> = {
  'after-unit-3': { id: 'after-unit-3', label: 'Fighting Level I', startUnit: 1, endUnit: 3, battleCount: 1, answerTimeMs: 10_000, enemyIds: ['inkbound-knight'] },
  'after-unit-7': { id: 'after-unit-7', label: 'Fighting Level II', startUnit: 4, endUnit: 7, battleCount: 2, answerTimeMs: 8_000, enemyIds: ['prism-wraith', 'bellkeeper'] },
  'after-unit-9': { id: 'after-unit-9', label: 'Super Battle', startUnit: 1, endUnit: 9, battleCount: 2, answerTimeMs: 6_000, enemyIds: ['crownless-marionette', 'corrupted-archivist'] },
}

export const fightingMilestoneIds = Object.keys(fightingMilestones) as FightingMilestoneId[]
export const fightingEnemyIds = Object.keys(fightingEnemies) as FightingEnemyId[]

export const fightingMilestoneForUnit = (unitNumber: number) => fightingMilestoneIds
  .map((id) => fightingMilestones[id])
  .find((milestone) => milestone.endUnit === unitNumber)

export const fightingEnemyForBattle = (milestoneId: FightingMilestoneId, battleIndex: number) => {
  const id = fightingMilestones[milestoneId].enemyIds[battleIndex]
  return id ? fightingEnemies[id] : undefined
}

export const requiredFightingEnemyAssets = () => Object.values(fightingEnemies).flatMap((config) => Object.values(config.actionAssets))

export function resolveFightingEnemyAsset(enemy: FightingEnemyConfig, action: FightingEnemyAction, failedAssets: ReadonlySet<string> = new Set()): string | undefined {
  const requested = enemy.actionAssets[action]
  if (requested && !failedAssets.has(requested)) return requested
  const idle = enemy.actionAssets.idle
  return idle && !failedAssets.has(idle) ? idle : undefined
}
