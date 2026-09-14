import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useEnterAction } from '../useEnterAction'
import { createManualIntroController, type ManualIntroState } from './manualIntroController'
import { resolveTrainingIntroAsset, type TrainingIntroConfig } from './trainingIntroConfig'

type IntroBackgroundStyle = CSSProperties & { backgroundImage: string }

export function ManualGameIntro({ config, scopeLabel, reducedMotion = false, onStart, onBack }: {
  config: TrainingIntroConfig
  scopeLabel: string
  reducedMotion?: boolean
  onStart: () => void
  onBack: () => void
}) {
  const [intro, setIntro] = useState<ManualIntroState>({ phase: 'enter', stepIndex: 0, canAdvance: false })
  const [failedAssets, setFailedAssets] = useState<Set<string>>(() => new Set())
  const controllerRef = useRef<ReturnType<typeof createManualIntroController> | null>(null)
  const preloadRef = useRef<HTMLImageElement[]>([])

  const markAssetFailed = (source: string) => {
    setFailedAssets((current) => {
      if (current.has(source)) return current
      if (import.meta.env.DEV) console.warn(`[intro] Could not load ${config.characterName} asset: ${source}`)
      return new Set([...current, source])
    })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    const sources = Object.values(config.assets).filter((source): source is string => Boolean(source))
    preloadRef.current = [...new Set(sources)].map((source) => {
      const image = new Image()
      image.decoding = 'async'
      image.onerror = () => markAssetFailed(source)
      image.src = source
      return image
    })
    const controller = createManualIntroController({ stepCount: config.steps.length, onState: setIntro })
    controllerRef.current = controller
    controller.start()
    return () => {
      controller.dispose()
      if (controllerRef.current === controller) controllerRef.current = null
      preloadRef.current.forEach((image) => { image.onerror = null })
      preloadRef.current = []
    }
  }, [config])

  const advance = () => controllerRef.current?.advance(intro.stepIndex)
  const skip = () => controllerRef.current?.finish()
  useEnterAction(intro.phase === 'ready' ? onStart : advance, intro.phase === 'ready' || intro.canAdvance)

  return <ManualGameIntroScene config={config} scopeLabel={scopeLabel} reducedMotion={reducedMotion} intro={intro} failedAssets={failedAssets} onNext={advance} onSkip={skip} onStart={onStart} onBack={onBack} onAssetError={markAssetFailed} />
}

export function ManualGameIntroScene({ config, scopeLabel, reducedMotion, intro, failedAssets = new Set(), onNext, onSkip, onStart, onBack, onAssetError = () => {} }: {
  config: TrainingIntroConfig
  scopeLabel: string
  reducedMotion: boolean
  intro: ManualIntroState
  failedAssets?: ReadonlySet<string>
  onNext: () => void
  onSkip: () => void
  onStart: () => void
  onBack: () => void
  onAssetError?: (source: string) => void
}) {
  const ready = intro.phase === 'ready'
  const state = ready ? config.finalState : intro.phase === 'enter' ? 'greeting' : config.steps[intro.stepIndex].characterState
  const characterAsset = resolveTrainingIntroAsset(config, state, failedAssets)
  const backgroundStyle: IntroBackgroundStyle = { backgroundImage: `linear-gradient(90deg, rgba(5,25,46,.4), rgba(5,25,46,.2)), url(${config.background})` }
  const visibleSteps = intro.phase === 'dialogue' ? config.steps.slice(0, intro.stepIndex + 1) : []

  return <main className={`training-shell word-strike-intro-shell manual-intro-shell manual-intro-${config.id} ${reducedMotion ? 'word-strike-intro-reduced' : ''}`}>
    <header className="training-topbar nova-intro-topbar">
      <button className="back-button" type="button" onClick={onBack}>← <span>Return to unit</span></button>
      <div className="manual-intro-title"><strong>{config.title}</strong><span className="training-scope-badge">{scopeLabel}</span></div>
    </header>
    <section className={`nova-intro manual-intro phase-${intro.phase} state-${state.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`} style={backgroundStyle}>
      <div className="nova-intro-glow" aria-hidden="true" />
      <div className="nova-intro-particles" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
      <section className={`nova-intro-stage manual-intro-stage ${ready ? 'is-ready has-ready-character' : ''}`} role="status" aria-label={ready ? `${config.title} is ready` : `${config.characterName} introduction`}>
        <figure className="nova-intro-character-frame manual-intro-character-frame">
          {characterAsset && <img className={`nova-intro-character manual-intro-character ${config.characterClassName}`} src={characterAsset} alt={config.characterName} draggable={false} loading="eager" decoding="async" style={{ objectFit: 'contain' }} onError={() => onAssetError(characterAsset)} />}
        </figure>
        <div className="nova-intro-dialogue">
          <p className="eyebrow">{config.characterName}</p>
          {ready ? <div className="nova-intro-ready manual-intro-ready"><button className="primary-button nova-intro-start" type="button" onClick={onStart} aria-keyshortcuts="Enter" data-enter-action>Start training</button></div> : <>
            <div className="nova-intro-lines">{visibleSteps.map((step, index) => <p key={index}>{step.text}</p>)}</div>
            <div className="nova-intro-actions">
              <button className="text-button nova-intro-skip" type="button" onClick={onSkip}>Skip intro</button>
              {intro.canAdvance && <button className="nova-intro-next" type="button" onClick={onNext} aria-keyshortcuts="Enter" data-enter-action>Next <span aria-hidden="true">→</span></button>}
            </div>
          </>}
        </div>
      </section>
    </section>
  </main>
}
