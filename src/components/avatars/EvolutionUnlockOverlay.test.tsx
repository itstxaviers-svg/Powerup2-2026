import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { avatars } from '../../data/assets'
import { evolutionStages, type EvolutionStage } from '../../data/avatarEvolution'
import { EvolutionUnlockOverlay } from './EvolutionUnlockOverlay'

describe('temporary PNG evolution renderer', () => {
  it.each([
    [1, 2],
    [2, 3],
    [3, 4],
  ] as Array<[EvolutionStage, EvolutionStage]>)('renders the canonical stage %i → %i image and title pair', (previousStage, nextStage) => {
    const markup = renderToStaticMarkup(<EvolutionUnlockOverlay
      avatar={avatars[0]}
      playerName="Sofy"
      presentation={{ previousStage, nextStage }}
      reducedMotion={false}
      onContinue={() => undefined}
    />)

    expect(markup).toContain(`data-previous-stage="${previousStage}"`)
    expect(markup).toContain(`data-next-stage="${nextStage}"`)
    expect(markup).toContain(`avatar-01-evolution/${previousStage}.png`)
    expect(markup).toContain(`avatar-01-evolution/${nextStage}.png`)
    expect(markup).toContain(evolutionStages[nextStage].title)
    expect(markup).toContain('Evolution unlocked')
    expect(markup).toContain('Continue')
    expect(markup).toContain('aria-keyshortcuts="Enter"')
    expect(markup).toContain('data-enter-action="true"')
  })

  it('exposes the static Reduced Motion presentation without changing the unlocked stage', () => {
    const markup = renderToStaticMarkup(<EvolutionUnlockOverlay
      avatar={avatars[9]}
      playerName="Learner"
      presentation={{ previousStage: 3, nextStage: 4 }}
      reducedMotion
      onContinue={() => undefined}
    />)
    expect(markup).toContain('evolution-transition--reduced')
    expect(markup).toContain('data-reduced-motion="true"')
    expect(markup).toContain('Legendary Light Fighter')
    expect(markup).toContain('avatar-10-evolution/4.png')
  })

})
