import type { FightingLevelProgress, FightingMilestoneId, UnitData, UnitWord } from '../../types/game'
import { fightingMilestones } from './fightingLevelConfig'
import { fightingPictureClueForWord } from './fightingPictureClueAssets'

export type FightingVocabularyRecord = { unitId: string; unitNumber: number; word: UnitWord }
export type FightingTaskMode = 'audio' | 'picture'
export type FightingTask = { wordId: string; unitId: string; mode: FightingTaskMode; audioSource?: string; pictureSource?: string }

const hash = (value: string) => {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619)
  return result >>> 0
}

export const fightingSeed = (value: string) => hash(value)

function stableShuffle<T>(values: readonly T[], seed: number, identity: (value: T) => string): T[] {
  return [...values].sort((left, right) => hash(`${seed}:${identity(left)}`) - hash(`${seed}:${identity(right)}`))
}

export function cumulativeFightingPool(allUnits: readonly UnitData[], milestoneId: FightingMilestoneId): FightingVocabularyRecord[] {
  const endUnit = fightingMilestones[milestoneId].endUnit
  const seen = new Set<string>()
  return allUnits
    .filter((unit) => unit.number <= endUnit)
    .flatMap((unit) => unit.words.map((word) => ({ unitId: unit.id, unitNumber: unit.number, word })))
    .filter((record) => {
      if (!record.word.id || !record.word.word.trim() || seen.has(record.word.id)) return false
      seen.add(record.word.id)
      return true
    })
}

export function fightingMilestoneDataStatus(allUnits: readonly UnitData[], milestoneId: FightingMilestoneId) {
  const endUnit = fightingMilestones[milestoneId].endUnit
  const requiredUnits = allUnits.filter((unit) => unit.number <= endUnit)
  const missingUnitNumbers = requiredUnits.filter((unit) => unit.words.length === 0).map((unit) => unit.number)
  const eligibleCount = cumulativeFightingPool(allUnits, milestoneId).length
  return { eligibleCount, missingUnitNumbers, productionReady: requiredUnits.length === endUnit && missingUnitNumbers.length === 0 && eligibleCount > 0 }
}

export const fightingBattleSize = (eligibleCount: number) => Math.ceil(eligibleCount / 3)

function balancedRoster(pool: readonly FightingVocabularyRecord[], count: number, seed: number): FightingVocabularyRecord[] {
  const queues = [...new Set(pool.map((record) => record.unitNumber))]
    .sort((left, right) => hash(`${seed}:unit:${left}`) - hash(`${seed}:unit:${right}`))
    .map((unitNumber) => stableShuffle(pool.filter((record) => record.unitNumber === unitNumber), seed + unitNumber, (record) => record.word.id))
  const selected: FightingVocabularyRecord[] = []
  while (selected.length < count && queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      const next = queue.shift()
      if (next) selected.push(next)
      if (selected.length === count) break
    }
  }
  return selected
}

export function createFightingBattleRosters(allUnits: readonly UnitData[], milestoneId: FightingMilestoneId, seed: number): string[][] {
  const config = fightingMilestones[milestoneId]
  const pool = cumulativeFightingPool(allUnits, milestoneId)
  const target = fightingBattleSize(pool.length)
  const first = balancedRoster(pool, target, seed)
  if (config.battleCount === 1) return [first.map((record) => record.word.id)]
  const excluded = new Set(first.map((record) => record.word.id))
  const second = balancedRoster(pool.filter((record) => !excluded.has(record.word.id)), target, seed + 1)
  return [first.map((record) => record.word.id), second.map((record) => record.word.id)]
}

export const blankFightingLevelProgress = (milestoneId: FightingMilestoneId): FightingLevelProgress => ({
  milestoneId,
  battleIndex: 0,
  battleRosterIds: [],
  passedBattleIndexes: [],
  attemptCount: 0,
  bestAccuracy: 0,
  completed: false,
  exclusionWordIds: [],
  seenEnemyIntros: [],
})

export function normalizeFightingLevelProgress(milestoneId: FightingMilestoneId, saved?: Partial<FightingLevelProgress>): FightingLevelProgress {
  const config = fightingMilestones[milestoneId]
  const battleRosterIds = Array.isArray(saved?.battleRosterIds)
    ? saved.battleRosterIds.slice(0, config.battleCount).map((roster) => [...new Set(Array.isArray(roster) ? roster.filter((id): id is string => typeof id === 'string') : [])])
    : []
  const passedBattleIndexes = [...new Set(Array.isArray(saved?.passedBattleIndexes)
    ? saved.passedBattleIndexes.filter((index): index is number => Number.isInteger(index) && index >= 0 && index < config.battleCount)
    : [])]
  const completed = config.battleCount > 0 && passedBattleIndexes.length === config.battleCount
  const battleIndex = completed ? config.battleCount - 1 : Math.min(config.battleCount - 1, Math.max(0, Number.isInteger(saved?.battleIndex) ? Number(saved?.battleIndex) : passedBattleIndexes.length))
  return {
    milestoneId,
    battleIndex,
    battleRosterIds,
    passedBattleIndexes,
    attemptCount: Math.max(0, Number(saved?.attemptCount) || 0),
    bestAccuracy: Math.max(0, Math.min(1, Number(saved?.bestAccuracy) || 0)),
    completed,
    exclusionWordIds: [...new Set(battleRosterIds[0] ?? [])],
    seenEnemyIntros: [...new Set(Array.isArray(saved?.seenEnemyIntros) ? saved.seenEnemyIntros.filter((id): id is FightingLevelProgress['seenEnemyIntros'][number] => typeof id === 'string' && ['inkbound-knight', 'prism-wraith', 'bellkeeper', 'crownless-marionette', 'corrupted-archivist'].includes(id)) : [])],
  }
}

