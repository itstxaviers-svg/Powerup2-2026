export type CityRevealStage = 0 | 1 | 2 | 3 | 4 | 5
export type BuildLayerStage = 1 | 2 | 3 | 4

export type BuildZone = {
  x: number
  y: number
  radiusX: number
  radiusY: number
}

export type BuildLayerConfig = {
  name: string
  zones: BuildZone[]
}

export type WorldCityPlacement = {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  footprint: BuildZone
}

export type CityBuildConfig = {
  foundation: BuildZone[]
  glow: { x: number; y: number }
  map: WorldCityPlacement
  stages: Record<BuildLayerStage, BuildLayerConfig>
}

export type BuildStagePresentation = {
  label: string
  builtLayers: number
  glowOpacity: number
  activityOpacity: number
}

const zone = (x: number, y: number, radiusX: number, radiusY: number): BuildZone => ({ x, y, radiusX, radiusY })

// Canonical world-design rule: the world begins as one largely empty sky map.
// Each Unit city is physically constructed inside it from a foundation plus
// four configured architectural layers; the complete art appears only at 5/5.
export const cityRevealByUnit: Record<string, CityBuildConfig> = {
  'unit-01': {
    foundation: [zone(51, 76, 47, 28), zone(49, 59, 25, 13)], glow: { x: 51, y: 57 },
    map: { x: 16, y: 80, width: 27, height: 32, zIndex: 4, footprint: zone(50, 53, 49, 47) },
    stages: {
      1: { name: 'Landing beacon', zones: [zone(50, 57, 16, 18)] },
      2: { name: 'Sky dock', zones: [zone(27, 49, 24, 25)] },
      3: { name: 'Transport platforms', zones: [zone(74, 48, 25, 27)] },
      4: { name: 'Skyport halls', zones: [zone(51, 31, 43, 31), zone(50, 56, 48, 22)] },
    },
  },
  'unit-02': {
    foundation: [zone(50, 76, 45, 28), zone(50, 57, 25, 14)], glow: { x: 50, y: 58 },
    map: { x: 16, y: 56, width: 26, height: 34, zIndex: 3, footprint: zone(50, 51, 48, 47) },
    stages: {
      1: { name: 'Clock mechanism', zones: [zone(50, 29, 18, 22)] },
      2: { name: 'Lower clockworks', zones: [zone(50, 53, 31, 23)] },
      3: { name: 'Gear bridges', zones: [zone(22, 48, 24, 27), zone(79, 49, 24, 27)] },
      4: { name: 'Clock towers', zones: [zone(50, 27, 44, 31), zone(50, 55, 48, 25)] },
    },
  },
  'unit-03': {
    foundation: [zone(50, 76, 47, 29), zone(50, 57, 27, 15)], glow: { x: 50, y: 55 },
    map: { x: 20, y: 29, width: 25, height: 34, zIndex: 2, footprint: zone(50, 50, 47, 47) },
    stages: {
      1: { name: 'Garden core', zones: [zone(50, 57, 18, 18)] },
      2: { name: 'Greenhouse wing', zones: [zone(27, 44, 27, 27)] },
      3: { name: 'Botanical terraces', zones: [zone(75, 49, 27, 29)] },
      4: { name: 'Garden hall', zones: [zone(51, 27, 39, 30), zone(50, 52, 47, 25)] },
    },
  },
  'unit-04': {
    foundation: [zone(50, 77, 46, 27), zone(50, 60, 27, 14)], glow: { x: 50, y: 59 },
    map: { x: 40, y: 36, width: 27, height: 32, zIndex: 3, footprint: zone(50, 51, 49, 46) },
    stages: {
      1: { name: 'Crystal archive core', zones: [zone(50, 20, 17, 21), zone(50, 54, 14, 15)] },
      2: { name: 'First library hall', zones: [zone(50, 43, 27, 27)] },
      3: { name: 'Archive wings', zones: [zone(25, 43, 25, 30), zone(77, 43, 25, 30)] },
      4: { name: 'Library bridges', zones: [zone(50, 42, 47, 38), zone(50, 64, 49, 20)] },
    },
  },
  'unit-05': {
    foundation: [zone(50, 76, 47, 29), zone(50, 59, 30, 16)], glow: { x: 50, y: 43 },
    map: { x: 49, y: 65, width: 34, height: 39, zIndex: 5, footprint: zone(50, 51, 49, 47) },
    stages: {
      1: { name: 'Light engine', zones: [zone(50, 43, 19, 24)] },
      2: { name: 'Energy machinery', zones: [zone(31, 48, 25, 27)] },
      3: { name: 'Support systems', zones: [zone(71, 48, 25, 27)] },
      4: { name: 'Engine complex', zones: [zone(50, 34, 44, 34), zone(50, 59, 49, 25)] },
    },
  },
  'unit-06': {
    foundation: [zone(50, 79, 49, 26), zone(50, 61, 28, 15)], glow: { x: 50, y: 36 },
    map: { x: 79, y: 79, width: 29, height: 34, zIndex: 4, footprint: zone(50, 50, 49, 47) },
    stages: {
      1: { name: 'Sound crystal', zones: [zone(50, 36, 18, 22)] },
      2: { name: 'Canyon station', zones: [zone(23, 45, 27, 33)] },
      3: { name: 'Acoustic machinery', zones: [zone(78, 47, 27, 34)] },
      4: { name: 'Echo bridges', zones: [zone(50, 39, 48, 34), zone(50, 64, 50, 24)] },
    },
  },
  'unit-07': {
    foundation: [zone(50, 76, 47, 28), zone(50, 57, 29, 15)], glow: { x: 50, y: 55 },
    map: { x: 81, y: 28, width: 27, height: 32, zIndex: 3, footprint: zone(50, 50, 49, 46) },
    stages: {
      1: { name: 'Telescope platform', zones: [zone(78, 48, 22, 26)] },
      2: { name: 'Observatory dome', zones: [zone(50, 25, 25, 26)] },
      3: { name: 'Astronomy stations', zones: [zone(23, 47, 26, 31), zone(67, 50, 22, 25)] },
      4: { name: 'Observatory complex', zones: [zone(50, 36, 47, 37), zone(50, 62, 50, 23)] },
    },
  },
  'unit-08': {
    foundation: [zone(50, 78, 47, 27), zone(50, 62, 30, 15)], glow: { x: 50, y: 58 },
    map: { x: 80, y: 54, width: 25, height: 35, zIndex: 4, footprint: zone(50, 51, 46, 48) },
    stages: {
      1: { name: 'Spire foundation', zones: [zone(50, 65, 23, 20)] },
      2: { name: 'Lower Dreamspire', zones: [zone(50, 51, 24, 24)] },
      3: { name: 'Middle Dreamspire', zones: [zone(50, 33, 23, 27)] },
      4: { name: 'Spire city', zones: [zone(50, 36, 40, 40), zone(26, 59, 24, 25), zone(76, 58, 25, 26)] },
    },
  },
  'unit-09': {
    foundation: [zone(50, 78, 48, 28), zone(50, 61, 30, 15)], glow: { x: 50, y: 62 },
    map: { x: 56, y: 22, width: 36, height: 42, zIndex: 6, footprint: zone(50, 52, 48, 48) },
    stages: {
      1: { name: 'Radiant core', zones: [zone(50, 62, 17, 18)] },
      2: { name: 'Citadel tower', zones: [zone(50, 35, 24, 31)] },
      3: { name: 'Fortress halls', zones: [zone(27, 45, 26, 32), zone(73, 45, 26, 32)] },
      4: { name: 'Outer citadel', zones: [zone(50, 39, 48, 38), zone(50, 65, 50, 23)] },
    },
  },
}

