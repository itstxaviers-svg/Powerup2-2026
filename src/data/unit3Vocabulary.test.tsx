import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { UnitHub } from '../app/App'
import { availableFighterKinds, createFighterChallenge } from '../games/code-fighter/codeFighterEngine'
import { errorHuntVariants, isPlausibleSpellingVariant } from '../games/training/errorHuntEngine'
import { damageRepairTarget, isAcceptedRepairAnswer, repairClueFor } from '../games/training/repairEngine'
import { availableWordStrikeLevels, createWordStrikeRound, eligibleForStrikeLevel } from '../games/word-strike/wordStrikeEngine'
import { coverageForModule, eligibleWordsForModule } from '../learning/moduleCoverage'
import { filterVocabularyByParts, normalizeVocabularyPartSelection, selectAllVocabularyParts, vocabularyPartLabel } from '../learning/vocabularyParts'
import { recordSpellingMistake, reviewCandidates, weakWordKey } from '../learning/weakWordEngine'
import { createProgress } from '../progress/localProgressRepository'
import { applyModuleAttempt, completedModuleCount, isModuleComplete } from '../progress/progressionEngine'
import { moduleIds, type ModuleAttempt, type ModuleId } from '../types/game'
import { cityRevealByUnit, toCityRevealStage } from './cityReveal'
import { unit3Vocabulary, unit3VocabularySources, type Unit3VocabularySourcePart } from './unit3Vocabulary'
import { units } from './units'
import { validateVocabulary } from './vocabularyValidation'

const expectedTargetsByPart: Record<Unit3VocabularySourcePart, string[]> = {
  1: ['dentist', 'nurse', 'surprise', 'treasure', 'invite', 'only', 'call', 'dress up'],
  2: ['scarecrow', 'beard', 'blonde', 'curly', 'fair', 'fat', 'moustache', 'short', 'straight', 'tall', 'thin'],
  3: ['a teacher', 'a firefighter', 'a dentist', 'a doctor', 'a nurse', 'a police officer', 'fire station', 'bus station', 'school', 'hospital', 'a farmer', 'plants', 'restaurant'],
  4: ['costume party', 'as a', 'idea', 'wear', 'come in', 'good at', 'meet', 'smile'],
}

const unit3 = units[2]
const byTarget = (target: string) => unit3Vocabulary.find((word) => word.word === target)!
const attempt = (moduleId: ModuleId, wordId: string, weakWords = {}): ModuleAttempt => ({
  unitId: 'unit-03', moduleId, wordId, correct: true, weakWords, accuracy: 1,
})
const trainUnit3 = (moduleId: ModuleId, wordIds: string[], progress = createProgress(1)) =>
  wordIds.reduce((current, wordId) => applyModuleAttempt(current, attempt(moduleId, wordId, current.weakWords)), progress)

