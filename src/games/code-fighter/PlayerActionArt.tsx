import { useState, type CSSProperties } from 'react'
import type { FighterState } from './fighterStates'
import { isPlayerAvatarId, playerActionAsset, playerIdleAsset } from './playerActionRegistry'
import { playerVisualAnchor } from './playerVisualAnchors'

type PlayerActionStyle = CSSProperties & {
  '--player-action-scale': number
  '--player-action-x': string
  '--player-action-feet-y': string
  '--player-action-offset-x': string
  '--player-action-offset-y': string
}

export function PlayerActionArt({ avatarId, state, label, result = false }: { avatarId: number; state: FighterState; label: string; result?: boolean }) {
  if (!isPlayerAvatarId(avatarId)) throw new Error(`Unknown Code Fighter avatar ID: ${avatarId}`)
  const canonicalSource = playerActionAsset(avatarId, state)
  const fallbackSource = playerIdleAsset(avatarId)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const source = failedSource === canonicalSource ? fallbackSource : canonicalSource
  const anchor = playerVisualAnchor(avatarId, state)

  const style: PlayerActionStyle = {
    '--player-action-scale': anchor.scale,
    '--player-action-x': `${anchor.x}%`,
    '--player-action-feet-y': `${anchor.feetY}%`,
    '--player-action-offset-x': `${anchor.offsetX}px`,
    '--player-action-offset-y': `${anchor.offsetY}px`,
  }

  return <div className={`player-action-pose state-${state}${anchor.mirrored ? ' is-mirrored' : ''}${result ? ' is-result' : ''}`} style={style} role="img" aria-label={`${label}: ${state}`}>
    <img
      className="player-action-image"
      src={source}
      alt=""
      style={{ objectFit: 'contain' }}
      draggable={false}
      onError={() => {
        if (source === fallbackSource) return
        if (import.meta.env.DEV) console.warn(`Could not load Code Fighter ${state} artwork for Avatar ${String(avatarId).padStart(2, '0')}; using that avatar's idle artwork.`)
        setFailedSource(canonicalSource)
      }}
    />
  </div>
}
