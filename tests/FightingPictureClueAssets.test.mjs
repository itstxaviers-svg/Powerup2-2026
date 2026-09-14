import { statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fightingPictureClueAssets, fightingPictureClueWordIds } from '../src/games/fighting-level/fightingPictureClueAssets'

const assetRoot = '../Assets/05-games/code-fighter/POWER_UP_2_FIGHTING_LEVEL_VOCABULARY_CLUES_UNITS_1-2'

describe('Fighting Level vocabulary picture files', () => {
  it('resolves exactly 17 Unit 1, 13 Unit 2, and 13 Unit 3 approved PNGs through Vite', () => {
    const unit1Ids = fightingPictureClueWordIds.filter((id) => id.startsWith('u1-'))
    const unit2Ids = fightingPictureClueWordIds.filter((id) => id.startsWith('u2-'))
    const unit3Ids = fightingPictureClueWordIds.filter((id) => id.startsWith('u3-'))
    expect(unit1Ids).toHaveLength(17)
    expect(unit2Ids).toHaveLength(13)
    expect(unit3Ids).toHaveLength(13)
    expect(fightingPictureClueWordIds).toHaveLength(43)
    expect(new Set(fightingPictureClueWordIds).size).toBe(43)

    for (const id of fightingPictureClueWordIds) {
      const unit = id.startsWith('u1-') ? 'unit-01' : id.startsWith('u2-') ? 'unit-02' : 'unit-03'
      const filename = `${id}.png`
      expect(statSync(new URL(`${assetRoot}/${unit}/${filename}`, import.meta.url)).size).toBeGreaterThan(0)
      expect(fightingPictureClueAssets[id]).toContain(filename)
    }
  })

  it('keeps the ambiguous project-protection phrase out of the registry', () => {
    expect(fightingPictureClueAssets['u2-protect-a-project']).toBeUndefined()
  })

  it('keeps every excluded Unit 3 record audio-only, including duplicate concepts', () => {
    const excludedIds = [
      'u3-dentist', 'u3-nurse', 'u3-surprise', 'u3-invite', 'u3-only', 'u3-call',
      'u3-blonde', 'u3-curly', 'u3-fair', 'u3-fat', 'u3-short', 'u3-straight', 'u3-tall', 'u3-thin',
      'u3-fire-station', 'u3-bus-station', 'u3-school', 'u3-hospital', 'u3-plants', 'u3-restaurant',
      'u3-costume-party', 'u3-as-a', 'u3-idea', 'u3-wear', 'u3-come-in', 'u3-good-at', 'u3-meet',
    ]
    expect(excludedIds.every((id) => fightingPictureClueAssets[id] === undefined)).toBe(true)
    expect(fightingPictureClueAssets['u3-a-dentist']).toContain('u3-a-dentist.png')
    expect(fightingPictureClueAssets['u3-a-nurse']).toContain('u3-a-nurse.png')
  })
})
