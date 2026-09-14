import { describe, expect, it } from 'vitest'
import { units as productionUnits } from '../../data/units'
import type { UnitData, UnitWord } from '../../types/game'
import { fightingEnemies, fightingEnemyForBattle, fightingEnemyActions, fightingMilestoneForUnit, fightingMilestones, requiredFightingEnemyAssets, resolveFightingEnemyAsset } from './fightingLevelConfig'
import { buildFightingTasks, createFightingBattleRosters, cumulativeFightingPool, fallbackFightingTaskToAudio, fightingBattleSize, fightingMilestoneDataStatus, markFightingEnemyIntroSeen, passesFightingBattle, prepareFightingLevelProgress, recordFightingBattleResult, requiredFightingCorrect, rosterRecords } from './fightingLevelEngine'

const makeUnits = (count: number, wordsPerUnit = 6): UnitData[] => Array.from({ length: count }, (_, unitIndex) => ({
  id: `unit-${String(unitIndex + 1).padStart(2, '0')}`,
  number: unitIndex + 1,
  title: `Unit ${unitIndex + 1}`,
  words: Array.from({ length: wordsPerUnit }, (_, wordIndex) => ({
    id: `u${unitIndex + 1}-w${wordIndex + 1}`,
    word: `word ${unitIndex + 1} ${wordIndex + 1}`,
    audio: 'browser-speech',
  })),
}))

describe('Fighting Level registries', () => {
  it('maps milestones, battle counts, timers and enemies centrally', () => {
    expect(fightingMilestones['after-unit-3']).toMatchObject({ endUnit: 3, battleCount: 1, answerTimeMs: 10_000 })
    expect(fightingMilestones['after-unit-7']).toMatchObject({ endUnit: 7, battleCount: 2, answerTimeMs: 8_000 })
    expect(fightingMilestones['after-unit-9']).toMatchObject({ endUnit: 9, battleCount: 2, answerTimeMs: 6_000 })
    expect(fightingEnemyForBattle('after-unit-3', 0)?.displayName).toBe('The Inkbound Knight')
    expect(fightingEnemyForBattle('after-unit-7', 0)?.displayName).toBe('Prism Wraith')
    expect(fightingEnemyForBattle('after-unit-7', 1)?.displayName).toBe('The Bellkeeper')
    expect(fightingEnemyForBattle('after-unit-9', 0)?.displayName).toBe('Crownless Marionette')
    expect(fightingEnemyForBattle('after-unit-9', 1)?.displayName).toBe('Corrupted Archivist')
    expect(fightingMilestoneForUnit(3)?.id).toBe('after-unit-3')
    expect(fightingMilestoneForUnit(7)?.id).toBe('after-unit-7')
    expect(fightingMilestoneForUnit(9)?.id).toBe('after-unit-9')
    expect(fightingMilestoneForUnit(2)).toBeUndefined()
  })

  it('connects all five real enemy sets and every semantic action', () => {
    expect(requiredFightingEnemyAssets()).toHaveLength(50)
    for (const enemy of Object.values(fightingEnemies)) {
      expect(enemy.artAvailable).toBe(true)
      expect(enemy.assetRoot).toContain('Assets/05-games/code-fighter/opponents/')
      expect(Object.keys(enemy.actionAssets)).toEqual(fightingEnemyActions)
      expect(Object.values(enemy.actionAssets).every((source) => typeof source === 'string' && source.includes('.png'))).toBe(true)
    }
  })

  it('falls back only to the same enemy idle asset', () => {
    const enemy = fightingEnemies.bellkeeper
    const failed = new Set([enemy.actionAssets['quick-attack']])
    expect(resolveFightingEnemyAsset(enemy, 'quick-attack', failed)).toBe(enemy.actionAssets.idle)
    expect(resolveFightingEnemyAsset(enemy, 'quick-attack', new Set([...failed, enemy.actionAssets.idle]))).toBeUndefined()
    expect(resolveFightingEnemyAsset(enemy, 'quick-attack', failed)).not.toBe(fightingEnemies['prism-wraith'].actionAssets.idle)
  })

  it('keeps the exact three-line intro and CTA mapped to each battle enemy', () => {
    expect(fightingEnemies['inkbound-knight'].intro).toMatchObject({ lines: ['So... you made it this far.', 'Words are easy when you can see them.', 'But can you remember them when I take the letters away?'], startLabel: 'Start battle' })
    expect(fightingEnemies['prism-wraith'].intro.lines[0]).toBe('Seven worlds. So many words.')
    expect(fightingEnemies.bellkeeper.intro.lines[0]).toBe('I heard your victory.')
    expect(fightingEnemies['crownless-marionette'].intro.startLabel).toBe('Start super battle')
    expect(fightingEnemies['corrupted-archivist'].intro.startLabel).toBe('Begin final battle')
    expect(fightingEnemies['corrupted-archivist'].intro.finalAction).toBe('ultimate')
  })
})

