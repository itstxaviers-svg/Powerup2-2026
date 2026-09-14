import { chooseScheduledWord } from '../../learning/taskScheduler'
import type { QuestionDifficulty, UnitWord, WeakWordRecord } from '../../types/game'

export const WORD_STRIKE_CONFIG = {
  roundsPerSession: 6,
  minimumCompletionAccuracy: .4,
  baseScore: 10,
}

export type WordStrikeLevelId = 'spelling' | 'audio'

export type WordStrikeLevel = {
  id: WordStrikeLevelId
  title: 'SPELLING STRIKE' | 'AUDIO STRIKE'
  prompt: string
  isEligible: (word: UnitWord) => boolean
}

const usableTypoForms = (word: UnitWord) => [...new Set((word.typoForms ?? [])
  .map((form) => form.trim())
  .filter((form) => form && form.toLocaleLowerCase() !== word.word.trim().toLocaleLowerCase()))]

export const isSpellingStrikeEligible = (word: UnitWord) => word.word.trim().length > 1 && usableTypoForms(word).length >= 2
export const isAudioStrikeEligible = (word: UnitWord) => word.word.trim().length > 1 && Boolean(word.audio?.trim()) && word.audio !== 'dev-speech'

export const wordStrikeLevels: WordStrikeLevel[] = [
  { id: 'spelling', title: 'SPELLING STRIKE', prompt: 'Strike the correctly spelled word.', isEligible: isSpellingStrikeEligible },
  { id: 'audio', title: 'AUDIO STRIKE', prompt: 'Listen and strike the word you hear.', isEligible: isAudioStrikeEligible },
]

export type StrikeTarget = {
  id: string
  word: string
  left: number
  top: number
  motion: 'drift' | 'diagonal' | 'bob'
  skin: number
}

export type WordStrikeRound = {
  word: UnitWord
  answer: string
  level: WordStrikeLevel
  audio?: string
  targets: StrikeTarget[]
  isReview: boolean
  reviewIndex: number
  variantId: string
  variantDifficulty: QuestionDifficulty
}

const positions = [
  { left: 19, top: 31 },
  { left: 48, top: 58 },
  { left: 76, top: 29 },
]
const motions: StrikeTarget['motion'][] = ['drift', 'bob', 'diagonal']

const stableHash = (value: string) => [...value].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7)
const normalizedIndex = (seed: number, length: number) => ((seed % length) + length) % length

export function availableWordStrikeLevels(words: UnitWord[]): WordStrikeLevel[] {
  const audioWordCount = words.filter(isAudioStrikeEligible).length
  return wordStrikeLevels.filter((level) => level.id === 'audio' ? audioWordCount >= 3 : words.some(level.isEligible))
}

export const eligibleForStrikeLevel = (words: UnitWord[], level: WordStrikeLevel) => words.filter(level.isEligible)

export function chooseWordStrikeLevel(words: UnitWord[], taskIndex: number, previousLevelId?: WordStrikeLevelId): WordStrikeLevel | null {
  const available = availableWordStrikeLevels(words)
  if (!available.length) return null
  if (previousLevelId && available.length > 1) {
    const alternative = available.find((level) => level.id !== previousLevelId)
    if (alternative) return alternative
  }
  return available[normalizedIndex(taskIndex, available.length)]
}

// Retained as a reusable vocabulary helper for modules that need contextual gaps.
export function sentenceGap(word: UnitWord): string | null {
  if (!word.example) return null
  if (word.example.includes('____')) return word.example
  const target = word.contextForm || word.word
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const replaced = word.example.replace(new RegExp(escaped, 'i'), '____')
  return replaced === word.example ? null : replaced
}

function placeCorrectAnswer(answer: string, distractors: string[], wordId: string, reviewIndex: number) {
  const correctIndex = normalizedIndex(stableHash(wordId) + reviewIndex, 3)
  const options = distractors.slice(0, 2)
  options.splice(correctIndex, 0, answer)
  return options
}

export function spellingStrikeOptions(word: UnitWord, reviewIndex: number): string[] | null {
  const variants = usableTypoForms(word)
  if (variants.length < 2) return null
  const start = normalizedIndex(stableHash(word.id) + reviewIndex, variants.length)
  const distractors = [variants[start], variants[(start + 1) % variants.length]]
  return placeCorrectAnswer(word.word, distractors, word.id, reviewIndex)
}

export function audioStrikeOptions(word: UnitWord, words: UnitWord[], reviewIndex: number): string[] | null {
  const distractorPool = words.filter((candidate) => isAudioStrikeEligible(candidate) && candidate.id !== word.id)
  if (!isAudioStrikeEligible(word) || distractorPool.length < 2) return null
  const start = normalizedIndex(stableHash(word.id) + reviewIndex, distractorPool.length)
  const distractors = [distractorPool[start].word, distractorPool[(start + 1) % distractorPool.length].word]
  return placeCorrectAnswer(word.word, distractors, word.id, reviewIndex)
}

export function createWordStrikeRound({
  unitId,
  level,
  allWords,
  weakWords,
  reviewIndex,
  recentWordIds,
  trainedWordIds = [],
}: {
  unitId: string
  level: WordStrikeLevel
  allWords: UnitWord[]
  weakWords: Record<string, WeakWordRecord>
  reviewIndex: number
  recentWordIds: string[]
  trainedWordIds?: readonly string[]
}): WordStrikeRound | null {
  const eligible = eligibleForStrikeLevel(allWords, level)
  const scheduled = chooseScheduledWord({ words: eligible, moduleId: 'word-strike', unitId, weakWords, taskIndex: reviewIndex, recentWordIds, trainedWordIds })
  if (!scheduled) return null

  const options = level.id === 'spelling'
    ? spellingStrikeOptions(scheduled.word, reviewIndex)
    : audioStrikeOptions(scheduled.word, eligible, reviewIndex)
  if (!options || options.length !== 3 || options.filter((option) => option === scheduled.word.word).length !== 1) return null

  return {
    word: scheduled.word,
    answer: scheduled.word.word,
    level,
    audio: level.id === 'audio' ? scheduled.word.audio : undefined,
    isReview: scheduled.isReview,
    reviewIndex,
    variantId: `word-strike.${level.id}`,
    variantDifficulty: 2,
    targets: options.map((word, index) => ({
      id: `${index}-${word}`,
      word,
      ...positions[index],
      motion: motions[(index + reviewIndex) % motions.length],
      skin: (index + reviewIndex) % 3,
    })),
  }
}

export const scoreForStrike = (combo: number, reactionMs: number) => {
  const multiplier = 1 + Math.floor(combo / 2)
  const speedBonus = reactionMs < 3500 ? 5 : 0
  return { multiplier, points: WORD_STRIKE_CONFIG.baseScore * multiplier + speedBonus, speedBonus }
}
