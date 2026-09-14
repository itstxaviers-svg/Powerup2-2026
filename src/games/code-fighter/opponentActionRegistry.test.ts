import { describe, expect, it, vi } from 'vitest'
import type { FighterState } from './fighterStates'
import { opponentActionAsset, opponentActionRegistry, opponentFallbackAsset, opponentPresentationRegistry, opponentRuntimeAssets, opponentVictoryResultAsset, resolveOpponentActionAsset } from './opponentActionRegistry'

const normalStates: FighterState[] = ['idle', 'quickAttack', 'heavyAttack', 'block', 'counter', 'hitReaction', 'ultimate', 'victory', 'tiredDefeat']

describe('standalone opponent action registry', () => {
  it('provides every arena state for both opponents', () => {
    for (const id of ['kael', 'construct', 'lady-gearveil', 'chronofang', 'roseclock-duchess', 'thornbound-archivist'] as const) {
      for (const state of normalStates) expect(opponentActionAsset(id, state)).toBeTruthy()
      expect(opponentActionRegistry[id].tiredDefeat).not.toBe(opponentActionRegistry[id].victory)
    }
  })

  it('maps named opponent artwork to the matching combat and result states', () => {
    for (const id of ['kael', 'construct', 'lady-gearveil', 'chronofang', 'roseclock-duchess', 'thornbound-archivist'] as const) {
      expect(opponentActionAsset(id, 'ultimate')).toBe(opponentActionAsset(id, 'heavyAttack'))
      expect(opponentVictoryResultAsset(id)).toMatch(/ultimate/i)
      expect(opponentVictoryResultAsset(id)).not.toBe(opponentActionAsset(id, 'victory'))
      expect(opponentVictoryResultAsset(id)).not.toBe(opponentActionAsset(id, 'ultimate'))
    }
  })

  it('registers every prepared Unit 3 action and preserves centralized orientation', () => {
    for (const id of ['roseclock-duchess', 'thornbound-archivist'] as const) {
      expect(opponentPresentationRegistry[id].base).toMatch(/base/i)
      expect(opponentPresentationRegistry[id].mirrorX).toBe(false)
      expect(opponentRuntimeAssets(id)).toHaveLength(9)
      expect(opponentVictoryResultAsset(id)).toMatch(/ultimate/i)
      expect(opponentFallbackAsset(id)).toMatch(/idle/i)
    }
  })

  it('keeps Unit 2 base art, presentation metadata and all prepared runtime actions centralized', () => {
    expect(opponentPresentationRegistry['lady-gearveil'].base).toMatch(/gearveil-base/i)
    expect(opponentPresentationRegistry.chronofang.base).toMatch(/chronofang-base/i)
    expect(opponentPresentationRegistry['lady-gearveil'].mirrorX).toBe(true)
    expect(opponentPresentationRegistry.chronofang.mirrorX).toBe(false)
    expect(opponentRuntimeAssets('lady-gearveil')).toHaveLength(9)
    expect(opponentRuntimeAssets('chronofang')).toHaveLength(9)
    expect(opponentVictoryResultAsset('lady-gearveil')).toMatch(/gearveil-ultimate/i)
    expect(opponentVictoryResultAsset('chronofang')).toMatch(/chronofang-ultimate/i)
  })

  it('falls back to the same opponent idle art and emits a development warning', () => {
    const warn = vi.fn()
    expect(resolveOpponentActionAsset({ idle: 'gearveil-idle.png' }, 'block', warn)).toBe('gearveil-idle.png')
    expect(warn).toHaveBeenCalledOnce()
    expect(opponentFallbackAsset('lady-gearveil')).toMatch(/gearveil-idle/i)
    expect(opponentFallbackAsset('chronofang')).toMatch(/chronofang-idle/i)
  })
})
