import type { CSSProperties } from 'react'
import type { FighterState } from '../../games/code-fighter/fighterStates'

export type { FighterState } from '../../games/code-fighter/fighterStates'

const frames: Record<FighterState, { column: number; row: number }> = {
  idle: { column: 0, row: 0 },
  quickAttack: { column: 1, row: 0 },
  heavyAttack: { column: 2, row: 0 },
  block: { column: 0, row: 1 },
  counter: { column: 1, row: 1 },
  hitReaction: { column: 2, row: 1 },
  ultimate: { column: 0, row: 2 },
  victory: { column: 1, row: 2 },
  tiredDefeat: { column: 2, row: 2 },
}

export const opponentFighterFrameAspect = 1122 / 1402
// The generated 3 × 3 sheets contain a few pixels from neighbouring artwork
// across some cell boundaries. A small overscan keeps those pixels outside the
// visible frame, including after scaleX mirrors the sprite.
export const fighterSheetBackgroundSize = (row: number) => `330% ${row === 1 ? '330%' : '300%'}`

export function FighterSprite({ sheet, state, side, label, frameAspect = 1, mirrored }: { sheet: string; state: FighterState; side: 'player' | 'opponent'; label: string; frameAspect?: number; mirrored?: boolean }) {
  const frame = frames[state]
  const isMirrored = mirrored ?? side === 'opponent'
  const style = {
    backgroundImage: `url(${sheet})`,
    backgroundPosition: `${frame.column * 50}% ${frame.row * 50}%`,
    backgroundSize: fighterSheetBackgroundSize(frame.row),
    aspectRatio: String(frameAspect),
  } satisfies CSSProperties
  return <div className={`fighter-sprite ${side} state-${state}${isMirrored ? ' is-mirrored' : ''}`} style={style} role="img" aria-label={`${label}: ${state}`} />
}
