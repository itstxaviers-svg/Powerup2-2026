import { describe, expect, it } from 'vitest'
import { buildStagePresentation, cityRevealByUnit, maskForBuildZones, toCityRevealStage, worldRouteSegments } from './cityReveal'

describe('city build configuration', () => {
  it('covers every production Unit with four configured construction layers', () => {
    expect(Object.keys(cityRevealByUnit)).toEqual(Array.from({ length: 9 }, (_, index) => `unit-${String(index + 1).padStart(2, '0')}`))
    Object.values(cityRevealByUnit).forEach((config) => {
      expect(config.foundation.length).toBeGreaterThan(0)
      expect(Object.keys(config.stages)).toEqual(['1', '2', '3', '4'])
      expect(Object.values(config.stages).every((layer) => layer.name.length > 0 && layer.zones.length > 0)).toBe(true)
    })
  })

  it('adds a construction layer at every stage and finishes with the full city', () => {
    const stages = [0, 1, 2, 3, 4, 5] as const
    expect(stages.map((stage) => buildStagePresentation[stage].builtLayers)).toEqual([0, 1, 2, 3, 4, 5])
    expect(buildStagePresentation[0].label).toBe('City foundation')
    expect(buildStagePresentation[5].label).toBe('City restored')
  })

  it('generates composable masks from the flattened artwork regions', () => {
    const config = cityRevealByUnit['unit-01']
    expect(maskForBuildZones(config.foundation)).toContain('radial-gradient')
    expect(maskForBuildZones(config.stages[4].zones).split('radial-gradient').length - 1).toBe(config.stages[4].zones.length)
  })

  it('places all nine cities organically on one S-shaped world route', () => {
    expect(Object.values(cityRevealByUnit).map(({ map }) => [map.x, map.y, map.width, map.height])).toEqual([
      [16, 80, 27, 32], [16, 56, 26, 34], [20, 29, 25, 34],
      [40, 36, 27, 32], [49, 65, 34, 39], [79, 79, 29, 34],
      [81, 28, 27, 32], [80, 54, 25, 35], [56, 22, 36, 42],
    ])
    expect(worldRouteSegments).toHaveLength(8)
    expect(cityRevealByUnit['unit-09'].map.zIndex).toBeGreaterThan(cityRevealByUnit['unit-05'].map.zIndex)
    expect(Object.values(cityRevealByUnit).every(({ map }) => map.footprint.radiusX >= 46 && map.footprint.radiusY >= 46)).toBe(true)
  })

  it('derives a safe visual stage without storing duplicate progress', () => {
    expect(toCityRevealStage(-1)).toBe(0)
    expect(toCityRevealStage(3.9)).toBe(3)
    expect(toCityRevealStage(9)).toBe(5)
  })
})
