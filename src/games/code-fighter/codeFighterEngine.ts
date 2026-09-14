import { chooseScheduledWord } from '../../learning/taskScheduler'
import { chooseQuestionVariant } from '../../learning/questionVariation'
import type { QuestionDifficulty, QuestionVariantState, UnitWord, WeakWordRecord } from '../../types/game'
import type { FighterState } from './fighterStates'

export type FighterChallengeKind = 'quick' | 'meaning' | 'spelling' | 'defense' | 'audio' | 'combo' | 'ultimate'
export type FighterStep = {
  mode: 'choice' | 'text'
  prompt: string
  clue?: string
  image?: string
  audio?: string
  choices?: string[]
  expected: string
  spelling: boolean
}
export type FighterChallenge = {
  kind: FighterChallengeKind
  title: string
  word: UnitWord
  steps: FighterStep[]
  damage: number
  playerState: FighterState
  isReview: boolean
  reviewIndex: number
}

export type OpponentId = 'kael' | 'construct' | 'lady-gearveil' | 'chronofang' | 'roseclock-duchess' | 'thornbound-archivist'
export type OpponentRole = 'rival' | 'boss'
export const opponents = {
  kael: { id: 'kael', role: 'rival', name: 'Rival Kael', subtitle: 'Arcane sparring rival', maxHp: 12, damage: 1, boss: false },
  construct: { id: 'construct', role: 'boss', name: 'Corrupted Construct', subtitle: 'Unit guardian challenge', maxHp: 16, damage: 2, boss: true },
  'lady-gearveil': { id: 'lady-gearveil', role: 'rival', name: 'Lady Gearveil', subtitle: 'Clockwork City rival', maxHp: 12, damage: 1, boss: false },
  chronofang: { id: 'chronofang', role: 'boss', name: 'Chronofang', subtitle: 'Clockwork City guardian', maxHp: 16, damage: 2, boss: true },
  'roseclock-duchess': { id: 'roseclock-duchess', role: 'rival', name: 'Roseclock Duchess', subtitle: 'Garden of Words rival', maxHp: 12, damage: 1, boss: false },
  'thornbound-archivist': { id: 'thornbound-archivist', role: 'boss', name: 'Thornbound Archivist', subtitle: 'Garden of Words guardian', maxHp: 16, damage: 2, boss: true },
} satisfies Record<OpponentId, { id: OpponentId; role: OpponentRole; name: string; subtitle: string; maxHp: number; damage: number; boss: boolean }>

const opponentsByUnit: Record<string, Record<OpponentRole, OpponentId>> = {
  'unit-01': { rival: 'kael', boss: 'construct' },
  'unit-02': { rival: 'lady-gearveil', boss: 'chronofang' },
  'unit-03': { rival: 'roseclock-duchess', boss: 'thornbound-archivist' },
}

export function resolveOpponentForUnit(unitId: string, role: OpponentRole): OpponentId {
  return opponentsByUnit[unitId]?.[role] ?? opponentsByUnit['unit-01'][role]
}

export const opponentsForUnit = (unitId: string): OpponentId[] => [
  resolveOpponentForUnit(unitId, 'rival'),
  resolveOpponentForUnit(unitId, 'boss'),
]

export const challengeOrder: FighterChallengeKind[] = ['quick', 'defense', 'spelling', 'audio', 'meaning', 'combo', 'ultimate']
const has = (value?: string) => Boolean(value?.trim())
const hasCyrillic = (value: string) => /[\u0400-\u04ff]/u.test(value)
const englishDefinition = (word: UnitWord) => {
  const definition = word.definition?.trim()
  return definition && !hasCyrillic(definition) ? definition : undefined
}

export function supportsFighterChallenge(word: UnitWord, kind: FighterChallengeKind) {
  if (kind === 'quick') return Boolean(englishDefinition(word))
  if (kind === 'meaning') return has(word.image) || Boolean(englishDefinition(word))
  if (kind === 'spelling' || kind === 'defense') return word.word.trim().length > 1
  if (kind === 'audio') return has(word.audio)
  if (kind === 'combo') return Boolean(englishDefinition(word) && has(word.example) && word.word.trim().length > 1)
  return Boolean((englishDefinition(word) || has(word.image) || has(word.audio)) && word.word.trim().length > 1)
}

export const availableFighterKinds = (words: UnitWord[], energy = 4) =>
  challengeOrder.filter((kind) => (kind !== 'ultimate' || energy >= 4) && words.some((word) => supportsFighterChallenge(word, kind)))

const difficultyForKind = (kind: FighterChallengeKind): QuestionDifficulty =>
  kind === 'quick' || kind === 'meaning' ? 1 : kind === 'combo' || kind === 'ultimate' ? 3 : 2

function optionsFor(target: UnitWord, allWords: UnitWord[], answer: string, index: number) {
  const explicit = target.distractors?.filter((value) => Boolean(value?.trim()) && !hasCyrillic(value)) ?? []
  const definitions = allWords.filter((word) => word.id !== target.id).flatMap((word) => [word.word, englishDefinition(word)]).filter((value): value is string => Boolean(value?.trim()))
  const unique = [...new Set([answer, ...explicit, ...definitions])].slice(0, 4)
  const shift = unique.length ? index % unique.length : 0
  return [...unique.slice(shift), ...unique.slice(0, shift)]
}

