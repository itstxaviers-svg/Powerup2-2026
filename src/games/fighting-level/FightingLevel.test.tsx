import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { UnitWord } from '../../types/game'
import { createManualIntroController, MANUAL_INTRO_ENTER_MS, MANUAL_INTRO_NEXT_DELAY_MS } from '../intro/manualIntroController'
import { blankFightingLevelProgress, markFightingEnemyIntroSeen, prepareFightingLevelProgress } from './fightingLevelEngine'
import { fightingEnemies } from './fightingLevelConfig'
import { FightingEnemyIntroScene, FightingEnemyStage, FightingLevel, FightingMilestoneCard, FightingPictureClue, FightingTaskPrompt } from './FightingLevel'

const word: UnitWord = { id: 'secret', word: 'secret phrase', audio: 'browser-speech' }
type InspectableElement = ReactElement<Record<string, any>>
const findElement = (node: ReactNode, predicate: (element: InspectableElement) => boolean): InspectableElement | null => {
  if (!isValidElement<Record<string, any>>(node)) return null
  if (predicate(node)) return node
  for (const child of Children.toArray(node.props.children as ReactNode)) {
    const match = findElement(child, predicate)
    if (match) return match
  }
  return null
}

afterEach(() => vi.useRealTimers())

describe('Fighting Level presentation', () => {
  it('renders the requested real action image without another enemy', () => {
    const html = renderToStaticMarkup(<FightingEnemyStage enemy={fightingEnemies['inkbound-knight']} action="idle" />)
    expect(html).toContain('inkbound-knight-idle')
    expect(html).toContain('data-enemy-id="inkbound-knight"')
    expect(html).toContain('data-action="idle"')
    expect(html).not.toContain('prism-wraith')
  })

  it('does not reveal the answer in an Audio → Type prompt', () => {
    const html = renderToStaticMarkup(<FightingTaskPrompt task={{ wordId: word.id, unitId: 'unit-01', mode: 'audio', audioSource: 'browser-speech' }} word={word} answer="" answerReady={false} disabled={false} onAnswerChange={vi.fn()} onPromptReady={vi.fn()} onSubmit={vi.fn()} />)
    expect(html).toContain('Replay clue')
    expect(html).toContain('Listen for the clue')
    expect(html).not.toContain(word.word)
  })

  it('shows only an approved picture clue and typed answer field', () => {
    const html = renderToStaticMarkup(<FightingTaskPrompt task={{ wordId: word.id, unitId: 'unit-01', mode: 'picture', pictureSource: '/approved.png' }} word={word} answer="" answerReady disabled={false} onAnswerChange={vi.fn()} onPromptReady={vi.fn()} onSubmit={vi.fn()} />)
    expect(html).toContain('fighting-level-answer')
    expect(html).not.toContain('Replay clue')
    expect(html).not.toContain(word.word)
  })

  it('keeps the picture inside a non-cropping clue frame', () => {
    const html = renderToStaticMarkup(<FightingPictureClue source="/approved.png" onReady={vi.fn()} onError={vi.fn()} />)
    expect(html).toContain('fighting-level-picture-frame')
    expect(html).toContain('src="/approved.png"')
    expect(html).toContain('alt="Vocabulary picture clue"')
    expect(html).toContain('draggable="false"')
    expect(html).not.toContain('secret phrase')
  })

  it('shows a clear development warning for empty future Units', () => {
    const units = [
      { id: 'unit-01', number: 1, title: 'One', words: [word] },
      { id: 'unit-02', number: 2, title: 'Two', words: [word] },
      { id: 'unit-03', number: 3, title: 'Three', words: [] },
    ]
    const html = renderToStaticMarkup(<FightingMilestoneCard milestoneId="after-unit-3" progress={blankFightingLevelProgress('after-unit-3')} allUnits={units} unlocked={false} onOpen={vi.fn()} />)
    expect(html).toContain('Development note')
    expect(html).toContain('Unit 3')
    expect(html).toContain('Awaiting vocabulary')
  })

  it('opens an incomplete milestone only in explicit demo mode', () => {
    const units = [
      { id: 'unit-01', number: 1, title: 'One', words: [word] },
      { id: 'unit-02', number: 2, title: 'Two', words: [word] },
      { id: 'unit-03', number: 3, title: 'Three', words: [] },
    ]
    const html = renderToStaticMarkup(<FightingMilestoneCard milestoneId="after-unit-3" progress={blankFightingLevelProgress('after-unit-3')} allUnits={units} unlocked demoMode onOpen={vi.fn()} />)
    expect(html).toContain('Demo preview')
    expect(html).toContain('Preview Fighting Level')
    expect(html).toContain('aria-keyshortcuts="Enter"')
    expect(html).toContain('data-enter-action="true"')
    expect(html).not.toContain('disabled')
  })

  it.each([
    ['inkbound-knight', 'So... you made it this far.', 'Start battle'],
    ['prism-wraith', 'Seven worlds. So many words.', 'Start battle'],
    ['bellkeeper', 'I heard your victory.', 'Start battle'],
    ['crownless-marionette', 'Nine cities restored... How impressive.', 'Start super battle'],
    ['corrupted-archivist', 'ARCHIVE ACCESS: DENIED.', 'Begin final battle'],
  ] as const)('maps %s to its first line and final CTA', (enemyId, firstLine, startLabel) => {
    const enemy = fightingEnemies[enemyId]
    const first = renderToStaticMarkup(<FightingEnemyIntroScene enemy={enemy} milestoneLabel="Milestone" intro={{ phase: 'dialogue', stepIndex: 0, canAdvance: false }} reducedMotion={false} onNext={vi.fn()} onStart={vi.fn()} onBack={vi.fn()} />)
    expect(first).toContain(firstLine)
    expect(first).not.toContain('Next')
    expect(first).not.toContain('Skip intro')
    expect(first).not.toContain('role="timer"')
    expect(first).not.toContain('<input')

    const ready = renderToStaticMarkup(<FightingEnemyIntroScene enemy={enemy} milestoneLabel="Milestone" intro={{ phase: 'ready', stepIndex: 2, canAdvance: false }} reducedMotion={false} onNext={vi.fn()} onStart={vi.fn()} onBack={vi.fn()} />)
    expect(ready).toContain(enemy.intro.lines[2])
    expect(ready).toContain(startLabel)
    expect(ready).not.toContain('Next')
  })

  it('uses the shared 650ms controller, prevents double advance, and starts only from the final CTA', () => {
    vi.useFakeTimers()
    const states: Array<{ phase: string; stepIndex: number; canAdvance: boolean }> = []
    const controller = createManualIntroController({ stepCount: 3, onState: (state) => states.push(state) })
    controller.start()
    vi.advanceTimersByTime(MANUAL_INTRO_ENTER_MS + MANUAL_INTRO_NEXT_DELAY_MS - 1)
    expect(states.at(-1)?.canAdvance).toBe(false)
    vi.advanceTimersByTime(1)
    controller.advance(0)
    controller.advance(0)
    expect(states.at(-1)).toEqual({ phase: 'dialogue', stepIndex: 1, canAdvance: false })

    const onStart = vi.fn()
    const enemy = fightingEnemies['inkbound-knight']
    const tree = FightingEnemyIntroScene({ enemy, milestoneLabel: 'Milestone', intro: { phase: 'ready', stepIndex: 2, canAdvance: false }, reducedMotion: false, onNext: vi.fn(), onStart, onBack: vi.fn() })
    findElement(tree, (element) => element.type === 'button' && element.props.children === 'Start battle')!.props.onClick()
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('keeps the first battle on intro with no timer, then skips that intro once persisted', () => {
    const units = Array.from({ length: 3 }, (_, index) => ({ id: `unit-0${index + 1}`, number: index + 1, title: `Unit ${index + 1}`, words: [{ ...word, id: `u${index + 1}-word` }] }))
    const progress = prepareFightingLevelProgress(undefined, units, 'after-unit-3', 7)
    const common = { milestoneId: 'after-unit-3' as const, allUnits: units, reducedMotion: false, onProgressChange: vi.fn(), onBack: vi.fn() }
    const first = renderToStaticMarkup(<FightingLevel {...common} progress={progress} />)
    expect(first).toContain('So... you made it this far.')
    expect(first).not.toContain('role="timer"')
    expect(first).not.toContain('<input')

    const seen = renderToStaticMarkup(<FightingLevel {...common} progress={markFightingEnemyIntroSeen(progress, 'inkbound-knight')} />)
    expect(seen).toContain('role="timer"')
    expect(seen).toContain('<input')
    expect(seen).not.toContain('So... you made it this far.')
  })

  it('preserves manual intro controls under Reduced Motion', () => {
    const html = renderToStaticMarkup(<FightingEnemyIntroScene enemy={fightingEnemies.bellkeeper} milestoneLabel="Milestone" intro={{ phase: 'dialogue', stepIndex: 1, canAdvance: true }} reducedMotion onNext={vi.fn()} onStart={vi.fn()} onBack={vi.fn()} />)
    expect(html).toContain('fighting-level-reduced')
    expect(html).toContain('But every word leaves an echo.')
    expect(html).toContain('Next')
  })
})