describe('Unit 3 production vocabulary', () => {
  it('contains the exact 40 supplied entries in four Parts with no source-page invention', () => {
    expect(unit3).toMatchObject({ id: 'unit-03', title: 'Garden of Words', courseTitle: 'Party time!' })
    expect(unit3Vocabulary).toHaveLength(40)
    expect(unit3VocabularySources).toEqual({
      1: { title: 'Party time. Vocabulary 1' },
      2: { title: 'Party time. Vocabulary 2' },
      3: { title: 'Party time! People who help us' },
      4: { title: 'Party time! Literature' },
    })
    ;([1, 2, 3, 4] as Unit3VocabularySourcePart[]).forEach((part) => {
      const words = unit3Vocabulary.filter((word) => word.sourcePart === part)
      expect(words.map((word) => word.word)).toEqual(expectedTargetsByPart[part])
      expect(words.every((word) => word.sourceTitle === unit3VocabularySources[part].title)).toBe(true)
      expect(words.every((word) => word.sourcePage === undefined)).toBe(true)
    })
    expect([1, 2, 3, 4].map((part) => unit3Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([8, 11, 13, 8])
    expect(new Set(unit3Vocabulary.map((word) => word.id)).size).toBe(40)
    expect(validateVocabulary(units)).toEqual([])
  })

  it('preserves spelling, articles, phrases, and supplied meaning notes without source-site noise', () => {
    expect(byTarget('moustache')).toBeDefined()
    for (const target of ['a teacher', 'a firefighter', 'a dentist', 'a doctor', 'a nurse', 'a police officer', 'a farmer']) {
      expect(byTarget(target).word).toBe(target)
    }
    for (const target of ['dress up', 'costume party', 'as a', 'come in', 'good at']) {
      expect(byTarget(target)).toMatchObject({ word: target, fixedPhrase: true })
    }
    expect(byTarget('surprise').translation).toContain('что-то, что удивило')
    expect(byTarget('only').translation).toContain('только; единственный')
    expect(byTarget('as a').translation).toBe('в качестве')
    const allText = unit3Vocabulary.flatMap((word) => [word.word, word.sourceTitle]).join(' ')
    expect(allText).not.toMatch(/Listen as a podcast|bookmark|share ios|more horizontal/i)
  })

  it('provides spelling-only variants and safe Repair data for every entry', () => {
    unit3Vocabulary.forEach((word) => {
      expect(word.typoForms, word.word).toHaveLength(3)
      word.typoForms?.forEach((variant) => expect(isPlausibleSpellingVariant(word, variant), `${word.word} -> ${variant}`).toBe(true))
      expect(errorHuntVariants(word).length, word.word).toBeGreaterThanOrEqual(3)
      expect(repairClueFor(word, 0)).not.toBeNull()
      expect(damageRepairTarget(word.word, 2)).not.toBe(word.word)
      expect(isAcceptedRepairAnswer(word, word.word.toLocaleUpperCase())).toBe(true)
    })
  })

  it('feeds all 40 entries through the existing five-module schedulers', () => {
    for (const moduleId of moduleIds) expect(eligibleWordsForModule(unit3Vocabulary, moduleId), moduleId).toHaveLength(40)
    const strikeLevels = availableWordStrikeLevels(unit3Vocabulary)
    expect(strikeLevels.map((level) => level.id)).toEqual(['spelling', 'audio'])
    strikeLevels.forEach((level, index) => {
      expect(eligibleForStrikeLevel(unit3Vocabulary, level)).toHaveLength(40)
      const round = createWordStrikeRound({ unitId: 'unit-03', level, allWords: unit3Vocabulary, weakWords: {}, reviewIndex: index, recentWordIds: [] })
      expect(round?.targets).toHaveLength(3)
      expect(round?.targets.filter((target) => target.word === round.answer)).toHaveLength(1)
    })
    expect(availableFighterKinds(unit3Vocabulary, 4)).toEqual(['quick', 'defense', 'spelling', 'audio', 'meaning', 'combo', 'ultimate'])
    availableFighterKinds(unit3Vocabulary, 4).forEach((kind, index) => {
      const challenge = createFighterChallenge({ unitId: 'unit-03', allWords: unit3Vocabulary, weakWords: {}, reviewIndex: index, challengeIndex: index, recentWordIds: [], energy: 4 })
      expect(challenge?.kind).toBe(kind)
      expect(challenge?.word.id).toMatch(/^u3-/)
    })
  })

  it('uses Part selection only as a session filter and keeps Unit-wide coverage', () => {
    expect(normalizeVocabularyPartSelection(unit3Vocabulary)).toEqual([1])
    expect(selectAllVocabularyParts(unit3Vocabulary)).toEqual([1, 2, 3, 4])
    expect([1, 2, 3, 4].map((part) => filterVocabularyByParts(unit3Vocabulary, [part]).length)).toEqual([8, 11, 13, 8])
    expect(vocabularyPartLabel('unit-03', 3)).toBe('Part 3 · Party time! People who help us')
    const afterPart1 = trainUnit3('repair', filterVocabularyByParts(unit3Vocabulary, [1]).map((word) => word.id))
    expect(coverageForModule(unit3, 'repair', afterPart1.units['unit-03'].modules.repair)).toEqual({ trained: 8, total: 40, complete: false })
    expect(isModuleComplete(afterPart1, 'unit-03', 'repair')).toBe(false)
    expect(completedModuleCount(afterPart1, 'unit-03')).toBe(0)
  })

  it('requires 40/40 coverage, advances Garden of Words once, and shares the Weak Word engine', () => {
    let progress = trainUnit3('repair', unit3Vocabulary.slice(0, 5).map((word) => word.id))
    expect(coverageForModule(unit3, 'repair', progress.units['unit-03'].modules.repair)).toEqual({ trained: 5, total: 40, complete: false })
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-03'))).toBe(0)
    progress = trainUnit3('repair', unit3Vocabulary.slice(5).map((word) => word.id), progress)
    expect(coverageForModule(unit3, 'repair', progress.units['unit-03'].modules.repair)).toEqual({ trained: 40, total: 40, complete: true })
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-03'))).toBe(1)
    expect(cityRevealByUnit['unit-03'].stages[1].name).toBe('Garden core')

    const weak = recordSpellingMistake({}, 'unit-03', unit3Vocabulary[0].id, 0, 100)
    expect(weak[weakWordKey('unit-03', unit3Vocabulary[0].id)]).toBeDefined()
    expect(reviewCandidates(weak, 'unit-03', 4)).toHaveLength(1)
    expect(reviewCandidates(weak, 'unit-02', 4)).toEqual([])
  })

  it('renders the existing city identity, learner title, and 40-word denominator', () => {
    const html = renderToStaticMarkup(<UnitHub
      unit={unit3}
      profile={{ playerId: 'one', name: 'Learner', group: '2B', avatarId: 1, avatarEvolutionStage: 1, createdAt: 1 }}
      progress={createProgress(1)} selectedParts={[1]} onPartSelectionChange={vi.fn()}
      highlightReveal={false} showCompletion={false} onClaimReward={vi.fn()} onCompleteFlow={vi.fn()}
      onBack={vi.fn()} onOpenModule={vi.fn()}
    />)
    expect(html).toContain('Garden of Words')
    expect(html).toContain('Party time!')
    expect(html).toContain('0 / 40 words trained')
  })
})
