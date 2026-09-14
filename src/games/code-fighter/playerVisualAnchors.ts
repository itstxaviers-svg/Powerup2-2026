import type { FighterState } from './fighterStates'
import type { PlayerAvatarId } from './playerActionRegistry'

export type PlayerActionCorrection = {
  scale?: number
  x?: number
  feetY?: number
  offsetX?: number
  offsetY?: number
  mirrored?: boolean
}

export type PlayerVisualAnchor = {
  scale: number
  x: number
  feetY: number
  offsetX?: number
  offsetY?: number
  actions?: Partial<Record<FighterState, PlayerActionCorrection>>
}

// feetY values are the measured lower edge of the visible artwork, not the PNG
// canvas edge. This keeps action files with different transparent margins on
// the same arena baseline while preserving the pose drawn inside each image.
export const playerVisualAnchors: Record<PlayerAvatarId, PlayerVisualAnchor> = {
  1: { scale: .76, x: 50, feetY: 98, actions: {
    quickAttack: { feetY: 93.9 }, heavyAttack: { feetY: 97.1 }, hitReaction: { feetY: 99.3 }, counter: { feetY: 98.5 }, block: { feetY: 98.7 }, ultimate: { feetY: 93.7 }, victory: { feetY: 99.3 }, tiredDefeat: { feetY: 93 },
  } },
  2: { scale: .79, x: 50, feetY: 98.1, actions: {
    quickAttack: { feetY: 96 }, heavyAttack: { feetY: 96.7 }, hitReaction: { feetY: 97.3 }, counter: { feetY: 95.7 }, block: { feetY: 96.9 }, ultimate: { feetY: 96.3 }, victory: { feetY: 94.7 }, tiredDefeat: { feetY: 93.7 },
  } },
  3: { scale: .79, x: 50, feetY: 99.2, actions: {
    quickAttack: { feetY: 98 }, heavyAttack: { feetY: 95.7 }, hitReaction: { feetY: 98.2 }, counter: { feetY: 98.6 }, block: { feetY: 94 }, ultimate: { feetY: 97.8 }, victory: { feetY: 97.3 }, tiredDefeat: { feetY: 88.9 },
  } },
  4: { scale: .78, x: 50, feetY: 99.1, actions: {
    quickAttack: { feetY: 97.2 }, heavyAttack: { feetY: 96.3 }, hitReaction: { feetY: 94.7 }, counter: { feetY: 98.9 }, block: { feetY: 97.7 }, ultimate: { feetY: 96.5 }, victory: { feetY: 99.2 }, tiredDefeat: { feetY: 86.8 },
  } },
  5: { scale: .78, x: 50, feetY: 96, actions: {
    quickAttack: { feetY: 95.7 }, heavyAttack: { feetY: 95.1 }, hitReaction: { feetY: 89.5 }, counter: { feetY: 91 }, block: { feetY: 89 }, ultimate: { feetY: 96.6 }, victory: { feetY: 94.4 }, tiredDefeat: { feetY: 85.7 },
  } },
  6: { scale: .78, x: 50, feetY: 98.2, actions: {
    quickAttack: { feetY: 94.1 }, heavyAttack: { feetY: 95.3 }, hitReaction: { feetY: 91.3 }, counter: { feetY: 95.3 }, block: { feetY: 90.3 }, ultimate: { feetY: 91.7 }, victory: { feetY: 97.1 }, tiredDefeat: { feetY: 84.6 },
  } },
  7: { scale: .79, x: 50, feetY: 99.2, actions: {
    quickAttack: { feetY: 94.7 }, heavyAttack: { feetY: 99.2 }, hitReaction: { feetY: 93.1 }, counter: { feetY: 92.8 }, block: { feetY: 86.7 }, ultimate: { feetY: 97.4 }, victory: { feetY: 98.7 }, tiredDefeat: { feetY: 90.6 },
  } },
  8: { scale: .78, x: 50, feetY: 98.2, actions: {
    quickAttack: { feetY: 97 }, heavyAttack: { feetY: 97.3 }, hitReaction: { feetY: 91.8 }, counter: { feetY: 92.4 }, block: { feetY: 92 }, ultimate: { feetY: 96.9 }, victory: { feetY: 93.2 }, tiredDefeat: { feetY: 86.9 },
  } },
  9: { scale: .79, x: 50, feetY: 96.9, actions: {
    quickAttack: { feetY: 95.9 }, heavyAttack: { feetY: 96.3 }, hitReaction: { feetY: 93.8 }, counter: { feetY: 93.1 }, block: { feetY: 86.6 }, ultimate: { feetY: 97.5 }, victory: { feetY: 99 }, tiredDefeat: { feetY: 84.6 },
  } },
  10: { scale: .78, x: 50, feetY: 97.6, actions: {
    quickAttack: { feetY: 96.1 }, heavyAttack: { feetY: 96.1 }, hitReaction: { feetY: 91.9 }, counter: { feetY: 93.5 }, block: { feetY: 93.4 }, ultimate: { feetY: 88.7 }, victory: { feetY: 94 }, tiredDefeat: { feetY: 87.5 },
  } },
}

export function playerVisualAnchor(avatarId: PlayerAvatarId, state: FighterState) {
  const base = playerVisualAnchors[avatarId]
  const correction = base.actions?.[state]
  return {
    scale: correction?.scale ?? base.scale,
    x: correction?.x ?? base.x,
    feetY: correction?.feetY ?? base.feetY,
    offsetX: correction?.offsetX ?? base.offsetX ?? 0,
    offsetY: correction?.offsetY ?? base.offsetY ?? 0,
    mirrored: correction?.mirrored ?? false,
  }
}
