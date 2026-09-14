import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { assets } from '../../data/assets'
import { useEnterAction } from '../useEnterAction'
import { MANUAL_INTRO_NEXT_DELAY_MS } from '../intro/manualIntroController'
import { createWordStrikeIntroTimeline, type WordStrikeIntroPhase } from './wordStrikeIntroTimeline'

type IntroBackgroundStyle = CSSProperties & { backgroundImage: string }

export function novaIntroAssetForPhase(phase: WordStrikeIntroPhase) {
  return phase === 'wink' || phase === 'exit' ? assets.specialistNovaIntroWink : assets.specialistNovaIntroIdle
}

export function WordStrikeIntro({ scopeLabel, reducedMotion = false, onStart, onBack }: { scopeLabel: string; reducedMotion?: boolean; onStart: () => void; onBack: () => void }) {
  const [phase, setPhase] = useState<WordStrikeIntroPhase>('enter')
  const [canAdvance, setCanAdvance] = useState(false)
  const timelineRef = useRef<ReturnType<typeof createWordStrikeIntroTimeline> | null>(null)
  const preloadRef = useRef<HTMLImageElement[]>([])

  useEffect(() => {
    preloadRef.current = [assets.specialistNovaIntroIdle, assets.specialistNovaIntroWink].map((source) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = source
      return image
    })
    const timeline = createWordStrikeIntroTimeline({ onPhase: setPhase })
    timelineRef.current = timeline
    timeline.start()
    return () => {
      timeline.dispose()
      if (timelineRef.current === timeline) timelineRef.current = null
      preloadRef.current = []
    }
  }, [])

  useEffect(() => {
    if (phase !== 'greeting' && phase !== 'message' && phase !== 'call') {
      setCanAdvance(false)
      return
    }
    setCanAdvance(false)
    const timer = setTimeout(() => setCanAdvance(true), MANUAL_INTRO_NEXT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const finishIntro = () => timelineRef.current?.finish()
  const advanceIntro = () => timelineRef.current?.advance(phase)
  useEnterAction(phase === 'ready' ? onStart : advanceIntro, phase === 'ready' || canAdvance)

  return <WordStrikeIntroScene phase={phase} scopeLabel={scopeLabel} reducedMotion={reducedMotion} canAdvance={canAdvance} onNext={advanceIntro} onSkip={finishIntro} onStart={onStart} onBack={onBack} />
}

export function WordStrikeIntroScene({ phase, scopeLabel, reducedMotion, canAdvance = false, onNext = () => {}, onSkip, onStart, onBack }: {
  phase: WordStrikeIntroPhase
  scopeLabel: string
  reducedMotion: boolean
  canAdvance?: boolean
  onNext?: () => void
  onSkip: () => void
  onStart: () => void
  onBack: () => void
}) {
  const ready = phase === 'ready'
  const awaitingNext = canAdvance && (phase === 'greeting' || phase === 'message' || phase === 'call')
  const lineCount = phase === 'enter' ? 0 : phase === 'greeting' ? 1 : phase === 'message' ? 2 : 3
  const backgroundStyle: IntroBackgroundStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(5,25,46,.4), rgba(5,25,46,.2)), url(${assets.wordStrikeRange})`,
  }

  return <main className={`word-strike-shell word-strike-intro-shell ${reducedMotion ? 'word-strike-intro-reduced' : ''}`}>
    <header className="strike-topbar nova-intro-topbar">
      <button className="back-button" type="button" onClick={onBack}>← <span>Return to unit</span></button>
      <span className="training-scope-badge">{scopeLabel}</span>
    </header>
    <section className={`nova-intro phase-${phase}`} style={backgroundStyle}>
      <div className="nova-intro-glow" aria-hidden="true" />
      <div className="nova-intro-particles" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
      <section
        className={`nova-intro-stage ${ready ? 'is-ready' : ''}`}
        role="status"
        aria-label={ready ? 'Word Strike is ready' : 'Specialist Nova introduction'}
      >
        {!ready && <figure className="nova-intro-character-frame">
          <img
            className="nova-intro-character"
            src={novaIntroAssetForPhase(phase)}
            alt="Specialist Nova"
            draggable={false}
            loading="eager"
            decoding="async"
            style={{ objectFit: 'contain' }}
          />
        </figure>}
        <div className="nova-intro-dialogue" aria-live="polite">
          {ready ? <div className="nova-intro-ready">
            <span className="nova-intro-ready-mark" aria-hidden="true">✦</span>
            <button className="primary-button nova-intro-start" type="button" onClick={onStart} aria-keyshortcuts="Enter" data-enter-action>Start training</button>
          </div> : <>
            <p className="eyebrow">SPECIALIST NOVA</p>
            <div className="nova-intro-lines">
              {lineCount >= 1 && <p>Word Strike time!</p>}
              {lineCount >= 2 && <p>We’re hunting for the correct word forms.</p>}
              {lineCount >= 3 && <p>Time to shoot!</p>}
            </div>
            <div className="nova-intro-actions">
              <button className="text-button nova-intro-skip" type="button" onClick={onSkip}>Skip intro</button>
              {awaitingNext && <button className="nova-intro-next" type="button" onClick={onNext} aria-keyshortcuts="Enter" data-enter-action>Next <span aria-hidden="true">→</span></button>}
            </div>
          </>}
        </div>
      </section>
    </section>
  </main>
}
