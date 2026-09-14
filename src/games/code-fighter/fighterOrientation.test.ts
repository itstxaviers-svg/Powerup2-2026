import { describe, expect, it } from 'vitest'
import { fighterStates } from './fighterStates'
import { shouldMirrorOpponentFrame } from './fighterOrientation'

describe('Code Fighter frame orientation', () => {
  it('keeps every Kael frame facing left toward the player', () => {
    for (const state of fighterStates) expect(shouldMirrorOpponentFrame('kael', state)).toBe(false)
  })

  it('mirrors only Construct frames whose source art faces away from the player', () => {
    const mirroredStates = new Set(['quickAttack', 'counter', 'ultimate'])
    for (const state of fighterStates) {
      expect(shouldMirrorOpponentFrame('construct', state)).toBe(mirroredStates.has(state))
    }
  })

  it('mirrors every Lady Gearveil state and no Chronofang state', () => {
    for (const state of fighterStates) {
      expect(shouldMirrorOpponentFrame('lady-gearveil', state)).toBe(true)
      expect(shouldMirrorOpponentFrame('chronofang', state)).toBe(false)
    }
  })

  it('keeps both inspected Unit 3 opponent sets naturally left-facing', () => {
    for (const state of fighterStates) {
      expect(shouldMirrorOpponentFrame('roseclock-duchess', state)).toBe(false)
      expect(shouldMirrorOpponentFrame('thornbound-archivist', state)).toBe(false)
    }
  })
})
