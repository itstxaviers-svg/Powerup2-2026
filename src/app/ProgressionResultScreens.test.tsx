import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BattleResult } from '../games/code-fighter/CodeFighter'
import { ModuleResult } from '../games/training/TrainingModule'
import { WordStrikeResult, type StrikeSession } from '../games/word-strike/WordStrike'

const strikeSession = (trainedWordIds: string[]): StrikeSession => ({
  roundIndex: 5,
  resolvedRounds: 5,
  shots: 6,
  correct: 5,
  combo: 2,
  bestCombo: 3,
  score: 75,
  weakWords: {},
  history: [],
  trainedWordIds,
  variantStateByWordId: {},
  roundVariantCommitted: true,
  round: null,
  startedAt: 0,
})

describe('learner-facing session and full-module result semantics', () => {
  it('labels Repair, Error Hunt and Audio Code as session-finished before full coverage', () => {
    for (const title of ['Repair', 'Error Hunt', 'Audio Code']) {
      const partial = renderToStaticMarkup(<ModuleResult title={title} correct={4} trained={5} total={50} onBack={vi.fn()} />)
      expect(partial).toContain('Practice session complete')
      expect(partial).toContain(`${title} session finished`)
      expect(partial).toContain('5 / 50 words trained overall')
      expect(partial).not.toContain(`${title} complete`)
      expect(partial).toContain('aria-keyshortcuts="Enter"')
      expect(partial).toContain('data-enter-action="true"')

      const full = renderToStaticMarkup(<ModuleResult title={title} correct={5} trained={50} total={50} onBack={vi.fn()} />)
      expect(full).toContain(`${title} complete`)
      expect(full).toContain('This station is now active.')
    }
  })

  it('keeps a short Word Strike result separate from full station completion', () => {
    const partial = renderToStaticMarkup(<WordStrikeResult session={strikeSession([])} scopeLabel="Part 1" trained={6} totalWords={50} onBack={vi.fn()} />)
    expect(partial).toContain('Range session complete')
    expect(partial).toContain('Range practice saved')
    expect(partial).toContain('6 / 50 words trained overall')
    expect(partial).not.toContain('Word Strike complete')
    expect(partial).toContain('aria-keyshortcuts="Enter"')
    expect(partial).toContain('data-enter-action="true"')

    const full = renderToStaticMarkup(<WordStrikeResult session={strikeSession([])} scopeLabel="All parts" trained={50} totalWords={50} onBack={vi.fn()} />)
    expect(full).toContain('Word Strike complete')
  })

  it('keeps a Code Fighter victory separate from full vocabulary completion', () => {
    const common = { victory: true, scopeLabel: 'Part 1', opponent: 'Rival Kael', opponentId: 'kael' as const, avatarId: 1, accuracy: 0.8, onBack: vi.fn() }
    const partial = renderToStaticMarkup(<BattleResult {...common} trained={7} total={50} />)
    expect(partial).toContain('7 / 50 words trained overall')
    expect(partial).toContain('This battle is complete; your vocabulary coverage is saved for future battles.')
    expect(partial).not.toContain('Code Fighter is complete')
    expect(partial).toContain('aria-keyshortcuts="Enter"')
    expect(partial).toContain('data-enter-action="true"')

    const full = renderToStaticMarkup(<BattleResult {...common} trained={50} total={50} />)
    expect(full).toContain('Code Fighter is complete and its city station is now active.')
  })

  it('uses Enter for Return to unit rather than Retry opponent after a defeat', () => {
    const html = renderToStaticMarkup(<BattleResult
      victory={false}
      scopeLabel="Part 1"
      opponent="Rival Kael"
      opponentId="kael"
      avatarId={1}
      accuracy={0.4}
      trained={7}
      total={50}
      onRetry={vi.fn()}
      onBack={vi.fn()}
    />)

    expect(html).toContain('Retry opponent</button><button class="secondary-button" type="button" aria-keyshortcuts="Enter" data-enter-action="true">Return to unit')
  })
})
