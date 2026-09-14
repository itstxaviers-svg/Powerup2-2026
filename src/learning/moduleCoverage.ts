import { challengeOrder, supportsFighterChallenge } from '../games/code-fighter/codeFighterEngine'
import { wordStrikeLevels } from '../games/word-strike/wordStrikeEngine'
import { isRepairEligible } from '../games/training/repairEngine'
import type { ModuleId, ModuleProgress, UnitData, UnitWord } from '../types/game'
import { eligibleWords } from './taskScheduler'

export type ModuleCoverage = {
  trained: number
  total: number
  complete: boolean
}

export function eligibleWordsForModule(words: UnitWord[], moduleId: ModuleId): UnitWord[] {
  if (moduleId === 'repair') return words.filter(isRepairEligible)
  if (moduleId === 'error-hunt' || moduleId === 'audio-code') return eligibleWords(words, moduleId)
  if (moduleId === 'word-strike') return words.filter((word) => wordStrikeLevels.some((level) => level.isEligible(word)))
  return words.filter((word) => challengeOrder.some((kind) => supportsFighterChallenge(word, kind)))
}

export function eligibleWordIdsForModule(words: UnitWord[], moduleId: ModuleId): string[] {
  return eligibleWordsForModule(words, moduleId).map((word) => word.id)
}

export function coverageForTrainedWordIds(unit: UnitData, moduleId: ModuleId, trainedWordIds: readonly string[]): ModuleCoverage {
  const requiredIds = new Set(eligibleWordIdsForModule(unit.words, moduleId))
  const trained = new Set(trainedWordIds.filter((id) => requiredIds.has(id))).size
  return { trained, total: requiredIds.size, complete: requiredIds.size > 0 && trained === requiredIds.size }
}

export function coverageForModule(unit: UnitData, moduleId: ModuleId, progress: ModuleProgress): ModuleCoverage {
  return coverageForTrainedWordIds(unit, moduleId, progress.trainedWordIds)
}
