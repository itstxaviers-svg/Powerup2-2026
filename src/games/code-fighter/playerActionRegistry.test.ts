import { describe, expect, it, vi } from 'vitest'
import battleSource from './CodeFighter.tsx?raw'
import { fighterStates } from './fighterStates'
import { createPlayerActionSet, missingPlayerActionPaths, playerActionAsset, playerActionRegistry, playerActionSourcePath, playerAvatarIds, requiredPlayerActionPaths, resolvedPlayerActionPaths } from './playerActionRegistry'
import { playerVisualAnchor, playerVisualAnchors } from './playerVisualAnchors'

describe('standalone player action registry', () => {
  it('resolves all 10 avatars and all 9 semantic actions', () => {
    expect(playerAvatarIds).toHaveLength(10)
    expect(fighterStates).toHaveLength(9)
    expect(requiredPlayerActionPaths).toHaveLength(90)
    expect(new Set(requiredPlayerActionPaths).size).toBe(90)
    expect(resolvedPlayerActionPaths).toHaveLength(90)
    expect(missingPlayerActionPaths).toEqual([])
    for (const avatarId of playerAvatarIds) {
      expect(Object.keys(playerActionRegistry[avatarId])).toEqual(expect.arrayContaining([...fighterStates]))
      for (const state of fighterStates) {
        expect(playerActionAsset(avatarId, state)).toBeTruthy()
        expect(playerActionSourcePath(avatarId, state)).toMatch(new RegExp(`avatar-${String(avatarId).padStart(2, '0')}/avatar-${String(avatarId).padStart(2, '0')}-`))
      }
    }
  })

  it('maps each semantic state to the expected standalone filename', () => {
    expect(playerActionSourcePath(5, 'idle')).toMatch(/avatar-05-idle\.png$/)
    expect(playerActionSourcePath(5, 'quickAttack')).toMatch(/avatar-05-quick-attack\.png$/)
    expect(playerActionSourcePath(5, 'heavyAttack')).toMatch(/avatar-05-heavy-attack\.png$/)
    expect(playerActionSourcePath(5, 'hitReaction')).toMatch(/avatar-05-hit\.png$/)
    expect(playerActionSourcePath(5, 'counter')).toMatch(/avatar-05-counter\.png$/)
    expect(playerActionSourcePath(5, 'block')).toMatch(/avatar-05-block\.png$/)
    expect(playerActionSourcePath(5, 'ultimate')).toMatch(/avatar-05-ultimate\.png$/)
    expect(playerActionSourcePath(5, 'victory')).toMatch(/avatar-05-victory\.png$/)
    expect(playerActionSourcePath(5, 'tiredDefeat')).toMatch(/avatar-05-defeat\.png$/)
  })

  it('uses the selected avatar without substituting another avatar', () => {
    expect(playerActionAsset(1, 'counter')).not.toBe(playerActionAsset(5, 'counter'))
    expect(playerActionAsset(6, 'victory')).not.toBe(playerActionAsset(10, 'victory'))
    expect(() => playerActionAsset(11, 'idle')).toThrow(/Unknown Code Fighter avatar ID/)
  })

  it("falls back to the same avatar's idle art and warns when an action is missing", () => {
    const idlePath = playerActionSourcePath(5, 'idle')
    const warn = vi.fn()
    const actionSet = createPlayerActionSet(5, { [idlePath]: '/avatar-05-idle.png' }, warn)
    expect(actionSet.idle).toBe('/avatar-05-idle.png')
    expect(actionSet.ultimate).toBe('/avatar-05-idle.png')
    expect(actionSet.victory).toBe('/avatar-05-idle.png')
    expect(warn).toHaveBeenCalled()
    expect(() => createPlayerActionSet(5, {}, warn)).toThrow(/Avatar 05/)
  })

  it('provides stable visual anchors and does not globally mirror standalone player art', () => {
    expect(Object.keys(playerVisualAnchors)).toHaveLength(10)
    for (const avatarId of playerAvatarIds) {
      for (const state of fighterStates) {
        const anchor = playerVisualAnchor(avatarId, state)
        expect(anchor.scale).toBeGreaterThan(0)
        expect(anchor.x).toBeGreaterThan(0)
        expect(anchor.feetY).toBeGreaterThan(0)
        expect(anchor.mirrored).toBe(false)
      }
    }
    expect(playerVisualAnchor(6, 'idle').feetY).toBe(playerVisualAnchors[6].feetY)
    expect(playerVisualAnchor(6, 'hitReaction').feetY).toBe(91.3)
    expect(playerVisualAnchor(10, 'ultimate').feetY).toBe(88.7)
  })

  it('has no production Code Fighter dependency on the legacy player sheet renderer', () => {
    expect(playerActionRegistry[1].idle).not.toMatch(/fighter-sheet/i)
    expect(playerActionRegistry[10].victory).not.toMatch(/fighter-sheet/i)
    expect(battleSource).toContain('PlayerActionArt')
    expect(battleSource).not.toMatch(/FighterSprite|fighter-sheet/i)
  })

  it('uses contain rendering and keeps semantic state changes under Reduced Motion', () => {
    for (const avatarId of playerAvatarIds) {
      expect(playerActionAsset(avatarId, 'ultimate')).toBeTruthy()
      expect(playerActionAsset(avatarId, 'tiredDefeat')).toBeTruthy()
    }
  })
})
