import type { FighterState } from './fighterStates'
import { opponents, type FighterChallengeKind, type OpponentId } from './codeFighterEngine'

export type FighterEffectKind = 'quick' | 'heavy' | 'block' | 'counter' | 'hit' | 'guardBreak' | 'combo' | 'ultimate' | 'enemySuper' | 'victory'

export type ChoreographyStep = {
  playerState: FighterState
  opponentState: FighterState
  effect?: FighterEffectKind
  durationMs: number
}

export type CombatOutcome = 'continue' | 'victory' | 'defeat'

export type ChoreographyRunner = {
  start: () => void
  dispose: () => void
}

export const BATTLE_INTRO_HOLD_MS = 1000
export const ENEMY_RESULT_REVEAL_MS = 500
export const ANSWER_TICK_MS = 100

export const actionHoldMs = {
  idle: 300,
  quick: 1000,
  hit: 1000,
  block: 1200,
  counter: 1200,
  heavy: 1450,
  comboBridge: 700,
  ultimate: 2000,
  outcome: 1400,
} as const

const step = (playerState: FighterState, opponentState: FighterState, durationMs: number, effect?: FighterEffectKind): ChoreographyStep => ({ playerState, opponentState, durationMs, effect })

export function answerWindowMs(opponentId: OpponentId, kind: FighterChallengeKind) {
  return opponents[opponentId].role === 'boss' && kind === 'ultimate' ? 5000 : 7000
}

export function answeringOpponentState(kind: FighterChallengeKind): FighterState {
  if (kind === 'defense') return 'quickAttack'
  if (kind === 'audio') return 'heavyAttack'
  return 'idle'
}

function successfulSequence(kind: FighterChallengeKind, comboComplete: boolean): ChoreographyStep[] {
  if (kind === 'quick') return [
    step('quickAttack', 'idle', actionHoldMs.quick, 'quick'),
    step('idle', 'hitReaction', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'defense') return [
    step('block', 'quickAttack', actionHoldMs.block, 'block'),
    step('counter', 'idle', actionHoldMs.counter, 'counter'),
    step('idle', 'hitReaction', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'spelling') return [
    step('heavyAttack', 'idle', actionHoldMs.heavy, 'heavy'),
    step('idle', 'block', actionHoldMs.block, 'block'),
    step('idle', 'hitReaction', actionHoldMs.hit, 'guardBreak'),
  ]
  if (kind === 'audio') return [
    step('counter', 'heavyAttack', actionHoldMs.counter, 'counter'),
    step('idle', 'hitReaction', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'meaning') return [
    step('quickAttack', 'idle', actionHoldMs.quick, 'quick'),
    step('idle', 'hitReaction', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'combo') {
    if (!comboComplete) return [step('idle', 'idle', actionHoldMs.comboBridge, 'combo')]
    return [
      step('quickAttack', 'idle', actionHoldMs.quick, 'quick'),
      step('idle', 'hitReaction', actionHoldMs.hit, 'hit'),
      step('heavyAttack', 'idle', actionHoldMs.heavy, 'heavy'),
      step('idle', 'block', actionHoldMs.block, 'block'),
      step('counter', 'idle', actionHoldMs.counter, 'combo'),
      step('idle', 'hitReaction', actionHoldMs.hit, 'guardBreak'),
    ]
  }
  return [
    step('ultimate', 'idle', actionHoldMs.ultimate, 'ultimate'),
    step('idle', 'hitReaction', actionHoldMs.hit, 'hit'),
  ]
}

function failedSequence(kind: FighterChallengeKind): ChoreographyStep[] {
  if (kind === 'defense') return [
    step('idle', 'quickAttack', actionHoldMs.quick, 'quick'),
    step('hitReaction', 'idle', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'spelling' || kind === 'quick') return [
    step('idle', 'counter', actionHoldMs.counter, 'counter'),
    step('hitReaction', 'idle', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'audio') return [
    step('idle', 'heavyAttack', actionHoldMs.heavy, 'heavy'),
    step('hitReaction', 'idle', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'meaning') return [
    step('quickAttack', 'block', actionHoldMs.block, 'block'),
    step('idle', 'quickAttack', actionHoldMs.quick, 'quick'),
    step('hitReaction', 'idle', actionHoldMs.hit, 'hit'),
  ]
  if (kind === 'combo') return [
    step('idle', 'counter', actionHoldMs.counter, 'counter'),
    step('hitReaction', 'idle', actionHoldMs.hit, 'hit'),
  ]
  return [
    step('idle', 'heavyAttack', actionHoldMs.ultimate, 'enemySuper'),
    step('hitReaction', 'idle', actionHoldMs.hit, 'hit'),
  ]
}

export function choreographyFor({ kind, correct, outcome, comboComplete = true }: { kind: FighterChallengeKind; correct: boolean; outcome: CombatOutcome; comboComplete?: boolean }): ChoreographyStep[] {
  const sequence = correct ? successfulSequence(kind, comboComplete) : failedSequence(kind)
  if (outcome === 'victory') return [...sequence, step('victory', 'tiredDefeat', actionHoldMs.outcome, 'victory')]
  if (outcome === 'defeat') return [...sequence, step('tiredDefeat', 'victory', actionHoldMs.outcome, 'victory')]
  return [...sequence, step('idle', 'idle', actionHoldMs.idle)]
}

export function presentationDuration(durationMs: number, reducedMotion: boolean) {
  return reducedMotion ? Math.min(durationMs, 900) : durationMs
}

export function createChoreographyRunner({ steps, reducedMotion, onStep, onComplete }: {
  steps: readonly ChoreographyStep[]
  reducedMotion: boolean
  onStep: (step: ChoreographyStep, index: number) => void
  onComplete: () => void
}): ChoreographyRunner {
  let timer: ReturnType<typeof setTimeout> | undefined
  let started = false
  let disposed = false

  const show = (index: number) => {
    if (disposed) return
    const current = steps[index]
    if (!current) {
      onComplete()
      return
    }
    onStep(current, index)
    timer = setTimeout(() => {
      timer = undefined
      if (index + 1 < steps.length) show(index + 1)
      else if (!disposed) onComplete()
    }, presentationDuration(current.durationMs, reducedMotion))
  }

  return {
    start() {
      if (started || disposed) return
      started = true
      show(0)
    },
    dispose() {
      disposed = true
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    },
  }
}
