import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { UnitHub } from '../app/App'
import { availableFighterKinds, createFighterChallenge } from '../games/code-fighter/codeFighterEngine'
import { buildFightingTasks, isPictureEligibleForFighting, passesFightingBattle, requiredFightingCorrect } from '../games/fighting-level/fightingLevelEngine'
import { fightingMilestones } from '../games/fighting-level/fightingLevelConfig'
import { fightingPictureClueForWord } from '../games/fighting-level/fightingPictureClueAssets'
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
import { unit4Vocabulary, unit4VocabularySources, type Unit4VocabularySourcePart } from './unit4Vocabulary'
import { units } from './units'
import { validateVocabulary } from './vocabularyValidation'

const expectedTargetsByPart: Record<Unit4VocabularySourcePart, string[]> = {
  1: ['parents', 'aunt', 'uncle', 'cousin', 'granddaughter', 'grandson', 'grandparents', 'grown-up'],
  2: ['basement', 'lift', 'balcony', 'first floor', 'second floor', 'roof', 'upstairs', 'downstairs', 'inside', 'outside', 'stairs'],
  3: ['machines', 'food mixer', 'pencil sharpener', 'stapler', 'dishwasher', 'hairdryer', 'smartphone', 'camera', 'swing', 'bicycle', 'computer', 'vacuum cleaner', 'vacuum', 'washing machine'],
}

const pictureTargets = [
  'basement', 'lift', 'balcony', 'roof', 'stairs',
  'food mixer', 'pencil sharpener', 'stapler', 'dishwasher', 'hairdryer', 'smartphone', 'camera', 'swing', 'bicycle', 'computer', 'vacuum cleaner', 'washing machine',
]

const audioTargets = [
  'parents', 'aunt', 'uncle', 'cousin', 'granddaughter', 'grandson', 'grandparents', 'grown-up',
  'first floor', 'second floor', 'upstairs', 'downstairs', 'inside', 'outside', 'machines', 'vacuum',
]

const unit4 = units[3]
const byTarget = (target: string) => unit4Vocabulary.find((word) => word.word === target)!
const attempt = (moduleId: ModuleId, wordId: string, weakWords = {}): ModuleAttempt => ({
  unitId: 'unit-04', moduleId, wordId, correct: true, weakWords, accuracy: 1,
})
const trainUnit4 = (moduleId: ModuleId, wordIds: string[], progress = createProgress(1)) =>
  wordIds.reduce((current, wordId) => applyModuleAttempt(current, attempt(moduleId, wordId, current.weakWords)), progress)