describe('Fighting Level cumulative rosters', () => {
  it('uses ceil(N / 3), stable IDs, and the configured cumulative Unit range', () => {
    const units = makeUnits(9)
    expect(fightingBattleSize(19)).toBe(7)
    expect(createFightingBattleRosters(units, 'after-unit-3', 14)).toHaveLength(1)
    expect(createFightingBattleRosters(units, 'after-unit-3', 14)[0]).toHaveLength(6)
    expect(createFightingBattleRosters(units, 'after-unit-7', 14)[0]).toHaveLength(14)
    expect(createFightingBattleRosters(units, 'after-unit-9', 14)[0]).toHaveLength(18)
  })

  it('allocates both two-battle rosters up front with no duplicates or overlap', () => {
    for (const milestoneId of ['after-unit-7', 'after-unit-9'] as const) {
      const rosters = createFightingBattleRosters(makeUnits(9), milestoneId, 77)
      expect(rosters).toHaveLength(2)
      expect(new Set(rosters[0]).size).toBe(rosters[0].length)
      expect(new Set(rosters[1]).size).toBe(rosters[1].length)
      expect(rosters[0].filter((id) => rosters[1].includes(id))).toEqual([])
    }
  })

  it('reports empty future Units without inventing production vocabulary', () => {
    const units = makeUnits(2)
    units.push({ id: 'unit-03', number: 3, title: 'Unit 3', words: [] })
    expect(fightingMilestoneDataStatus(units, 'after-unit-3')).toEqual({ eligibleCount: 12, missingUnitNumbers: [3], productionReady: false })
  })

  it('builds the production Unit 3 milestone from 134 cumulative records and selects 45', () => {
    const pool = cumulativeFightingPool(productionUnits, 'after-unit-3')
    const roster = createFightingBattleRosters(productionUnits, 'after-unit-3', 14)[0]
    const tasks = buildFightingTasks(rosterRecords(productionUnits, 'after-unit-3', roster), 0)
    expect(pool).toHaveLength(134)
    expect(roster).toHaveLength(45)
    expect(new Set(roster).size).toBe(45)
    expect(tasks).toHaveLength(45)
    expect(tasks.some((task) => task.mode === 'picture')).toBe(true)
    expect(tasks.some((task) => task.mode === 'audio')).toBe(true)
  })
})

