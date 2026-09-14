import type { FighterState } from './fighterStates'

export const playerAvatarIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export type PlayerAvatarId = typeof playerAvatarIds[number]
export type PlayerActionSet = Record<FighterState, string>

const fileStemByState: Record<FighterState, string> = {
  idle: 'idle',
  quickAttack: 'quick-attack',
  heavyAttack: 'heavy-attack',
  hitReaction: 'hit',
  counter: 'counter',
  block: 'block',
  ultimate: 'ultimate',
  victory: 'victory',
  tiredDefeat: 'defeat',
}

const bundledPlayerActions = import.meta.glob<string>(
  '../../../Assets/05-games/code-fighter/players/avatar-*/*.png',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

export function playerActionSourcePath(avatarId: PlayerAvatarId, state: FighterState) {
  const id = String(avatarId).padStart(2, '0')
  return `../../../Assets/05-games/code-fighter/players/avatar-${id}/avatar-${id}-${fileStemByState[state]}.png`
}

export function createPlayerActionSet(avatarId: PlayerAvatarId, catalog: Record<string, string> = bundledPlayerActions, warn: (message: string) => void = developmentWarning): PlayerActionSet {
  const idlePath = playerActionSourcePath(avatarId, 'idle')
  const idle = catalog[idlePath]
  if (!idle) throw new Error(`Missing Code Fighter idle artwork for Avatar ${String(avatarId).padStart(2, '0')}`)

  return Object.fromEntries(Object.keys(fileStemByState).map((state) => {
    const fighterState = state as FighterState
    const path = playerActionSourcePath(avatarId, fighterState)
    const asset = catalog[path]
    if (!asset) warn(`Missing Code Fighter ${fighterState} artwork for Avatar ${String(avatarId).padStart(2, '0')}; using that avatar's idle artwork.`)
    return [fighterState, asset ?? idle]
  })) as PlayerActionSet
}

const developmentWarning = (message: string) => {
  if (import.meta.env.DEV) console.warn(message)
}

export const playerActionRegistry = Object.fromEntries(
  playerAvatarIds.map((avatarId) => [avatarId, createPlayerActionSet(avatarId)]),
) as Record<PlayerAvatarId, PlayerActionSet>

export function isPlayerAvatarId(avatarId: number): avatarId is PlayerAvatarId {
  return playerAvatarIds.includes(avatarId as PlayerAvatarId)
}

export function playerActionAsset(avatarId: number, state: FighterState) {
  if (!isPlayerAvatarId(avatarId)) throw new Error(`Unknown Code Fighter avatar ID: ${avatarId}`)
  return playerActionRegistry[avatarId][state]
}

export function playerIdleAsset(avatarId: number) {
  return playerActionAsset(avatarId, 'idle')
}

export const requiredPlayerActionPaths = playerAvatarIds.flatMap((avatarId) =>
  (Object.keys(fileStemByState) as FighterState[]).map((state) => playerActionSourcePath(avatarId, state)),
)

// Kept public so the focused asset audit can distinguish a real bundled file
// from an action that was safely replaced by the same avatar's idle fallback.
export const resolvedPlayerActionPaths = requiredPlayerActionPaths.filter((path) => Boolean(bundledPlayerActions[path]))
export const missingPlayerActionPaths = requiredPlayerActionPaths.filter((path) => !bundledPlayerActions[path])
