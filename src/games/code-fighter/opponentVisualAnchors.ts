import type { CSSProperties } from 'react'
import type { FighterState } from './fighterStates'
import type { OpponentId } from './codeFighterEngine'

export type OpponentVisualAnchor = {
  scale: number
  x: number
  feetY: number
  offsetX: number
  offsetY: number
}

type OpponentAnchorStyle = CSSProperties & {
  '--opponent-action-scale': number
  '--opponent-action-x': `${number}%`
  '--opponent-action-feet-y': `${number}%`
  '--opponent-action-offset-x': `${number}%`
  '--opponent-action-offset-y': `${number}%`
}

const anchor = (scale = 1, feetY = 100, x = 50, offsetX = 0, offsetY = 0): OpponentVisualAnchor => ({ scale, x, feetY, offsetX, offsetY })

const defaultAnchor = anchor()
const anchorsByOpponent: Partial<Record<OpponentId, Partial<Record<FighterState, OpponentVisualAnchor>>>> = {
  'lady-gearveil': {
    idle: anchor(.86, 99), quickAttack: anchor(.86, 99), heavyAttack: anchor(.84, 100),
    block: anchor(.86, 99), counter: anchor(.84, 99), hitReaction: anchor(.85, 99),
    ultimate: anchor(.84, 100), victory: anchor(.86, 99), tiredDefeat: anchor(.85, 100),
  },
  chronofang: {
    idle: anchor(1, 88), quickAttack: anchor(.92, 95), heavyAttack: anchor(.94, 97),
    block: anchor(1, 85), counter: anchor(.92, 99), hitReaction: anchor(1, 88),
    ultimate: anchor(.94, 97), victory: anchor(.95, 98), tiredDefeat: anchor(1, 83),
  },
  'roseclock-duchess': {
    idle: anchor(.92, 97), quickAttack: anchor(.86, 98), heavyAttack: anchor(.85, 98),
    block: anchor(.88, 97), counter: anchor(.86, 98), hitReaction: anchor(.9, 97),
    ultimate: anchor(.85, 98), victory: anchor(.88, 97), tiredDefeat: anchor(.82, 93),
  },
  'thornbound-archivist': {
    idle: anchor(.88, 97), quickAttack: anchor(.82, 97), heavyAttack: anchor(.8, 97),
    block: anchor(.86, 97), counter: anchor(.82, 97), hitReaction: anchor(.86, 97),
    ultimate: anchor(.8, 97), victory: anchor(.84, 97), tiredDefeat: anchor(.8, 92),
  },
}

export function opponentVisualAnchor(opponentId: OpponentId, state: FighterState): OpponentVisualAnchor {
  return anchorsByOpponent[opponentId]?.[state] ?? defaultAnchor
}

export function opponentVisualAnchorStyle(opponentId: OpponentId, state: FighterState): OpponentAnchorStyle {
  const value = opponentVisualAnchor(opponentId, state)
  return {
    '--opponent-action-scale': value.scale,
    '--opponent-action-x': `${value.x}%`,
    '--opponent-action-feet-y': `${value.feetY}%`,
    '--opponent-action-offset-x': `${value.offsetX}%`,
    '--opponent-action-offset-y': `${value.offsetY}%`,
  }
}