export const worldRouteSegments = [
  'M16 80 C12 72 13 63 16 56',
  'M16 56 C16 44 17 35 20 29',
  'M20 29 C28 27 34 34 40 36',
  'M40 36 C43 47 46 57 49 65',
  'M49 65 C60 71 70 79 79 79',
  'M79 79 C84 65 84 43 81 28',
  'M81 28 C84 37 83 47 80 54',
  'M80 54 C73 39 65 28 56 22',
] as const

export const buildStagePresentation: Record<CityRevealStage, BuildStagePresentation> = {
  0: { label: 'City foundation', builtLayers: 0, glowOpacity: .08, activityOpacity: 0 },
  1: { label: 'First structure', builtLayers: 1, glowOpacity: .28, activityOpacity: .1 },
  2: { label: 'Small settlement', builtLayers: 2, glowOpacity: .4, activityOpacity: .22 },
  3: { label: 'City forming', builtLayers: 3, glowOpacity: .53, activityOpacity: .42 },
  4: { label: 'Almost complete', builtLayers: 4, glowOpacity: .66, activityOpacity: .7 },
  5: { label: 'City restored', builtLayers: 5, glowOpacity: .84, activityOpacity: 1 },
}

export const toCityRevealStage = (completedModules: number): CityRevealStage =>
  Math.max(0, Math.min(5, Math.trunc(completedModules))) as CityRevealStage

export const maskForBuildZones = (zones: BuildZone[]): string => zones.map(({ x, y, radiusX, radiusY }) =>
  `radial-gradient(ellipse ${radiusX}% ${radiusY}% at ${x}% ${y}%, #000 0 68%, rgba(0,0,0,.96) 79%, transparent 100%)`
).join(', ')