describe('Unit 4 production vocabulary', () => {
  it('contains exactly 33 supplied entries in three Parts with no source pages', () => {
    expect(unit4).toMatchObject({ id: 'unit-04', title: 'Crystal Library', courseTitle: 'The family at home' })
    expect(unit4VocabularySources).toEqual({
      1: { title: 'The family at home. Vocabulary 1' },
      2: { title: 'The family at home. Place to live' },
      3: { title: 'The family at home. Machines in our home' },
    })
    expect(unit4Vocabulary).toHaveLength(33)
    ;([1, 2, 3] as Unit4VocabularySourcePart[]).forEach((part) => {
      const words = unit4Vocabulary.filter((word) => word.sourcePart === part)
      expect(words.map((word) => word.word)).toEqual(expectedTargetsByPart[part])
      expect(words.every((word) => word.sourceTitle === unit4VocabularySources[part].title)).toBe(true)
      expect(words.every((word) => word.sourcePage === undefined)).toBe(true)
    })
    expect([1, 2, 3].map((part) => unit4Vocabulary.filter((word) => word.sourcePart === part).length)).toEqual([8, 11, 14])
    expect(new Set(unit4Vocabulary.map((word) => word.id)).size).toBe(33)
    expect(validateVocabulary(units)).toEqual([])
  })

  it('preserves canonical British and multiword targets', () => {
    expect(byTarget('lift').word).toBe('lift')
    expect(byTarget('hairdryer').word).toBe('hairdryer')
    expect(byTarget('grown-up').translation).toBe('взрослые')
    expect(byTarget('vacuum cleaner').id).not.toBe(byTarget('vacuum').id)
    for (const target of ['first floor', 'second floor', 'food mixer', 'pencil sharpener', 'vacuum cleaner', 'washing machine']) {
      expect(byTarget(target)).toMatchObject({ word: target, fixedPhrase: true })
    }
    expect(unit4Vocabulary.some((word) => word.word === 'elevator')).toBe(false)
    expect(unit4Vocabulary.some((word) => word.word === 'adult')).toBe(false)
  })

  it('provides A1 clues, spelling-only variants, Repair data and audio for every entry', () => {
    unit4Vocabulary.forEach((word) => {
      expect(word.definition?.length, word.word).toBeGreaterThan(5)
      expect(word.example, word.word).toContain('____')
      expect(word.audio).toBe(`/assets/audio/unit-04/${word.id}.mp3`)
      expect(word.typoForms, word.word).toHaveLength(3)
      word.typoForms?.forEach((variant) => expect(isPlausibleSpellingVariant(word, variant), `${word.word} -> ${variant}`).toBe(true))
      expect(errorHuntVariants(word).length, word.word).toBeGreaterThanOrEqual(3)
      expect(repairClueFor(word, 0)).not.toBeNull()
      expect(damageRepairTarget(word.word, 2)).not.toBe(word.word)
      expect(isAcceptedRepairAnswer(word, word.word.toLocaleUpperCase())).toBe(true)
    })
    expect(byTarget('smartphone').definition).toBe('a phone that can use apps and the internet')
    expect(byTarget('computer').definition).toBe('an electronic device that works with and stores information')
  })

  it('feeds all 33 entries through the existing five-module data schedulers', () => {
    for (const moduleId of moduleIds) expect(eligibleWordsForModule(unit4Vocabulary, moduleId), moduleId).toHaveLength(33)
    const strikeLevels = availableWordStrikeLevels(unit4Vocabulary)
    expect(strikeLevels.map((level) => level.id)).toEqual(['spelling', 'audio'])
    strikeLevels.forEach((level, index) => {
      expect(eligibleForStrikeLevel(unit4Vocabulary, level)).toHaveLength(33)
      const round = createWordStrikeRound({ unitId: 'unit-04', level, allWords: unit4Vocabulary, weakWords: {}, reviewIndex: index, recentWordIds: [] })
      expect(round?.targets).toHaveLength(3)
      expect(round?.targets.filter((target) => target.word === round.answer)).toHaveLength(1)
    })
    expect(availableFighterKinds(unit4Vocabulary, 4)).toEqual(['quick', 'defense', 'spelling', 'audio', 'meaning', 'combo', 'ultimate'])
    const challenge = createFighterChallenge({ unitId: 'unit-04', allWords: unit4Vocabulary, weakWords: {}, reviewIndex: 0, recentWordIds: [], energy: 4 })
    expect(challenge?.word.id).toMatch(/^u4-/)
  })

  it('uses Part selection only as a training filter and keeps 33-word coverage', () => {
    expect(normalizeVocabularyPartSelection(unit4Vocabulary)).toEqual([1])
    expect(selectAllVocabularyParts(unit4Vocabulary)).toEqual([1, 2, 3])
    expect([1, 2, 3].map((part) => filterVocabularyByParts(unit4Vocabulary, [part]).length)).toEqual([8, 11, 14])
    expect(vocabularyPartLabel('unit-04', 2)).toBe('Part 2 · The family at home. Place to live')
    const afterPart1 = trainUnit4('repair', filterVocabularyByParts(unit4Vocabulary, [1]).map((word) => word.id))
    expect(coverageForModule(unit4, 'repair', afterPart1.units['unit-04'].modules.repair)).toEqual({ trained: 8, total: 33, complete: false })
    expect(isModuleComplete(afterPart1, 'unit-04', 'repair')).toBe(false)
    expect(completedModuleCount(afterPart1, 'unit-04')).toBe(0)
  })

  it('requires 33/33 coverage, advances Crystal Library once, and shares Weak Word', () => {
    let progress = trainUnit4('repair', unit4Vocabulary.slice(0, 5).map((word) => word.id))
    expect(coverageForModule(unit4, 'repair', progress.units['unit-04'].modules.repair)).toEqual({ trained: 5, total: 33, complete: false })
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-04'))).toBe(0)
    progress = trainUnit4('repair', unit4Vocabulary.slice(5).map((word) => word.id), progress)
    expect(coverageForModule(unit4, 'repair', progress.units['unit-04'].modules.repair)).toEqual({ trained: 33, total: 33, complete: true })
    expect(toCityRevealStage(completedModuleCount(progress, 'unit-04'))).toBe(1)
    expect(cityRevealByUnit['unit-04'].stages[1].name).toBe('Crystal archive core')

    const weak = recordSpellingMistake({}, 'unit-04', unit4Vocabulary[0].id, 0, 100)
    expect(weak[weakWordKey('unit-04', unit4Vocabulary[0].id)]).toBeDefined()
    expect(reviewCandidates(weak, 'unit-04', 4)).toHaveLength(1)
    expect(reviewCandidates(weak, 'unit-03', 4)).toEqual([])
  })

  it('renders the existing Crystal Library identity and 33-word denominator', () => {
    const html = renderToStaticMarkup(<UnitHub
      unit={unit4}
      profile={{ playerId: 'one', name: 'Learner', group: '2B', avatarId: 1, avatarEvolutionStage: 1, createdAt: 1 }}
      progress={createProgress(1)} selectedParts={[1]} onPartSelectionChange={vi.fn()}
      highlightReveal={false} showCompletion={false} onClaimReward={vi.fn()} onCompleteFlow={vi.fn()}
      onBack={vi.fn()} onOpenModule={vi.fn()}
    />)
    expect(html).toContain('Crystal Library')
    expect(html).toContain('The family at home')
    expect(html).toContain('0 / 33 words trained')
  })
})

