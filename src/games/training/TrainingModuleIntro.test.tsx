import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../../data/units'
import { TrainingModule } from './TrainingModule'

const common = { unit: units[0], words: units[0].words, scopeLabel: 'Part 1', initialWeakWords: {}, initialReviewClock: 0, onAttempt: vi.fn(), onBack: vi.fn() }

describe('training module intro integration', () => {
  it.each([
    ['repair', 'HELPER SPARK', 'repair-spark-01-greeting.png'],
    ['error-hunt', 'MENTOR ELARA', 'error-hunt-elara-01-greeting.png'],
    ['audio-code', 'AUDIO GUIDE', 'audio-guide-01-greeting.png'],
  ] as const)('places the %s intro before existing gameplay', (moduleId, characterName, filename) => {
    const html = renderToStaticMarkup(<TrainingModule {...common} moduleId={moduleId} />)
    expect(html).toContain(characterName)
    expect(html).toContain(filename)
    expect(html).toContain('Skip intro')
    expect(html).not.toContain('Start training')
    expect(html).not.toContain('training-stage')
  })

  it.each([
    ['repair', 'Repair the damaged word'],
    ['error-hunt', 'Find the spelling error'],
    ['audio-code', 'Listen, then decode'],
  ] as const)('starts the unchanged %s gameplay after the intro boundary', (moduleId, gameplayHeading) => {
    const html = renderToStaticMarkup(<TrainingModule {...common} moduleId={moduleId} startImmediately />)
    expect(html).toContain(gameplayHeading)
    expect(html).toContain('training-stage')
    expect(html).not.toContain('manual-intro')
  })

  it('does not mount Audio Code autoplay UI during its intro', () => {
    const html = renderToStaticMarkup(<TrainingModule {...common} moduleId="audio-code" />)
    expect(html).not.toContain('Play audio')
    expect(html).not.toContain('Listening…')
  })
})