describe('Fighting Level task and repeat rules', () => {
  it('uses only explicitly eligible real pictures and falls back to shared browser speech', () => {
    const pictureIds = ['u1-field', 'u1-mountain', 'u1-river']
    const records = makeUnits(1, 9)[0].words.map((word, index) => ({
      unitId: 'unit-01',
      unitNumber: 1,
      word: { ...word, id: pictureIds[index] ?? word.id, audio: undefined },
    }))
    const tasks = buildFightingTasks(records, 3)
    expect(tasks.filter((task) => task.mode === 'picture')).toHaveLength(3)
    expect(tasks.filter((task) => task.mode === 'picture').every((task) => task.pictureSource?.includes('.png'))).toBe(true)
    expect(tasks.filter((task) => task.mode === 'audio').every((task) => task.audioSource === 'browser-speech')).toBe(true)
    expect(new Set(tasks.map((task) => task.wordId)).size).toBe(tasks.length)
  })

  it('keeps ambiguous project protection audio-only and converts a failed picture safely', () => {
    const records = [{ unitId: 'unit-02', unitNumber: 2, word: { id: 'u2-protect-a-project', word: 'to protect a project', audio: 'browser-speech' } }]
    expect(buildFightingTasks(records, 3)).toEqual([{ wordId: 'u2-protect-a-project', unitId: 'unit-02', mode: 'audio', audioSource: 'browser-speech' }])
    expect(fallbackFightingTaskToAudio({ wordId: 'u1-field', unitId: 'unit-01', mode: 'picture', pictureSource: '/field.png' }, { id: 'u1-field', word: 'field', audio: '/field.mp3' })).toEqual({ wordId: 'u1-field', unitId: 'unit-01', mode: 'audio', audioSource: '/field.mp3' })
  })

  it('uses only the approved Unit 3 article-bearing duplicate records as pictures', () => {
    const records = [
      { unitId: 'unit-03', unitNumber: 3, word: { id: 'u3-dentist', word: 'dentist', audio: 'browser-speech' } },
      { unitId: 'unit-03', unitNumber: 3, word: { id: 'u3-a-dentist', word: 'a dentist', audio: 'browser-speech', acceptedForms: ['dentist'] } },
      { unitId: 'unit-03', unitNumber: 3, word: { id: 'u3-nurse', word: 'nurse', audio: 'browser-speech' } },
      { unitId: 'unit-03', unitNumber: 3, word: { id: 'u3-a-nurse', word: 'a nurse', audio: 'browser-speech', acceptedForms: ['nurse'] } },
    ]
    const tasks = buildFightingTasks(records, 2)
    expect(tasks.find((task) => task.wordId === 'u3-dentist')?.mode).toBe('audio')
    expect(tasks.find((task) => task.wordId === 'u3-nurse')?.mode).toBe('audio')
    expect(tasks.filter((task) => task.mode === 'picture')).toHaveLength(1)
    expect(['u3-a-dentist', 'u3-a-nurse']).toContain(tasks.find((task) => task.mode === 'picture')?.wordId)
  })

  it('assigns a stable audio-picture sequence for the same roster and seed', () => {
    const ids = ['u1-field', 'u1-mountain', 'u1-river', 'u1-lake', 'u1-forest', 'audio-only']
    const records = ids.map((id) => ({ unitId: 'unit-01', unitNumber: 1, word: { id, word: id, audio: 'browser-speech' } }))
    expect(buildFightingTasks(records, 7)).toEqual(buildFightingTasks(records, 7))
    expect(buildFightingTasks(records, 7).map((task) => task.wordId)).not.toEqual(buildFightingTasks(records, 8).map((task) => task.wordId))
    expect(buildFightingTasks(records, 7).some((task) => task.mode === 'picture')).toBe(true)
    expect(buildFightingTasks(records, 7).some((task) => task.mode === 'audio')).toBe(true)
  })

  it('passes at or above 85%, fails below it, and rounds required answers upward', () => {
    expect(requiredFightingCorrect(20)).toBe(17)
    expect(requiredFightingCorrect(19)).toBe(17)
    expect(passesFightingBattle(17, 20)).toBe(true)
    expect(passesFightingBattle(18, 20)).toBe(true)
    expect(passesFightingBattle(16, 20)).toBe(false)
  })

  it('reuses a failed roster and advances without replaying a passed first battle', () => {
    const units = makeUnits(7)
    const prepared = prepareFightingLevelProgress(undefined, units, 'after-unit-7', 91)
    const introduced = markFightingEnemyIntroSeen(prepared, 'prism-wraith')
    const failed = recordFightingBattleResult(introduced, 5, prepared.battleRosterIds[0].length)
    const repeated = prepareFightingLevelProgress(failed, units, 'after-unit-7', 999)
    expect(repeated.battleRosterIds).toEqual(prepared.battleRosterIds)
    expect(repeated.battleIndex).toBe(0)
    expect(repeated.seenEnemyIntros).toContain('prism-wraith')

    const passed = recordFightingBattleResult(introduced, prepared.battleRosterIds[0].length, prepared.battleRosterIds[0].length)
    expect(passed.passedBattleIndexes).toEqual([0])
    expect(passed.battleIndex).toBe(1)
    expect(passed.seenEnemyIntros).not.toContain('bellkeeper')
    expect(prepareFightingLevelProgress(passed, units, 'after-unit-7', 123).battleIndex).toBe(1)
  })

  it('persists intro-seen state without changing attempts, rosters or completion', () => {
    const prepared = prepareFightingLevelProgress(undefined, makeUnits(3), 'after-unit-3', 5)
    const seen = markFightingEnemyIntroSeen(prepared, 'inkbound-knight')
    expect(seen.seenEnemyIntros).toEqual(['inkbound-knight'])
    expect(markFightingEnemyIntroSeen(seen, 'inkbound-knight')).toBe(seen)
    expect(seen.attemptCount).toBe(0)
    expect(seen.completed).toBe(false)
    expect(seen.battleRosterIds).toEqual(prepared.battleRosterIds)
  })
})
