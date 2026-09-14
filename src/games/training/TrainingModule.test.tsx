import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../../data/units'
import { recordSpellingMistake } from '../../learning/weakWordEngine'
import { isDesktopContinueKey, TrainingModule } from './TrainingModule'

describe('Repair screen', () => {
  it('renders one clue, a partial target, and full-answer input without the technical prop sheet', () => {
    const html = renderToStaticMarkup(<TrainingModule
      unit={units[0]}
      words={units[0].words}
      scopeLabel="Part 1"
      moduleId="repair"
      startImmediately
      initialWeakWords={{}}
      initialReviewClock={0}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('Repair the damaged word')
    expect(html).toContain('Definition')
    expect(html.match(/class="repair-clue"/g)).toHaveLength(1)
    expect(html).toContain('class="damaged-token"')
    expect(html).toContain('Type the complete word or phrase')
    expect(html).toContain('>Repair</button>')
    expect(html).not.toContain('Restore the missing code')
    expect(html).not.toContain('class="module-prop"')
    expect(html).not.toContain('repair-machine')
  })

  it('uses a single desktop Enter press as the Continue shortcut', () => {
    const plainEnter = { key: 'Enter', repeat: false, isComposing: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false }
    expect(isDesktopContinueKey(plainEnter)).toBe(true)
    expect(isDesktopContinueKey({ ...plainEnter, repeat: true })).toBe(false)
    expect(isDesktopContinueKey({ ...plainEnter, isComposing: true })).toBe(false)
    expect(isDesktopContinueKey({ ...plainEnter, key: 'Space' })).toBe(false)
    expect(isDesktopContinueKey({ ...plainEnter, shiftKey: true })).toBe(false)
  })

  it('keeps technical asset sheets off every training-stage background', () => {
    for (const moduleId of ['error-hunt', 'audio-code'] as const) {
      const html = renderToStaticMarkup(<TrainingModule
        unit={units[0]}
        words={units[0].words}
        scopeLabel="Part 1"
        moduleId={moduleId}
        startImmediately
        initialWeakWords={{}}
        initialReviewClock={0}
        onAttempt={vi.fn()}
        onBack={vi.fn()}
      />)
      expect(html).not.toContain('class="module-prop"')
      expect(html).not.toContain('audio-code-device')
      expect(html).not.toContain('error-hunt-spelling-analyzer')
    }
  })

  it('moves a mistaken Audio Code word from choice to harder assembly on review', () => {
    const word = units[0].words.find((candidate) => candidate.audio)!
    const html = renderToStaticMarkup(<TrainingModule
      unit={units[0]}
      words={[word]}
      scopeLabel="Part 1"
      moduleId="audio-code"
      startImmediately
      initialWeakWords={recordSpellingMistake({}, units[0].id, word.id, 0)}
      initialReviewClock={4}
      initialVariantStateByWordId={{ [word.id]: { lastVariantId: 'audio-code.choice', completedEncounters: 1, difficulty: 1, lastCorrect: false } }}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('class="assembled-word"')
    expect(html).not.toContain('class="answer-options word-options"')
  })

  it('renders Error Hunt in lowercase with clear wording and no pre-answer leakage', () => {
    const word = units[0].words.find((candidate) => candidate.word === 'field')!
    const html = renderToStaticMarkup(<TrainingModule
      unit={units[0]}
      words={[word]}
      scopeLabel="Part 1"
      moduleId="error-hunt"
      startImmediately
      initialWeakWords={{}}
      initialReviewClock={0}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('Spelling analyzer')
    expect(html).toContain('Find the spelling error')
    expect(html).toContain('One word is misspelled. Type it correctly.')
    expect(html).toContain('class="word-display corruption-word">feild</div>')
    expect(html).not.toContain('>FEILD</div>')
    expect(html).not.toContain('>field</div>')
    expect(html).toContain('<input autofocus="" autoCapitalize="none"')
    expect(html).not.toContain('value="field"')
  })

  it('renders Error Hunt from the selected Part only', () => {
    const partFiveWords = units[0].words.filter((word) => word.sourcePart === 5)
    const html = renderToStaticMarkup(<TrainingModule
      unit={units[0]}
      words={partFiveWords}
      scopeLabel="Part 5"
      moduleId="error-hunt"
      startImmediately
      initialWeakWords={{}}
      initialReviewClock={0}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('Part 5')
    expect(html).toContain('class="word-display corruption-word">rce</div>')
    expect(html).not.toContain('>feild</div>')
  })
})
