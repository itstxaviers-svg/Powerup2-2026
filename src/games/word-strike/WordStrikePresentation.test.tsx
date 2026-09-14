import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import styles from '../../styles.css?raw'
import { units } from '../../data/units'
import { filterVocabularyByParts } from '../../learning/vocabularyParts'
import { WordStrike } from './WordStrike'

describe('Word Strike presentation', () => {
  it('renders the transparent FPS cannon and code-built circular targets without concept sheets', () => {
    const unit = units[0]
    const html = renderToStaticMarkup(<WordStrike
      unit={unit}
      words={filterVocabularyByParts(unit.words, [1])}
      scopeLabel="Part 1"
      initialWeakWords={{}}
      initialReviewClock={0}
      tutorialSeen
      startImmediately
      onTutorialSeen={vi.fn()}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('class="strike-fps-cannon')
    expect(html).toContain('word-strike-fps-cannon.png')
    expect(html).toContain('class="strike-target strike-target-skin-')
    expect(html).not.toContain('word-strike-targets-sheet.png')
    expect(html).not.toContain('word-strike-cannon.png')
    expect(html).not.toContain('class="strike-cannon')
    expect(html).not.toMatch(/strike-target[^>]+background-image/i)
    expect(html).toContain('SPELLING STRIKE')
    expect(html).toContain('Strike the correctly spelled word.')
    expect(html.match(/class="strike-target /g)).toHaveLength(3)

    const cannonOrientationRules = styles.split('\n').filter((line) => /strike-fps-cannon|strikeCannonRecoil|awaiting-fps-cannon/.test(line)).join('\n')
    expect(cannonOrientationRules).not.toContain('scaleX(-1)')
    expect(cannonOrientationRules).not.toContain('rotateY(180deg)')
  })

  it('keeps the Audio Strike answer out of its prompt while showing three English choices', () => {
    const unit = units[0]
    const pool = filterVocabularyByParts(unit.words, [1])
    const html = renderToStaticMarkup(<WordStrike
      unit={unit}
      words={pool}
      scopeLabel="Part 1"
      initialWeakWords={{}}
      initialReviewClock={1}
      tutorialSeen
      startImmediately
      onTutorialSeen={vi.fn()}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)
    const prompt = html.match(/<div class="strike-prompt">([\s\S]*?)<\/div>/)?.[1] ?? ''
    const visibleAnswer = pool[1].word

    expect(html).toContain('AUDIO STRIKE')
    expect(prompt).toContain('Listen and strike the word you hear.')
    expect(prompt).toContain('Replay audio')
    expect(prompt).not.toContain(visibleAnswer)
    expect(prompt).not.toContain(pool[1].definition!)
    expect(prompt).not.toContain(pool[1].translation!)
    expect(html.match(/class="strike-target /g)).toHaveLength(3)
  })

  it('uses the same FPS asset on the content-pending screen', () => {
    const html = renderToStaticMarkup(<WordStrike
      unit={{ ...units[1], words: [] }}
      words={[]}
      scopeLabel="Part 1"
      initialWeakWords={{}}
      initialReviewClock={0}
      tutorialSeen
      startImmediately
      onTutorialSeen={vi.fn()}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('awaiting-fps-cannon')
    expect(html).toContain('word-strike-fps-cannon.png')
    expect(html).not.toContain('word-strike-cannon.png')
  })
})