describe('Unit 4 checkpoint picture eligibility', () => {
  it('marks the exact 17-picture whitelist and 16 audio-only targets', () => {
    const pictures = unit4Vocabulary.filter((word) => word.pictureEligible).map((word) => word.word)
    const audio = unit4Vocabulary.filter((word) => !word.pictureEligible).map((word) => word.word)
    expect(pictures).toEqual(pictureTargets)
    expect(audio).toEqual(audioTargets)
    expect(pictures).toHaveLength(17)
    expect(audio).toHaveLength(16)
    expect(pictures.length + audio.length).toBe(33)
    pictureTargets.forEach((target) => expect(isPictureEligibleForFighting(byTarget(target)), target).toBe(true))
    audioTargets.forEach((target) => expect(isPictureEligibleForFighting(byTarget(target)), target).toBe(false))
    expect(byTarget('vacuum cleaner').pictureEligible).toBe(true)
    expect(byTarget('vacuum').pictureEligible).toBe(false)
  })

  it('connects every approved Unit 4 picture and keeps audio for the other words', () => {
    pictureTargets.forEach((target) => expect(fightingPictureClueForWord(byTarget(target).id), target).toBeDefined())
    audioTargets.forEach((target) => expect(fightingPictureClueForWord(byTarget(target).id), target).toBeUndefined())
    const records = unit4Vocabulary.map((word) => ({ unitId: 'unit-04', unitNumber: 4, word }))
    const tasks = buildFightingTasks(records, 17)
    expect(tasks).toHaveLength(33)
    expect(tasks.filter((task) => task.mode === 'picture')).toHaveLength(11)
    expect(tasks.filter((task) => task.mode === 'audio')).toHaveLength(22)
    expect(tasks.filter((task) => task.mode === 'picture').every((task) => Boolean(task.pictureSource))).toBe(true)
    expect(tasks.filter((task) => task.mode === 'audio').every((task) => task.audioSource === `/assets/audio/unit-04/${task.wordId}.mp3`)).toBe(true)
    expect(buildFightingTasks(records, 18).map((task) => task.wordId)).not.toEqual(tasks.map((task) => task.wordId))
  })

  it('does not change the post-Unit-7 checkpoint rules', () => {
    expect(fightingMilestones['after-unit-7']).toMatchObject({ endUnit: 7, battleCount: 2, answerTimeMs: 8_000 })
    expect(requiredFightingCorrect(20)).toBe(17)
    expect(passesFightingBattle(17, 20)).toBe(true)
    expect(passesFightingBattle(16, 20)).toBe(false)
  })
})
