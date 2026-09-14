import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { UnitHub } from '../app/App'
import { availableFighterKinds, createFighterChallenge } from '../games/code-fighter/codeFighterEngine'
import { errorHuntVariants, isPlausibleSpellingVariant } from '../games/training/errorHuntEngine'
import { damageRepairTarget, isAcceptedRepairAnswer, repairClueFor } from '../games/training/repairEngine'
import { availableWordStrikeLevels, createWordStrikeRound, eligibleForStrikeLevel } from '../games/word-strike/wordStrikeEngine'
import { coverageForModule, eligibleWordsForModule } from '../learning/moduleCoverage'
import { filterVocabularyByParts, normalizeVocabularyPartSelection, selectAllVocabularyParts } from '../learning/vocabularyParts'
import { recordSpellingMistake, reviewCandidates, weakWordKey } from '../learning/weakWordEngine'
import { createProgress } from '../progress/localProgressRepository'
import { applyModuleAttempt, completedModuleCount, isModuleComplete, isUnitUnlocked } from '../progress/progressionEngine'
import { moduleIds, type ModuleAttempt, type ModuleId } from '../types/game'
import { cityRevealByUnit, toCityRevealStage } from './cityReveal'
import { unit1Vocabulary } from './unit1Vocabulary'
import { unit2Vocabulary, unit2VocabularySources, type Unit2VocabularySourcePart } from './unit2Vocabulary'
import { units } from './units'
import { validateVocabulary } from './vocabularyValidation'

const expectedTargetsByPart: Record<Unit2VocabularySourcePart, string[]> = {
  1: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'how often...?', 'Do you ever...?', 'always', 'often', 'sometimes', 'never', 'talk', 'feed', 'weekend'],
  2: ['listen to music', 'write an email', 'go skating', 'read a comic', 'go shopping', 'watch films', 'listen to a CD', 'watch a DVD', 'must'],
  3: ['helmet', 'elbow pads', 'knee pads', 'goggles', 'gloves', 'be healthy', 'accident', 'warm up', 'muscles', 'bones', 'put on sun cream', 'skin'],
  4: ['turn off the alarm clock', 'suddenly', 'blanket', 'jump out of bed', 'traffic lights', 'have a presentation', 'consequence'],
}

const unit2 = units[1]
const byTarget = (target: string) => unit2Vocabulary.find((word) => word.word === target)!

const attempt = (moduleId: ModuleId, wordId?: string, progressWeakWords = {}): ModuleAttempt => ({
  unitId: 'unit-02', moduleId, wordId, correct: true, weakWords: progressWeakWords, accuracy: 1,
})

function trainUnit2(moduleId: ModuleId, wordIds: string[], progress = createProgress(1)) {
  return wordIds.reduce((current, wordId) => applyModuleAttempt(current, attempt(moduleId, wordId, current.weakWords)), progress)
}

