import type { SyntheticEvent } from 'react'
import { evolutionTitleFor, resolveEvolutionStage, type AvatarConfig, type EvolutionStage } from '../../data/avatarEvolution'

export function EvolutionRank({ stage, className = '' }: { stage: EvolutionStage; className?: string }) {
  return <span className={`evolution-rank ${className}`.trim()}>✦ {evolutionTitleFor(stage)}</span>
}

export function AvatarEvolution({ avatar, stage, label, loading = 'lazy' }: {
  avatar: AvatarConfig
  stage: EvolutionStage
  label: string
  loading?: 'eager' | 'lazy'
}) {
  const resolved = resolveEvolutionStage(avatar, stage)
  const accessibleLabel = `${label}, ${resolved.title}`

  const useBaseFallback = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    image.onerror = null
    image.src = avatar.baseAsset
    image.dataset.evolutionSource = 'base-fallback'
  }

  return <img
    className={`avatar-evolution avatar-evolution--standalone stage-${resolved.stage}`}
    src={resolved.asset}
    alt={accessibleLabel}
    loading={loading}
    decoding="async"
    data-evolution-source={resolved.mode}
    onError={useBaseFallback}
  />
}