export function damagedSpelling(word: UnitWord) {
  const supplied = word.typoForms?.find((value) => value.trim() && value.toLocaleLowerCase() !== word.word.toLocaleLowerCase())
  if (supplied) return supplied
  const letters = [...word.word]
  if (letters.length < 2) return `${word.word}?`
  const index = Math.min(1, letters.length - 2)
  ;[letters[index], letters[index + 1]] = [letters[index + 1], letters[index]]
  return letters.join('')
}

function sentenceGap(word: UnitWord) {
  if (!word.example) return ''
  if (word.example.includes('____')) return word.example
  const target = word.contextForm || word.word
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return word.example.replace(new RegExp(escaped, 'i'), '____')
}

function stepsFor(kind: FighterChallengeKind, word: UnitWord, allWords: UnitWord[], index: number): FighterStep[] {
  const clue = englishDefinition(word) || word.word
  if (kind === 'quick') return [{ mode: 'choice', prompt: 'Choose the word for this meaning.', clue, choices: optionsFor(word, allWords, word.word, index), expected: word.word, spelling: false }]
  if (kind === 'meaning') return [{ mode: 'choice', prompt: word.image ? 'Choose the word shown in the picture.' : 'Match the meaning.', clue: englishDefinition(word), image: word.image, choices: optionsFor(word, allWords, word.word, index), expected: word.word, spelling: false }]
  if (kind === 'spelling') return [{ mode: 'text', prompt: 'Type the English word.', clue, expected: word.word, spelling: true }]
  if (kind === 'defense') return [{ mode: 'text', prompt: 'Repair this damaged spelling to block.', clue: damagedSpelling(word), expected: word.word, spelling: true }]
  if (kind === 'audio') return [{ mode: 'text', prompt: 'Listen, then type the word.', audio: word.audio, expected: word.word, spelling: true }]
  if (kind === 'combo') return [
    { mode: 'choice', prompt: 'Combo 1/3 · Match the meaning.', clue, choices: optionsFor(word, allWords, word.word, index), expected: word.word, spelling: false },
    { mode: 'text', prompt: 'Combo 2/3 · Type the spelling.', clue, expected: word.word, spelling: true },
    { mode: 'choice', prompt: 'Combo 3/3 · Complete the context.', clue: sentenceGap(word), choices: optionsFor(word, allWords, word.contextForm || word.word, index + 1), expected: word.contextForm || word.word, spelling: false },
  ]
  return [{ mode: 'text', prompt: 'Ultimate recall · Type the word with no choices.', clue: englishDefinition(word), image: word.image, audio: word.audio, expected: word.word, spelling: true }]
}

const presentation = {
  quick: { title: 'Quick Meaning', damage: 1, playerState: 'quickAttack' },
  meaning: { title: 'Meaning Strike', damage: 1, playerState: 'quickAttack' },
  spelling: { title: 'Heavy Spelling', damage: 2, playerState: 'heavyAttack' },
  defense: { title: 'Error Defense', damage: 0, playerState: 'block' },
  audio: { title: 'Audio Counter', damage: 2, playerState: 'counter' },
  combo: { title: 'Three-Step Combo', damage: 3, playerState: 'heavyAttack' },
  ultimate: { title: 'Ultimate Recall', damage: 4, playerState: 'ultimate' },
} satisfies Record<FighterChallengeKind, { title: string; damage: number; playerState: FighterState }>

export function createFighterChallenge({ unitId, allWords, weakWords, reviewIndex, recentWordIds, trainedWordIds = [], variantStateByWordId = {}, energy, challengeIndex = reviewIndex }: { unitId: string; allWords: UnitWord[]; weakWords: Record<string, WeakWordRecord>; reviewIndex: number; recentWordIds: string[]; trainedWordIds?: readonly string[]; variantStateByWordId?: Record<string, QuestionVariantState>; energy: number; challengeIndex?: number }): FighterChallenge | null {
  const kinds = availableFighterKinds(allWords, energy)
  if (!kinds.length) return null
  const requestedKind = kinds[challengeIndex % kinds.length]
  const eligible = allWords.filter((word) => supportsFighterChallenge(word, requestedKind))
  const scheduled = chooseScheduledWord({ words: eligible, moduleId: 'code-fighter', unitId, weakWords, taskIndex: reviewIndex, recentWordIds, trainedWordIds })
  if (!scheduled) return null
  const previous = variantStateByWordId[scheduled.word.id]
  const variants = kinds
    .filter((kind) => supportsFighterChallenge(scheduled.word, kind))
    .map((kind) => ({ variantId: `code-fighter.${kind}`, difficulty: difficultyForKind(kind), value: kind }))
  const variant = previous
    ? chooseQuestionVariant(variants, previous, reviewIndex, difficultyForKind(requestedKind))
    : variants.find((candidate) => candidate.value === requestedKind) ?? null
  if (!variant) return null
  const kind = variant.value
  return { kind, word: scheduled.word, steps: stepsFor(kind, scheduled.word, allWords, reviewIndex), isReview: scheduled.isReview, reviewIndex, ...presentation[kind] }
}

export function resolveCombat({ playerHp, opponentHp, correct, challenge, opponentDamage }: { playerHp: number; opponentHp: number; correct: boolean; challenge: Pick<FighterChallenge, 'damage'>; opponentDamage: number }) {
  return correct
    ? { playerHp, opponentHp: Math.max(0, opponentHp - challenge.damage), outcome: opponentHp - challenge.damage <= 0 ? 'victory' as const : 'continue' as const }
    : { playerHp: Math.max(0, playerHp - opponentDamage), opponentHp, outcome: playerHp - opponentDamage <= 0 ? 'defeat' as const : 'continue' as const }
}
