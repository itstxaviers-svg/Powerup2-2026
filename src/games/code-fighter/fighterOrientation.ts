import type { FighterState } from './fighterStates'
import type { OpponentId } from './codeFighterEngine'
import { opponentPresentationRegistry } from './opponentActionRegistry'

export function shouldMirrorOpponentFrame(opponentId: OpponentId, state: FighterState) {
  const presentation = opponentPresentationRegistry[opponentId]
  return presentation.mirrorX || Boolean(presentation.mirroredStates?.includes(state))
}