describe('Unit 2 production vocabulary', () => {
  it('contains the canonical 44 unique records in the exact four-Part split', () => {
    expect(unit2Vocabulary).toHaveLength(44)
    expect(unit2).toMatchObject({ id: 'unit-02', title: 'Clockwork City', courseTitle: 'My week' })
    expect(unit2VocabularySources).toEqual({
      1: { title: 'My week. Vocabulary 1' },
      2: { title: 'My week. Vocabulary 2' },
      3: { title: "Days of week. Let's be healthy" },
      4: { title: 'Days of week. Literature' },
    })
    ;([1, 2, 3, 4] as Unit2VocabularySourcePart[]).forEach((part) => {
      const words = unit2Vocabulary.filter((word) => word.sourcePart === part)
      expect(words.map((word) => word.word)).toEqual(expectedTargetsByPart[part])
      expect(words.every((word) => word.sourceTitle === unit2VocabularySources[part].title)).toBe(true)
      expect(words.every((word) => word.sourcePage === undefined)).toBe(true)
    })
    expect([1, 2, 3, 4].map((part) => unit2Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([16, 9, 12, 7])
    expect(new Set(unit2Vocabulary.map((word) => word.id)).size).toBe(44)
    expect(new Set(unit2Vocabulary.map((word) => word.word.toLocaleLowerCase())).size).toBe(44)
    expect(unit2Vocabulary.every((word) => /^u2-/.test(word.id) && word.word.trim() && word.translation?.trim() && word.example?.trim())).toBe(true)
    expect(validateVocabulary(units)).toEqual([])
    expect(units.slice(3).every((unit) => unit.words.length === 0)).toBe(true)
  })

  it('keeps multiword phrases as single stable records and preserves supplied clues', () => {
    const multiwordTargets = ['listen to music', 'write an email', 'put on sun cream', 'turn off the alarm clock', 'jump out of bed', 'have a presentation']
    multiwordTargets.forEach((target) => expect(unit2Vocabulary.filter((word) => word.word === target)).toHaveLength(1))
    expect(byTarget('helmet').example).toBe('We use h___ to protect our head.')
    expect(byTarget('warm up')).toMatchObject({ definition: 'prepare body for exercise', example: 'Before exercising you must w___ u_ your muscles.' })
    expect(byTarget('traffic lights')).toMatchObject({ definition: 'the red, yellow and green lights which control the traffic', example: 'We were driving and all the l___ were red!' })
    expect(byTarget('have a presentation')).toMatchObject({ word: 'have a presentation', definition: 'to protect a project', example: 'You h___ _ p___ at school today.' })
    expect(byTarget('consequence')).toMatchObject({ word: 'consequence', contextForm: 'consequences', acceptedForms: ['consequences'] })
  })

  it('provides three plausible spelling-only variants for every record', () => {
    unit2Vocabulary.forEach((word) => {
      expect(word.typoForms, word.word).toHaveLength(3)
      expect(new Set(word.typoForms).size, word.word).toBe(3)
      word.typoForms?.forEach((variant) => {
        expect(isPlausibleSpellingVariant(word, variant), `${word.word} -> ${variant}`).toBe(true)
        expect(variant.split(' '), `${word.word} -> ${variant}`).toHaveLength(word.word.split(' ').length)
      })
      expect(errorHuntVariants(word).length, word.word).toBeGreaterThanOrEqual(3)
    })
  })

  it('uses safe Repair damage and the canonical answer rules for phrases and punctuation', () => {
    for (const target of ['Do you ever...?', 'listen to music', 'turn off the alarm clock', 'put on sun cream']) {
      const word = byTarget(target)
      const damaged = damageRepairTarget(word.word, 2)
      expect(damaged).not.toBe(word.word)
      expect(damaged.replace(/[A-Za-z_]/g, '')).toBe(word.word.replace(/[A-Za-z]/g, ''))
      expect(repairClueFor(word, 0)).not.toBeNull()
      expect(isAcceptedRepairAnswer(word, word.word.toLocaleUpperCase())).toBe(true)
    }
  })

  it('feeds all 44 records into all five existing game systems', () => {
    for (const moduleId of moduleIds) expect(eligibleWordsForModule(unit2Vocabulary, moduleId), moduleId).toHaveLength(44)

    const strikeLevels = availableWordStrikeLevels(unit2Vocabulary)
    expect(strikeLevels.map((level) => level.id)).toEqual(['spelling', 'audio'])
    strikeLevels.forEach((level, index) => {
      expect(eligibleForStrikeLevel(unit2Vocabulary, level)).toHaveLength(44)
      const round = createWordStrikeRound({ unitId: 'unit-02', level, allWords: unit2Vocabulary, weakWords: {}, reviewIndex: index, recentWordIds: [] })
      expect(round?.targets).toHaveLength(3)
      expect(round?.targets.filter((target) => target.word === round.answer)).toHaveLength(1)
      if (level.id === 'audio') expect(round?.audio).toBe('browser-speech')
    })

    expect(availableFighterKinds(unit2Vocabulary, 4)).toEqual(['quick', 'defense', 'spelling', 'audio', 'meaning', 'combo', 'ultimate'])
    availableFighterKinds(unit2Vocabulary, 4).forEach((kind, index) => {
      const challenge = createFighterChallenge({ unitId: 'unit-02', allWords: unit2Vocabulary, weakWords: {}, reviewIndex: index, recentWordIds: [], energy: 4, challengeIndex: index })
      expect(challenge?.kind).toBe(kind)
      expect(challenge?.word.id).toMatch(/^u2-/)
    })
  })

  it('supports one Part, multiple Parts and All Parts without changing Unit-wide mastery', () => {
    expect(normalizeVocabularyPartSelection(unit2Vocabulary)).toEqual([1])
    expect(filterVocabularyByParts(unit2Vocabulary, [1])).toHaveLength(16)
    expect(filterVocabularyByParts(unit2Vocabulary, [2, 4])).toHaveLength(16)
    expect(selectAllVocabularyParts(unit2Vocabulary)).toEqual([1, 2, 3, 4])
    expect(filterVocabularyByParts(unit2Vocabulary, [1, 2, 3, 4])).toHaveLength(44)

    const afterPart1 = trainUnit2('repair', filterVocabularyByParts(unit2Vocabulary, [1]).map((word) => word.id))
    expect(coverageForModule(unit2, 'repair', afterPart1.units['unit-02'].modules.repair)).toEqual({ trained: 16, total: 44, complete: false })
    expect(completedModuleCount(afterPart1, 'unit-02')).toBe(0)
  })

  it('keeps Weak Words and module coverage isolated by Unit and module', () => {
    const sharedSlug = unit2Vocabulary[0].id
    const weakWords = recordSpellingMistake({}, 'unit-02', sharedSlug, 0, 100)
    expect(weakWords[weakWordKey('unit-02', sharedSlug)]).toBeDefined()
    expect(reviewCandidates(weakWords, 'unit-01', 4)).toEqual([])
    expect(reviewCandidates(weakWords, 'unit-02', 4)).toHaveLength(1)

    const repair = trainUnit2('repair', unit2Vocabulary.slice(0, 5).map((word) => word.id))
    expect(repair.units['unit-02'].modules.repair.trainedWordIds).toHaveLength(5)
    expect(repair.units['unit-02'].modules['audio-code'].trainedWordIds).toEqual([])
    expect(repair.units['unit-01'].modules.repair.trainedWordIds).toEqual([])
    expect(isModuleComplete(repair, 'unit-02', 'repair')).toBe(false)
  })

  it('requires true 44/44 coverage and advances only Clockwork City full-module stages', () => {
    let progress = trainUnit2('repair', unit2Vocabulary.slice(0, 5).map((word) => word.id))
    expect(coverageForModule(unit2, 'repair', progress.units['unit-02'].modules.repair)).toEqual({ trained: 5, total: 44, complete: false })
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-02'))).toBe(0)

    progress = trainUnit2('repair', unit2Vocabulary.slice(5).map((word) => word.id), progress)
    expect(coverageForModule(unit2, 'repair', progress.units['unit-02'].modules.repair)).toEqual({ trained: 44, total: 44, complete: true })
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-02'))).toBe(1)
    expect(completedModuleCount(progress, 'unit-01')).toBe(0)
    expect(cityRevealByUnit['unit-02'].stages[1].name).toBe('Clock mechanism')
  })

  it('makes the three production Units available while preserving sequential access after them', () => {
    const progress = createProgress(1)
    expect(isUnitUnlocked(progress, 0, false)).toBe(true)
    expect(isUnitUnlocked(progress, 1, false)).toBe(true)
    expect(isUnitUnlocked(progress, 2, false)).toBe(true)
    expect(isUnitUnlocked(progress, 3, false)).toBe(false)
  })

  it('renders the real 44-word denominator and both Unit identities', () => {
    const progress = createProgress(1)
    const html = renderToStaticMarkup(<UnitHub
      unit={unit2}
      profile={{ playerId: 'one', name: 'Learner', group: '2B', avatarId: 1, avatarEvolutionStage: 1, createdAt: 1 }}
      progress={progress}
      selectedParts={[1]}
      onPartSelectionChange={vi.fn()}
      highlightReveal={false}
      showCompletion={false}
      onClaimReward={vi.fn()}
      onCompleteFlow={vi.fn()}
      onBack={vi.fn()}
      onOpenModule={vi.fn()}
    />)
    expect(html).toContain('Clockwork City')
    expect(html).toContain('My week')
    expect(html).toContain('0 / 44 words trained')
    expect(html).not.toContain('0 / 50 words trained')
  })
})