export function markFightingEnemyIntroSeen(progress: FightingLevelProgress, enemyId: FightingLevelProgress['seenEnemyIntros'][number]): FightingLevelProgress {
  return progress.seenEnemyIntros.includes(enemyId) ? progress : { ...progress, seenEnemyIntros: [...progress.seenEnemyIntros, enemyId] }
}

export function prepareFightingLevelProgress(saved: FightingLevelProgress | undefined, allUnits: readonly UnitData[], milestoneId: FightingMilestoneId, seed: number): FightingLevelProgress {
  const normalized = normalizeFightingLevelProgress(milestoneId, saved)
  const config = fightingMilestones[milestoneId]
  const rostersReady = normalized.battleRosterIds.length === config.battleCount
    && normalized.battleRosterIds.every((roster) => roster.length > 0)
    && new Set(normalized.battleRosterIds.flat()).size === normalized.battleRosterIds.flat().length
  if (rostersReady) return normalized
  const battleRosterIds = createFightingBattleRosters(allUnits, milestoneId, seed)
  return { ...normalized, battleRosterIds, exclusionWordIds: [...(battleRosterIds[0] ?? [])] }
}

export function rosterRecords(allUnits: readonly UnitData[], milestoneId: FightingMilestoneId, ids: readonly string[]): FightingVocabularyRecord[] {
  const byId = new Map(cumulativeFightingPool(allUnits, milestoneId).map((record) => [record.word.id, record]))
  return ids.flatMap((id) => byId.get(id) ?? [])
}

export const isPictureEligibleForFighting = (word: UnitWord) =>
  word.pictureEligible ?? Boolean(fightingPictureClueForWord(word.id))
export const fightingAudioSource = (word: UnitWord) => word.audio || 'browser-speech'

export const fallbackFightingTaskToAudio = (task: FightingTask, word: UnitWord): FightingTask => task.mode === 'audio' ? task : {
  wordId: task.wordId,
  unitId: task.unitId,
  mode: 'audio',
  audioSource: fightingAudioSource(word),
}

export function buildFightingTasks(records: readonly FightingVocabularyRecord[], seed: number): FightingTask[] {
  const shuffled = stableShuffle(records, seed, (record) => record.word.id)
  const eligiblePictures = stableShuffle(shuffled.filter((record) =>
    isPictureEligibleForFighting(record.word) && Boolean(fightingPictureClueForWord(record.word.id)),
  ), seed + 17, (record) => record.word.id)
  const pictureTarget = Math.min(eligiblePictures.length, Math.round(shuffled.length / 3))
  const pictureIds = new Set(eligiblePictures.slice(0, pictureTarget).map((record) => record.word.id))
  return shuffled.map((record) => pictureIds.has(record.word.id)
    ? { wordId: record.word.id, unitId: record.unitId, mode: 'picture', pictureSource: fightingPictureClueForWord(record.word.id) }
    : { wordId: record.word.id, unitId: record.unitId, mode: 'audio', audioSource: fightingAudioSource(record.word) })
}

export const requiredFightingCorrect = (total: number) => Math.ceil(total * .85)
export const passesFightingBattle = (correct: number, total: number) => total > 0 && correct >= requiredFightingCorrect(total)

export function recordFightingBattleResult(progress: FightingLevelProgress, correct: number, total: number): FightingLevelProgress {
  const config = fightingMilestones[progress.milestoneId]
  const accuracy = total > 0 ? correct / total : 0
  const passed = passesFightingBattle(correct, total)
  const passedBattleIndexes = passed ? [...new Set([...progress.passedBattleIndexes, progress.battleIndex])].sort() : progress.passedBattleIndexes
  const completed = passedBattleIndexes.length === config.battleCount
  const battleIndex = passed && !completed ? Math.min(config.battleCount - 1, progress.battleIndex + 1) : progress.battleIndex
  return { ...progress, attemptCount: progress.attemptCount + 1, bestAccuracy: Math.max(progress.bestAccuracy, accuracy), passedBattleIndexes, battleIndex, completed }
}
