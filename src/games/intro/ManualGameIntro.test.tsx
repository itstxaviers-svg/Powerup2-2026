import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ManualGameIntroScene } from './ManualGameIntro'
import { resolveTrainingIntroAsset, trainingIntroConfigs, type TrainingIntroConfig } from './trainingIntroConfig'

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

const scene = (config: TrainingIntroConfig, stepIndex: number, canAdvance = false, callbacks: { onNext?: () => void; onSkip?: () => void; onStart?: () => void } = {}) => ManualGameIntroScene({
  config,
  scopeLabel: 'Parts 1 + 3',
  reducedMotion: false,
  intro: { phase: 'dialogue', stepIndex, canAdvance },
  onNext: callbacks.onNext ?? vi.fn(),
  onSkip: callbacks.onSkip ?? vi.fn(),
  onStart: callbacks.onStart ?? vi.fn(),
  onBack: vi.fn(),
})

describe('shared training mentor intro', () => {
  it('centralizes all exact dialogue and ten non-empty character assets', () => {
    expect(trainingIntroConfigs.repair.steps.map(({ text }) => text)).toEqual(['Some letters are damaged!', 'Use the clue and rebuild the word.', 'Let’s fix it!'])
    expect(trainingIntroConfigs['error-hunt'].steps.map(({ text }) => text)).toEqual(['A spelling error is hiding here.', 'Look closely and find the mistake.', 'Type the correct word!'])
    expect(trainingIntroConfigs['audio-code'].steps.map(({ text }) => text)).toEqual(['Ready to crack the audio code?', 'Listen carefully to the word.', 'Remember the sounds and spell what you hear.', 'Time to decode!'])
    const sources = Object.values(trainingIntroConfigs).flatMap((config) => Object.values(config.assets))
    expect(sources).toHaveLength(10)
    expect(sources.every((source) => typeof source === 'string' && source.endsWith('.png'))).toBe(true)
  })

  it.each([
    ['repair', 0, 'repair-spark-01-greeting.png'], ['repair', 1, 'repair-spark-02-wink.png'],
    ['error-hunt', 0, 'error-hunt-elara-01-greeting.png'], ['error-hunt', 1, 'error-hunt-elara-02-wink.png'],
    ['audio-code', 0, 'audio-guide-01-greeting.png'], ['audio-code', 1, 'audio-guide-02-listening.png'], ['audio-code', 2, 'audio-guide-03-wink.png'],
  ] as const)('renders the correct %s state asset at step %s', (moduleId, stepIndex, filename) => {
    const html = renderToStaticMarkup(scene(trainingIntroConfigs[moduleId], stepIndex))
    expect(html).toContain(filename)
    expect(html.match(/manual-intro-character /g)).toHaveLength(1)
    expect(html).toContain('object-fit:contain')
  })

  it.each([
    ['repair', 'repair-spark-03-point-right.png'],
    ['error-hunt', 'error-hunt-elara-03-point-right.png'],
    ['audio-code', 'audio-guide-04-point-right.png'],
  ] as const)('uses the %s point-right state with the final CTA', (moduleId, filename) => {
    const config = trainingIntroConfigs[moduleId]
    const onStart = vi.fn()
    const tree = ManualGameIntroScene({ config, scopeLabel: 'Part 1', reducedMotion: false, intro: { phase: 'ready', stepIndex: config.steps.length - 1, canAdvance: false }, onNext: vi.fn(), onSkip: vi.fn(), onStart, onBack: vi.fn() })
    const html = renderToStaticMarkup(tree)
    expect(html).toContain(filename)
    expect(html).toContain('Start training')
    expect(html).not.toContain('Next')
    const start = findElement(tree, (element) => element.type === 'button' && element.props.children === 'Start training')
    start!.props.onClick()
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('reveals Next only when unlocked, advances once, and keeps skip separate from Start', () => {
    const config = trainingIntroConfigs.repair
    expect(renderToStaticMarkup(scene(config, 0, false))).not.toContain('Next')
    const onNext = vi.fn()
    const onSkip = vi.fn()
    const onStart = vi.fn()
    const tree = scene(config, 0, true, { onNext, onSkip, onStart })
    const html = renderToStaticMarkup(tree)
    expect(html).toContain('Next')
    const next = findElement(tree, (element) => element.type === 'button' && Children.toArray(element.props.children).includes('Next '))
    const skip = findElement(tree, (element) => element.type === 'button' && element.props.children === 'Skip intro')
    next!.props.onClick()
    skip!.props.onClick()
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onStart).not.toHaveBeenCalled()
  })

  it('keeps Audio Code intro free of target audio and answer UI', () => {
    const html = renderToStaticMarkup(scene(trainingIntroConfigs['audio-code'], 1, true))
    expect(html).toContain('Listen carefully to the word.')
    expect(html).toContain('audio-guide-02-listening.png')
    expect(html).not.toContain('Play audio')
    expect(html).not.toContain('answer-options')
    expect(html).not.toContain('<audio')
  })

  it('preserves semantic states and controls under Reduced Motion', () => {
    const config = trainingIntroConfigs['error-hunt']
    const html = renderToStaticMarkup(ManualGameIntroScene({ config, scopeLabel: 'Part 1', reducedMotion: true, intro: { phase: 'dialogue', stepIndex: 1, canAdvance: true }, onNext: vi.fn(), onSkip: vi.fn(), onStart: vi.fn(), onBack: vi.fn() }))
    expect(html).toContain('word-strike-intro-reduced')
    expect(html).toContain('Look closely and find the mistake.')
    expect(html).toContain('Next')
  })

  it('falls back within the same character when a preferred state fails', () => {
    const config = trainingIntroConfigs['audio-code']
    expect(resolveTrainingIntroAsset(config, 'listening', new Set([config.assets.listening!]))).toBe(config.assets.greeting)
    expect(resolveTrainingIntroAsset(config, 'pointRight', new Set([config.assets.pointRight]))).toBe(config.assets.wink)
  })
})
