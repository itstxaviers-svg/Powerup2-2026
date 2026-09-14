export type EvolutionStage = 1 | 2 | 3 | 4
export type EvolutionStageKey = 'explorer' | 'apprentice' | 'lightEngineer' | 'legendaryLightFighter'

export type EvolutionStageDefinition = {
  key: EvolutionStageKey
  title: string
  range: string
}

export type AvatarConfig = {
  id: number
  name: string
  baseAsset: string
  evolutionStages: Partial<Record<EvolutionStage, string>>
}

export type ResolvedEvolutionStage = EvolutionStageDefinition & {
  stage: EvolutionStage
  asset: string
  mode: 'standalone' | 'base'
}

export const evolutionStages: Record<EvolutionStage, EvolutionStageDefinition> = {
  1: { key: 'explorer', title: 'Explorer', range: '0–2 cities restored' },
  2: { key: 'apprentice', title: 'Apprentice', range: '3–4 cities restored' },
  3: { key: 'lightEngineer', title: 'Light Engineer', range: '5–7 cities restored' },
  4: { key: 'legendaryLightFighter', title: 'Legendary Light Fighter', range: '8–9 cities restored' },
}

const stages: EvolutionStage[] = [1, 2, 3, 4]

export function resolveEvolutionStage(avatar: AvatarConfig, requestedStage: EvolutionStage): ResolvedEvolutionStage {
  const directAsset = avatar.evolutionStages[requestedStage]
  if (directAsset) return { ...evolutionStages[requestedStage], stage: requestedStage, asset: directAsset, mode: 'standalone' }

  const nearestStage = stages
    .filter((stage) => Boolean(avatar.evolutionStages[stage]))
    .sort((left, right) => Math.abs(left - requestedStage) - Math.abs(right - requestedStage))[0]
  if (nearestStage) return { ...evolutionStages[nearestStage], stage: nearestStage, asset: avatar.evolutionStages[nearestStage]!, mode: 'standalone' }

  return { ...evolutionStages[requestedStage], stage: requestedStage, asset: avatar.baseAsset, mode: 'base' }
}

export const evolutionTitleFor = (stage: EvolutionStage) => evolutionStages[stage].title
