import type { CSSProperties } from 'react'
import { buildStagePresentation, cityRevealByUnit, maskForBuildZones, toCityRevealStage, type BuildLayerStage } from '../../data/cityReveal'

type CityRevealVariant = 'map' | 'hero' | 'progress'
type BuildStyle = CSSProperties & Record<`--city-${string}`, string | number>

const layerStages: BuildLayerStage[] = [1, 2, 3, 4]

const maskedImageStyle = (mask: string): CSSProperties => ({
  maskImage: mask,
  WebkitMaskImage: mask,
})

export function CityReveal({ unitId, completedModules, variant, image, highlight = false }: {
  unitId: string
  completedModules: number
  variant: CityRevealVariant
  image: string
  highlight?: boolean
}) {
  const stage = toCityRevealStage(completedModules)
  const config = cityRevealByUnit[unitId]
  const presentation = buildStagePresentation[stage]
  const isComplete = stage === 5
  const currentLayerStage = stage > 0 && stage < 5 ? stage as BuildLayerStage : null
  const builtZones = layerStages
    .filter((layerStage) => layerStage < stage)
    .flatMap((layerStage) => config.stages[layerStage].zones)
  const imageLoading = variant === 'hero' ? undefined : 'lazy'
  const style: BuildStyle = {
    '--city-glow-x': `${config.glow.x}%`,
    '--city-glow-y': `${config.glow.y}%`,
    '--city-glow-opacity': presentation.glowOpacity,
    '--city-activity-opacity': presentation.activityOpacity,
    '--city-edge-x': `${config.map.footprint.x}%`,
    '--city-edge-y': `${config.map.footprint.y}%`,
    '--city-edge-rx': `${config.map.footprint.radiusX}%`,
    '--city-edge-ry': `${config.map.footprint.radiusY}%`,
  }

  return <div className={`city-reveal city-reveal--${variant} build-stage-${stage} ${highlight ? 'is-building' : ''}`} style={style} data-build-stage={stage} data-build-status={presentation.label} aria-hidden="true">
    <span className="city-build__foundation-grid" />
    {isComplete
      ? <img className="city-build__art city-build__art--complete" src={image} loading={imageLoading} alt="" />
      : <>
        <img className="city-build__art city-build__art--base" src={image} loading={imageLoading} style={maskedImageStyle(maskForBuildZones(config.foundation))} alt="" />
        {builtZones.length > 0 && <img className="city-build__art city-build__art--layer" src={image} loading={imageLoading} style={maskedImageStyle(maskForBuildZones(builtZones))} alt="" />}
        {currentLayerStage && <img
          className="city-build__art city-build__art--layer is-current-layer"
          src={image}
          loading={imageLoading}
          style={maskedImageStyle(maskForBuildZones(config.stages[currentLayerStage].zones))}
          alt=""
        />}
      </>}
    <span className="city-build__light-trace" />
    <span className="city-build__glow" />
    <span className="city-build__activity">✦ · ✦</span>
    {isComplete && <span className="city-build__complete" aria-label="City restored">✓</span>}
  </div>
}
