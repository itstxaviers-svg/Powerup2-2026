import { evolutionTitleFor, type AvatarConfig, type EvolutionStage } from '../../data/avatarEvolution'
import { useEnterAction } from '../../games/useEnterAction'
import { AvatarEvolution } from './AvatarEvolution'

const crystalParticles = ['one', 'two', 'three', 'four', 'five', 'six'] as const

export type EvolutionUnlockPresentation = {
  previousStage: EvolutionStage
  nextStage: EvolutionStage
}

export function EvolutionUnlockOverlay({
  avatar,
  playerName,
  presentation,
  reducedMotion,
  onContinue,
}: {
  avatar: AvatarConfig
  playerName: string
  presentation: EvolutionUnlockPresentation
  reducedMotion: boolean
  onContinue: () => void
}) {
  useEnterAction(onContinue)
  const previousTitle = evolutionTitleFor(presentation.previousStage)
  const nextTitle = evolutionTitleFor(presentation.nextStage)

  return <div
    className={`evolution-transition ${reducedMotion ? 'evolution-transition--reduced' : ''}`}
    role="dialog"
    aria-modal="true"
    aria-labelledby="evolution-unlocked-title"
    data-previous-stage={presentation.previousStage}
    data-next-stage={presentation.nextStage}
    data-reduced-motion={reducedMotion}
  >
    <section className="evolution-transition__card">
      <header className="evolution-transition__heading">
        <p className="eyebrow">Evolution unlocked</p>
        <h1 id="evolution-unlocked-title">{nextTitle}</h1>
        <span>{previousTitle} <b aria-hidden="true">→</b> {nextTitle}</span>
      </header>

      <div className="evolution-transition__stage">
        <span className="evolution-transition__halo" aria-hidden="true" />
        <span className="evolution-transition__ring" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="evolution-transition__energy" aria-hidden="true" />
        <span className="evolution-transition__flash" aria-hidden="true" />
        <span className="evolution-transition__particles" aria-hidden="true">
          {crystalParticles.map((particle) => <i className={`particle-${particle}`} key={particle} />)}
        </span>
        <div className="evolution-transition__avatar evolution-transition__avatar--previous" aria-hidden="true">
          <AvatarEvolution avatar={avatar} stage={presentation.previousStage} label={playerName} loading="eager" />
        </div>
        <div className="evolution-transition__avatar evolution-transition__avatar--next">
          <AvatarEvolution avatar={avatar} stage={presentation.nextStage} label={playerName} loading="eager" />
        </div>
      </div>

      <footer className="evolution-transition__actions">
        <p>{playerName} has reached a new Lightworld evolution.</p>
        <button className="primary-button" type="button" onClick={onContinue} autoFocus aria-keyshortcuts="Enter" data-enter-action>Continue</button>
      </footer>
    </section>
  </div>
}
