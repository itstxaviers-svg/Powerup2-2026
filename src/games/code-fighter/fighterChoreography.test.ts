import { afterEach, describe, expect, it, vi } from 'vitest'
import { actionHoldMs, answerWindowMs, answeringOpponentState, choreographyFor, createChoreographyRunner, presentationDuration } from './fighterChoreography'
import type { FighterChallengeKind } from './codeFighterEngine'

const states = (kind: FighterChallengeKind, correct: boolean, comboComplete = true) =>
  choreographyFor({ kind, correct, outcome: 'continue', comboComplete }).map(({ playerState, opponentState }) => `${playerState}:${opponentState}`)

afterEach(() => vi.useRealTimers())

describe('Code Fighter choreography', () => {
  it('runs the requested correct action order for all seven exchanges', () => {
    expect(states('quick', true)).toEqual(['quickAttack:idle', 'idle:hitReaction', 'idle:idle'])
    expect(states('defense', true)).toEqual(['block:quickAttack', 'counter:idle', 'idle:hitReaction', 'idle:idle'])
    expect(states('spelling', true)).toEqual(['heavyAttack:idle', 'idle:block', 'idle:hitReaction', 'idle:idle'])
    expect(states('audio', true)).toEqual(['counter:heavyAttack', 'idle:hitReaction', 'idle:idle'])
    expect(states('meaning', true)).toEqual(['quickAttack:idle', 'idle:hitReaction', 'idle:idle'])
    expect(states('combo', true, false)).toEqual(['idle:idle', 'idle:idle'])
    expect(states('combo', true)).toEqual(['quickAttack:idle', 'idle:hitReaction', 'heavyAttack:idle', 'idle:block', 'counter:idle', 'idle:hitReaction', 'idle:idle'])
    expect(states('ultimate', true)).toEqual(['ultimate:idle', 'idle:hitReaction', 'idle:idle'])
  })

  it('runs the requested counter sequence on failed exchanges', () => {
    expect(states('quick', false)).toEqual(['idle:counter', 'hitReaction:idle', 'idle:idle'])
    expect(states('defense', false)).toEqual(['idle:quickAttack', 'hitReaction:idle', 'idle:idle'])
    expect(states('spelling', false)).toEqual(['idle:counter', 'hitReaction:idle', 'idle:idle'])
    expect(states('audio', false)).toEqual(['idle:heavyAttack', 'hitReaction:idle', 'idle:idle'])
    expect(states('meaning', false)).toEqual(['quickAttack:block', 'idle:quickAttack', 'hitReaction:idle', 'idle:idle'])
    expect(states('combo', false)).toEqual(['idle:counter', 'hitReaction:idle', 'idle:idle'])
    expect(states('ultimate', false)).toEqual(['idle:heavyAttack', 'hitReaction:idle', 'idle:idle'])
  })

  it('uses telegraphs, timers and hold ranges defined by the battle spec', () => {
    expect(answeringOpponentState('defense')).toBe('quickAttack')
    expect(answeringOpponentState('audio')).toBe('heavyAttack')
    expect(answeringOpponentState('quick')).toBe('idle')
    expect(answerWindowMs('kael', 'ultimate')).toBe(7000)
    expect(answerWindowMs('construct', 'quick')).toBe(7000)
    expect(answerWindowMs('construct', 'ultimate')).toBe(5000)
    expect(answerWindowMs('lady-gearveil', 'quick')).toBe(7000)
    expect(answerWindowMs('lady-gearveil', 'ultimate')).toBe(7000)
    expect(answerWindowMs('chronofang', 'quick')).toBe(7000)
    expect(answerWindowMs('chronofang', 'ultimate')).toBe(5000)
    expect(actionHoldMs.quick).toBeGreaterThanOrEqual(900)
    expect(actionHoldMs.quick).toBeLessThanOrEqual(1100)
    expect(actionHoldMs.hit).toBeGreaterThanOrEqual(900)
    expect(actionHoldMs.hit).toBeLessThanOrEqual(1100)
    expect(actionHoldMs.block).toBeGreaterThanOrEqual(1100)
    expect(actionHoldMs.block).toBeLessThanOrEqual(1300)
    expect(actionHoldMs.counter).toBeGreaterThanOrEqual(1100)
    expect(actionHoldMs.counter).toBeLessThanOrEqual(1300)
    expect(actionHoldMs.heavy).toBeGreaterThanOrEqual(1300)
    expect(actionHoldMs.heavy).toBeLessThanOrEqual(1600)
    expect(actionHoldMs.ultimate).toBeGreaterThanOrEqual(1800)
    expect(actionHoldMs.ultimate).toBeLessThanOrEqual(2200)
    expect(presentationDuration(actionHoldMs.ultimate, true)).toBe(900)
  })

  it('holds outcome poses and otherwise returns both fighters to idle', () => {
    expect(choreographyFor({ kind: 'ultimate', correct: true, outcome: 'victory' }).at(-1)).toMatchObject({ playerState: 'victory', opponentState: 'tiredDefeat' })
    expect(choreographyFor({ kind: 'ultimate', correct: false, outcome: 'defeat' }).at(-1)).toMatchObject({ playerState: 'tiredDefeat', opponentState: 'victory' })
    expect(choreographyFor({ kind: 'quick', correct: true, outcome: 'continue' }).at(-1)).toMatchObject({ playerState: 'idle', opponentState: 'idle' })
  })

  it('advances the state machine only after each readable hold and cleans up', () => {
    vi.useFakeTimers()
    const sequence = choreographyFor({ kind: 'quick', correct: true, outcome: 'continue' })
    const seen: string[] = []
    const complete = vi.fn()
    const runner = createChoreographyRunner({ steps: sequence, reducedMotion: false, onStep: (item) => seen.push(`${item.playerState}:${item.opponentState}`), onComplete: complete })
    runner.start()
    expect(seen).toEqual(['quickAttack:idle'])
    vi.advanceTimersByTime(actionHoldMs.quick - 1)
    expect(seen).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(seen.at(-1)).toBe('idle:hitReaction')
    vi.advanceTimersByTime(actionHoldMs.hit + actionHoldMs.idle)
    expect(complete).toHaveBeenCalledTimes(1)

    const stopped = vi.fn()
    const disposed = createChoreographyRunner({ steps: sequence, reducedMotion: false, onStep: vi.fn(), onComplete: stopped })
    disposed.start()
    disposed.dispose()
    vi.runAllTimers()
    expect(stopped).not.toHaveBeenCalled()
  })
})
