import { describe, expect, it } from 'vitest'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { units } from '../data/units'
import { moduleIds } from '../types/game'
import { createProgress } from '../progress/localProgressRepository'
import { coverageForModule, coverageForTrainedWordIds, eligibleWordsForModule } from './moduleCoverage'

describe('module vocabulary eligibility', () => {
  it('derives Unit 1 coverage from production records instead of a hardcoded total', () => {
    expect(unit1Vocabulary).toHaveLength(50)
    for (const moduleId of moduleIds) expect(eligibleWordsForModule(unit1Vocabulary, moduleId)).toHaveLength(50)
  })

  it('keeps empty future Units incomplete with a zero eligible denominator', () => {
    const progress = createProgress(1)
    for (const unit of units.slice(3)) {
      for (const moduleId of moduleIds) {
        expect(coverageForModule(unit, moduleId, progress.units[unit.id].modules[moduleId])).toEqual({ trained: 0, total: 0, complete: false })
      }
    }
  })

  it('counts only unique eligible IDs and ignores stale or unknown IDs', () => {
    const unit = units[0]
    const ids = unit1Vocabulary.slice(0, 5).map((word) => word.id)
    expect(coverageForTrainedWordIds(unit, 'repair', [...ids, ids[0], 'legacy-display-string', 'invented'])).toEqual({
      trained: 5,
      total: 50,
      complete: false,
    })
  })
})
