import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../data/units'
import { CodeFighter } from './code-fighter/CodeFighter'
import { TrainingModule } from './training/TrainingModule'
import { WordStrike } from './word-strike/WordStrike'

const unit = units[0]
const shared = {
  unit,
  words: unit.words,
  scopeLabel: 'Part 1',
  initialWeakWords: {},
  initialReviewClock: 0,
  onAttempt: vi.fn(),
  onBack: vi.fn(),
}

describe('game Enter shortcuts', () => {
  it.each(['repair', 'error-hunt'] as const)('keeps the %s answer form Enter-compatible', (moduleId) => {
    const html = renderToStaticMarkup(<TrainingModule {...shared} moduleId={moduleId} startImmediately />)
    expect(html).toContain('<form')
    expect(html).toContain('type="submit"')
  })

  it('keeps Audio Code choices keyboard-operable', () => {
    const html = renderToStaticMarkup(<TrainingModule {...shared} moduleId="audio-code" startImmediately />)
    expect(html).toContain('answer-options word-options')
    expect(html).toContain('type="button"')
  })

  it('keeps Word Strike controls keyboard-operable', () => {
    const html = renderToStaticMarkup(<WordStrike
      {...shared}
      tutorialSeen
      startImmediately
      onTutorialSeen={vi.fn()}
    />)
    expect(html).toContain('Moving vocabulary targets')
    expect(html).toContain('type="button"')
  })

  it('keeps Code Fighter controls keyboard-operable', () => {
    const html = renderToStaticMarkup(<CodeFighter
      {...shared}
      avatarId={1}
      playerName="Learner"
    />)
    expect(html).toContain('Choose your training opponent')
    expect(html).toContain('type="button"')
  })
})
