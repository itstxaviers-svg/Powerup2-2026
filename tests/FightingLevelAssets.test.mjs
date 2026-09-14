import { statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fightingLevelEnemyAssetSets, fightingLevelEnemySourceFileNames } from '../src/games/fighting-level/fightingLevelAssets'
import { fightingEnemyActions, fightingEnemyIds } from '../src/games/fighting-level/fightingLevelConfig'

describe('prepared Fighting Level enemy files', () => {
  it('finds all 50 non-empty PNGs and resolves each through Vite', () => {
    let found = 0
    for (const enemyId of fightingEnemyIds) {
      for (const action of fightingEnemyActions) {
        const filename = fightingLevelEnemySourceFileNames[enemyId][action]
        const file = new URL(`../Assets/05-games/code-fighter/opponents/${enemyId}/${filename}`, import.meta.url)
        expect(statSync(file).size).toBeGreaterThan(0)
        expect(fightingLevelEnemyAssetSets[enemyId][action]).toContain(filename)
        found += 1
      }
    }
    expect(found).toBe(50)
  })

  it('maps the two real filesystem naming differences without duplicating files', () => {
    expect(fightingLevelEnemySourceFileNames.bellkeeper['quick-attack']).toBe('bellkeeper-quick-attack.png.png')
    expect(fightingLevelEnemySourceFileNames['crownless-marionette'].base).toBe('crownless-marionette-main.png')
  })
})
