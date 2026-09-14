import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AvatarEvolution, EvolutionRank } from '../components/avatars/AvatarEvolution'
import { evolutionStageFor } from '../progress/progressionEngine'
import { avatars } from './assets'
import { evolutionStages, resolveEvolutionStage, type AvatarConfig, type EvolutionStage } from './avatarEvolution'

describe('avatar evolution registry', () => {
  it('maps every standalone Avatar 01 stage to its matching image and title', () => {
    const avatar = avatars[0]
    ;([1, 2, 3, 4] as EvolutionStage[]).forEach((stage) => {
      const resolved = resolveEvolutionStage(avatar, stage)
      expect(resolved.mode).toBe('standalone')
      expect(resolved.asset).toContain(`avatar-01-evolution/${stage}.png`)
      expect(resolved.title).toBe(evolutionStages[stage].title)
    })
  })

  it('registers all ten standalone folders without importing non-assets', () => {
    expect(avatars.map((avatar) => avatar.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    avatars.forEach((avatar) => {
      expect(Object.keys(avatar.evolutionStages)).toEqual(['1', '2', '3', '4'])
      expect(Object.values(avatar.evolutionStages).some((asset) => asset.includes('.DS_Store') || asset.includes('__MACOSX'))).toBe(false)
    })
  })

  it('maps Avatar 09 and Avatar 10 directly without legacy crop logic', () => {
    expect(resolveEvolutionStage(avatars[8], 4)).toMatchObject({ mode: 'standalone', title: 'Legendary Light Fighter' })
    expect(resolveEvolutionStage(avatars[8], 4).asset).toContain('avatar-09-evolution/4.png')
    expect(resolveEvolutionStage(avatars[9], 2).asset).toContain('avatar-10-evolution/2.png')
  })

  it('falls back to the nearest standalone stage, then the base image, without title mismatch', () => {
    const partial: AvatarConfig = { ...avatars[0], evolutionStages: { 1: 'stage-one.png', 3: 'stage-three.png' } }
    expect(resolveEvolutionStage(partial, 2)).toMatchObject({ stage: 1, asset: 'stage-one.png', title: 'Explorer', mode: 'standalone' })

    const baseOnly: AvatarConfig = { ...avatars[0], evolutionStages: {} }
    expect(resolveEvolutionStage(baseOnly, 4)).toMatchObject({ stage: 4, asset: baseOnly.baseAsset, title: 'Legendary Light Fighter', mode: 'base' })
  })

  it('renders the standalone image and visible name-adjacent rank', () => {
    const imageMarkup = renderToStaticMarkup(<AvatarEvolution avatar={avatars[0]} stage={3} label="Sophie" />)
    const identityMarkup = renderToStaticMarkup(<div><strong>Sophie</strong><EvolutionRank stage={3} /></div>)
    expect(imageMarkup).toContain('avatar-01-evolution/3.png')
    expect(imageMarkup).toContain('Sophie, Light Engineer')
    expect(imageMarkup).toContain('data-evolution-source="standalone"')
    expect(identityMarkup).toContain('Sophie')
    expect(identityMarkup).toContain('Light Engineer')
  })

  it('preserves saved-progress thresholds and switches stages independently of motion settings', () => {
    expect([0, 2, 3, 4, 5, 7, 8, 9].map(evolutionStageFor)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
    expect(resolveEvolutionStage(avatars[0], evolutionStageFor(2)).asset).not.toBe(resolveEvolutionStage(avatars[0], evolutionStageFor(3)).asset)
  })
})
