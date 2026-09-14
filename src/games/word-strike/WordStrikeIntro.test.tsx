import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { units } from '../../data/units'
import { filterVocabularyByParts } from '../../learning/vocabularyParts'
import { WordStrike } from './WordStrike'
import { WordStrikeIntro, WordStrikeIntroScene, novaIntroAssetForPhase } from './WordStrikeIntro'

type InspectableElement = ReactElement<Record<string, any>>

function findElement(node: ReactNode, predicate: (element: InspectableElement) => boolean): InspectableElement | null {
  if (!isValidElement<Record<string, any>>(node)) return null
  if (predicate(node)) return node
  for (const child of Children.toArray(node.props.children as ReactNode)) {
    const match = findElement(child, predicate)
    if (match) return match
  }
  return null
}

const scene = (phase: Parameters<typeof WordStrikeIntroScene>[0]['phase'], callbacks: { onNext?: () => void; onSkip?: () => void; onStart?: () => void; onBack?: () => void } = {}, canAdvance = true) => WordStrikeIntroScene({
  phase,
  scopeLabel: 'Parts 1 + 3',
  reducedMotion: false,
  canAdvance,
  onNext: callbacks.onNext ?? vi.fn(),
  onSkip: callbacks.onSkip ?? vi.fn(),
  onStart: callbacks.onStart ?? vi.fn(),
  onBack: callbacks.onBack ?? vi.fn(),
})

describe('Specialist Nova Word Strike intro', () => {
  it('is shown before training on every normal entry, even after the old tutorial flag is set', () => {
    const unit = units[0]
    const html = renderToStaticMarkup(<WordStrike
      unit={unit}
      words={filterVocabularyByParts(unit.words, [1])}
      scopeLabel="Part 1"
      initialWeakWords={{}}
      initialReviewClock={0}
      tutorialSeen
      onTutorialSeen={vi.fn()}
      onAttempt={vi.fn()}
      onBack={vi.fn()}
    />)
    expect(html).toContain('nova-intro')
    expect(html).not.toContain('strike-arena')
    expect(html).not.toContain('Replay audio')
  })

  it('renders the standalone idle and wink PNGs with the exact short dialogue', () => {
    const idle = renderToStaticMarkup(scene('enter'))
    const wink = renderToStaticMarkup(scene('wink'))
    expect(idle).toContain(novaIntroAssetForPhase('enter'))
    expect(idle).toContain('object-fit:contain')
    expect(idle).not.toContain('Start training')
    expect(wink).toContain(novaIntroAssetForPhase('wink'))
    expect(wink).toContain('SPECIALIST NOVA')
    expect(wink).toContain('Word Strike time!')
    expect(wink).toContain('We’re hunting for the correct word forms.')
    expect(wink).toContain('Time to shoot!')
    expect(wink.match(/nova-intro-character"/g)).toHaveLength(1)
    expect(wink).not.toContain('Ready your Word Strike cannon')
    expect(wink).not.toContain('Shoot the correctly spelled target')
    expect(wink).not.toContain('specialist-nova.png')
  })

  it('shows Next after each completed phrase and advances only that phrase', () => {
    const onNext = vi.fn()
    const greetingTree = scene('greeting', { onNext })
    const greeting = renderToStaticMarkup(greetingTree)
    expect(greeting).toContain('Word Strike time!')
    expect(greeting).not.toContain('We’re hunting for the correct word forms.')
    expect(greeting).toContain('Next')
    const next = findElement(greetingTree, (element) => element.type === 'button' && Children.toArray(element.props.children).includes('Next '))
    expect(next).not.toBeNull()
    next!.props.onClick()
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(renderToStaticMarkup(scene('greeting', {}, false))).not.toContain('Next')
    expect(renderToStaticMarkup(scene('wink'))).not.toContain('Next')
  })

  it('reveals only the deliberate Start training action after Nova exits', () => {
    const onStart = vi.fn()
    const readyTree = scene('ready', { onStart })
    const html = renderToStaticMarkup(readyTree)
    expect(html).toContain('Start training')
    expect(html).not.toContain('nova-intro-character')
    const start = findElement(readyTree, (element) => element.type === 'button' && element.props.children === 'Start training')
    expect(start).not.toBeNull()
    start!.props.onClick()
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('binds the explicit skip to ready-only behavior and preserves Return to unit', () => {
    const onSkip = vi.fn()
    const onStart = vi.fn()
    const onBack = vi.fn()
    const tree = scene('message', { onSkip, onStart, onBack })
    const skip = findElement(tree, (element) => element.type === 'button' && element.props.children === 'Skip intro')
    const back = findElement(tree, (element) => element.type === 'button' && Children.toArray(element.props.children).some((child) => isValidElement<{ children?: ReactNode }>(child) && child.props.children === 'Return to unit'))
    skip!.props.onClick()
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onStart).not.toHaveBeenCalled()
    back!.props.onClick()
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('keeps semantic Nova artwork under Reduced Motion', () => {
    const html = renderToStaticMarkup(<WordStrikeIntro scopeLabel="Part 1" reducedMotion onStart={vi.fn()} onBack={vi.fn()} />)
    expect(html).toContain('word-strike-intro-reduced')
    expect(html).toContain(novaIntroAssetForPhase('enter'))
  })
})
