import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { UnitWord } from '../../types/game'
import { AudioCodePrompt, Feedback, type AudioTask } from './TrainingModule'
import { assembledAudioAnswer, assemblySlotGroups, audioAnswerWordLengths, shuffledAudioLetters } from './audioCodePresentation'

const taskFor = (word: UnitWord, mode: AudioTask['mode'], index: number): AudioTask => ({
  word,
  mode,
  kind: 'audio-code',
  moduleId: 'audio-code',
  index,
  reviewIndex: index + 10,
  variantId: `audio-code.${mode}`,
  variantDifficulty: mode === 'choice' ? 1 : mode === 'assemble' ? 2 : 3,
  isReview: false,
  choices: mode === 'choice' ? [word.word, 'field', 'river', 'grass'] : undefined,
})

describe('Audio Code learner-facing presentation', () => {
  it.each(['leaves', 'get up', 'turn off the lights'])('shuffles %s without returning canonical tile order', (target) => {
    const canonical = [...target].filter((character) => !/\s/u.test(character))
    const shuffled = shuffledAudioLetters(target, 11)
    expect(shuffled).not.toEqual(canonical)
    expect([...shuffled].sort()).toEqual([...canonical].sort())
  })

  it('preserves multiword boundaries as blank structural slot groups', () => {
    expect(audioAnswerWordLengths('get up')).toEqual([3, 2])
    expect(assemblySlotGroups('get up', [])).toEqual([[null, null, null], [null, null]])
    expect(assembledAudioAnswer('get up', ['g', 'e', 't', 'u', 'p'])).toBe('get up')
  })

  it('renders an assemble task with blank slots, shuffled non-space tiles, and no target text', () => {
    const word = { id: 'get-up', word: 'get up', audio: '/audio/get-up.mp3' }
    const task = taskFor(word, 'assemble', 1)
    const html = renderToStaticMarkup(<AudioCodePrompt task={task} words={[word]} onSubmit={vi.fn()} />)
    const tileOrder = [...html.matchAll(/<button type="button"[^>]*>([^<])<\/button>/g)].map((match) => match[1].toLocaleLowerCase())

    expect(html).not.toContain('>get up<')
    expect(html).toContain('aria-label="Your assembled answer"')
    expect(html.match(/class="answer-slot "/g)).toHaveLength(5)
    expect(html.match(/class="answer-slot-group"/g)).toHaveLength(2)
    expect(tileOrder).toEqual(shuffledAudioLetters(word.word, task.reviewIndex))
    expect(tileOrder).not.toEqual(['g', 'e', 't', 'u', 'p'])
    expect(tileOrder).not.toContain(' ')
    expect(html).toContain('disabled="">Decode</button>')
  })

  it.each([
    { id: 'leaves', target: 'leaves', definition: 'the flat green parts of a tree or plant', translation: 'листья' },
    { id: 'time-to-run', target: 'time to run', definition: 'used to say that you need to run now', translation: 'пора бежать' },
  ])('starts typed mode blank and does not expose $target or its clues', ({ id, target, definition, translation }) => {
    const word = { id, word: target, audio: `/audio/${id}.mp3`, definition, translation }
    const html = renderToStaticMarkup(<AudioCodePrompt task={taskFor(word, 'type', 2)} words={[word]} onSubmit={vi.fn()} />)

    expect(html).toContain('Play audio')
    expect(html).toContain('<input')
    expect(html).toContain('value=""')
    expect(html).not.toContain(`>${target}<`)
    expect(html).not.toContain(definition)
    expect(html).not.toContain(translation)
  })

  it('shows a choice answer only once as a candidate and never as a separate clue', () => {
    const word = { id: 'get-up', word: 'get up', audio: '/audio/get-up.mp3' }
    const html = renderToStaticMarkup(<AudioCodePrompt task={taskFor(word, 'choice', 0)} words={[word]} onSubmit={vi.fn()} />)

    expect(html.match(/>get up<\/button>/g)).toHaveLength(1)
    expect(html).not.toContain('assembled-word')
    expect(html).not.toContain('repair-clue')
  })

  it('reveals the canonical answer in Audio Code feedback only after submission', () => {
    const html = renderToStaticMarkup(<Feedback correct word="get up" onContinue={vi.fn()} isFinal={false} errorHunt={false} revealCorrectAnswer />)
    expect(html).toContain('Code restored!')
    expect(html).toContain('>get up</span>')
  })
})
