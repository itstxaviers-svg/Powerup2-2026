import { useEffect, useState, type ReactNode } from 'react'
import { StudentAccess } from '../auth/StudentAccess'
import { clearCloudSession, getCloudSession } from '../cloud/cloudSession'
import { installCloudSync, queueAttempt } from '../cloud/syncQueue'
import { MainNav, AccountView, ProgressView, RewardsView, SettingsView, type MainSection } from './ProgressScreens'
import { EvolutionRank } from '../components/avatars/AvatarEvolution'
import { EvolutionUnlockOverlay } from '../components/avatars/EvolutionUnlockOverlay'
import { UnitCompletionFlow } from '../components/rewards/RewardChest'
import { CityReveal } from '../components/world/CityReveal'
import { VocabularyPartSelector } from '../components/vocabulary/VocabularyPartSelector'
import { assets } from '../data/assets'
import { cityRevealByUnit, worldRouteSegments } from '../data/cityReveal'
import { wordsForUnit } from '../data/content'
import { rewardsForUnit } from '../data/rewards'
import { units } from '../data/units'
import { TrainingModule } from '../games/training/TrainingModule'
import { WordStrike } from '../games/word-strike/WordStrike'
import { CodeFighter } from '../games/code-fighter/CodeFighter'
import { FightingLevel, FightingMilestoneCard } from '../games/fighting-level/FightingLevel'
import { fightingMilestoneForUnit, fightingMilestones } from '../games/fighting-level/fightingLevelConfig'
import { fightingMilestoneDataStatus, fightingSeed, prepareFightingLevelProgress } from '../games/fighting-level/fightingLevelEngine'
import { CURRENT_SCHEMA_VERSION, createProfile, createProgress, defaultSettings, localProgressRepository } from '../progress/localProgressRepository'
import { acknowledgeEvolutionUnlock, pendingEvolutionUnlock } from '../progress/evolutionUnlock'
import { applyModuleAttempt, chestTierForUnit, claimUnitReward, completedModuleCount, completedUnitCount, isModuleComplete, isUnitComplete, isUnitUnlocked } from '../progress/progressionEngine'
import { filterVocabularyByParts, normalizeVocabularyPartSelection, vocabularyScopeLabel, withVocabularyPartSelection } from '../learning/vocabularyParts'
import { coverageForModule } from '../learning/moduleCoverage'
import type { FightingLevelProgress, FightingMilestoneId, ModuleAttempt, ModuleId, PlayerProfile, PlayerProgress, SavedGame, TrainingModuleId, UnitData, VocabularySourcePart } from '../types/game'

type Screen = { name: MainSection } | { name: 'unit'; unitId: string } | { name: 'training'; unitId: string; moduleId: TrainingModuleId } | { name: 'word-strike'; unitId: string } | { name: 'code-fighter'; unitId: string } | { name: 'fighting-level'; milestoneId: FightingMilestoneId }

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const createDemoGame = (): SavedGame => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  profile: createProfile('Demo Explorer', 'Preview', 1),
  progress: createProgress(1),
  settings: defaultSettings,
})

const modules: Array<{ id: ModuleId; title: string; description: string }> = [
  { id: 'repair', title: 'Repair', description: 'Restore damaged word machines.' },
  { id: 'error-hunt', title: 'Error Hunt', description: 'Detect and correct spelling errors.' },
  { id: 'audio-code', title: 'Audio Code', description: 'Decode words by listening.' },
  { id: 'word-strike', title: 'Word Strike', description: 'Take aim at the right word.' },
  { id: 'code-fighter', title: 'Code Fighter', description: 'Power a magical training duel.' },
]

const moduleIconAssets: Record<ModuleId, string> = {
  repair: assets.repairMachine,
  'error-hunt': assets.errorHuntAnalyzer,
  'audio-code': assets.audioDevice,
  'word-strike': assets.wordStrikeCannon,
  'code-fighter': assets.codeFighterCard,
}

export function App() {
  const [game, setGame] = useState<SavedGame | null>(() => localProgressRepository.load() ?? (demoMode ? createDemoGame() : null))
  const [studentAccessReady, setStudentAccessReady] = useState(() => import.meta.env.VITE_REQUIRE_LOGIN !== 'true' || Boolean(getCloudSession('student')))
  const [screen, setScreen] = useState<Screen>({ name: 'world' })
  const [completionFlowUnitId, setCompletionFlowUnitId] = useState<string | null>(null)
  const [revealingUnitId, setRevealingUnitId] = useState<string | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('user-reduced-motion', Boolean(game?.settings.reducedMotion))
    root.dataset.sfx = game?.settings.sfxEnabled === false ? 'off' : 'on'
    root.dataset.music = game?.settings.musicEnabled === false ? 'off' : 'on'
  }, [game?.settings])

  useEffect(() => installCloudSync(), [])

  useEffect(() => {
    if (!revealingUnitId) return
    const visibleOnWorld = screen.name === 'world'
    const visibleOnUnit = screen.name === 'unit' && screen.unitId === revealingUnitId && completionFlowUnitId !== revealingUnitId
    if (!visibleOnWorld && !visibleOnUnit) return
    const timer = window.setTimeout(() => setRevealingUnitId(null), 1500)
    return () => window.clearTimeout(timer)
  }, [completionFlowUnitId, revealingUnitId, screen])

  const enterAdventure = (nextGame: SavedGame) => {
    localProgressRepository.save(nextGame)
    setGame(nextGame)
    setStudentAccessReady(true)
    setScreen({ name: 'world' })
  }

  const saveModuleAttempt = (attempt: ModuleAttempt) => {
    void queueAttempt(attempt)
    setGame((current) => {
      if (!current) return current
      const wasCompleted = isUnitComplete(current.progress, attempt.unitId)
      const moduleWasCompleted = isModuleComplete(current.progress, attempt.unitId, attempt.moduleId)
      const progress = applyModuleAttempt(current.progress, attempt)
      if (isModuleComplete(progress, attempt.unitId, attempt.moduleId) && !moduleWasCompleted) setRevealingUnitId(attempt.unitId)
      if (!wasCompleted && isUnitComplete(progress, attempt.unitId)) setCompletionFlowUnitId(attempt.unitId)
      const nextGame = { ...current, profile: { ...current.profile, avatarEvolutionStage: progress.avatarEvolutionStage }, progress }
      localProgressRepository.save(nextGame)
      return nextGame
    })
  }

  const markWordStrikeTutorialSeen = () => {
    setGame((current) => {
      if (!current || current.progress.wordStrikeTutorialSeen) return current
      const nextGame = { ...current, progress: { ...current.progress, wordStrikeTutorialSeen: true } }
      localProgressRepository.save(nextGame)
      return nextGame
    })
  }

  const claimReward = (unitId: string) => {
    setGame((current) => {
      if (!current) return current
      const progress = claimUnitReward(current.progress, unitId)
      const nextGame = { ...current, progress }
      localProgressRepository.save(nextGame)
      return nextGame
    })
  }

  const navigate = (name: MainSection) => setScreen({ name })

  const changeSettings = (settings: SavedGame['settings']) => {
    setGame((current) => {
      if (!current) return current
      const next = { ...current, settings }
      localProgressRepository.save(next)
      return next
    })
  }

  const resetProgress = () => {
    setGame((current) => {
      if (!current) return current
      const progress = createProgress(current.profile.avatarId)
      const next = { ...current, profile: { ...current.profile, avatarEvolutionStage: 1 as const }, progress }
      localProgressRepository.save(next)
      return next
    })
    setCompletionFlowUnitId(null)
    setRevealingUnitId(null)
    setScreen({ name: 'world' })
  }

  const resetProfile = () => {
    clearCloudSession()
    localProgressRepository.clear()
    setGame(null)
    setStudentAccessReady(import.meta.env.VITE_REQUIRE_LOGIN !== 'true')
    setCompletionFlowUnitId(null)
    setRevealingUnitId(null)
    setScreen({ name: 'world' })
  }

  const celebrateWorld = () => {
    setGame((current) => {
      if (!current || current.progress.worldCompletionCelebrated) return current
      const next = { ...current, progress: { ...current.progress, worldCompletionCelebrated: true } }
      localProgressRepository.save(next)
      return next
    })
  }

  const acknowledgePendingEvolution = () => {
    setGame((current) => {
      if (!current) return current
      const pending = pendingEvolutionUnlock(current.progress)
      if (!pending) return current
      const next = { ...current, progress: acknowledgeEvolutionUnlock(current.progress, pending.nextStage) }
      localProgressRepository.save(next)
      return next
    })
  }

  if (!game || !studentAccessReady) return <StudentAccess onReady={enterAdventure} />

  const pendingEvolution = pendingEvolutionUnlock(game.progress)
  const evolutionOverlay = pendingEvolution && <EvolutionUnlockOverlay
    avatar={assets.avatars[game.profile.avatarId - 1]}
    playerName={game.profile.name}
    presentation={pendingEvolution}
    reducedMotion={game.settings.reducedMotion}
    onContinue={acknowledgePendingEvolution}
  />
  const present = (content: ReactNode) => <>{content}{evolutionOverlay}</>
  const vocabularyContext = (unit: UnitData) => {
    const words = wordsForUnit(unit)
    const selectedParts = normalizeVocabularyPartSelection(words, game.progress.vocabularyPartSelections?.[unit.id])
    return { words, selectedParts, activeWords: filterVocabularyByParts(words, selectedParts), scopeLabel: vocabularyScopeLabel(words, selectedParts) }
  }
  const saveVocabularyPartSelection = (unit: UnitData, selectedParts: VocabularySourcePart[]) => {
    setGame((current) => {
      if (!current) return current
      const progress = withVocabularyPartSelection(current.progress, unit.id, wordsForUnit(unit), selectedParts)
      const nextGame = { ...current, progress }
      localProgressRepository.save(nextGame)
      return nextGame
    })
  }

  const openFightingLevel = (milestoneId: FightingMilestoneId) => {
    const config = fightingMilestones[milestoneId]
    const milestoneUnit = units.find((unit) => unit.number === config.endUnit)
    if (!milestoneUnit || (!demoMode && (!isUnitComplete(game.progress, milestoneUnit.id) || !fightingMilestoneDataStatus(units, milestoneId).productionReady))) return
    const prepared = prepareFightingLevelProgress(game.progress.fightingLevels[milestoneId], units, milestoneId, fightingSeed(`${game.profile.playerId}:${milestoneId}`))
    const nextGame = { ...game, progress: { ...game.progress, fightingLevels: { ...game.progress.fightingLevels, [milestoneId]: prepared } } }
    localProgressRepository.save(nextGame)
    setGame(nextGame)
    setScreen({ name: 'fighting-level', milestoneId })
  }

  const saveFightingLevelProgress = (milestoneProgress: FightingLevelProgress) => {
    setGame((current) => {
      if (!current) return current
      const next = { ...current, progress: { ...current.progress, fightingLevels: { ...current.progress.fightingLevels, [milestoneProgress.milestoneId]: milestoneProgress } } }
      localProgressRepository.save(next)
      return next
    })
  }

  if (screen.name === 'progress') return present(<ProgressView profile={game.profile} progress={game.progress} onNavigate={navigate} />)
  if (screen.name === 'rewards') return present(<RewardsView progress={game.progress} onNavigate={navigate} />)
  if (screen.name === 'account') return present(<AccountView profile={game.profile} progress={game.progress} onNavigate={navigate} />)
  if (screen.name === 'settings') return present(<SettingsView settings={game.settings} onChange={changeSettings} onResetProgress={resetProgress} onResetProfile={resetProfile} onNavigate={navigate} />)

  if (screen.name === 'unit') {
    const unit = units.find((candidate) => candidate.id === screen.unitId)
    if (unit) {
      const vocabulary = vocabularyContext(unit)
      const showCompletion = unit.id === completionFlowUnitId || (isUnitComplete(game.progress, unit.id) && !game.progress.units[unit.id].rewardClaimed)
      return present(<UnitHub unit={unit} profile={game.profile} progress={game.progress} selectedParts={vocabulary.selectedParts} onPartSelectionChange={(parts) => saveVocabularyPartSelection(unit, parts)} highlightReveal={revealingUnitId === unit.id} showCompletion={showCompletion} onClaimReward={() => claimReward(unit.id)} onCompleteFlow={() => { setCompletionFlowUnitId(null); setScreen({ name: 'world' }) }} onBack={() => setScreen({ name: 'world' })} onOpenFightingLevel={openFightingLevel} onOpenModule={(moduleId) => {
        if (moduleId === 'word-strike') setScreen({ name: 'word-strike', unitId: unit.id })
        else if (moduleId === 'code-fighter') setScreen({ name: 'code-fighter', unitId: unit.id })
        else setScreen({ name: 'training', unitId: unit.id, moduleId })
      }} />)
    }
  }

  if (screen.name === 'training') {
    const unit = units.find((candidate) => candidate.id === screen.unitId)
    if (unit) {
      const vocabulary = vocabularyContext(unit)
      return present(<TrainingModule key={`${unit.id}-${screen.moduleId}`} unit={unit} words={vocabulary.activeWords} scopeLabel={vocabulary.scopeLabel} moduleId={screen.moduleId} initialWeakWords={game.progress.weakWords} initialReviewClock={game.progress.reviewClock} initialTrainedWordIds={game.progress.units[unit.id].modules[screen.moduleId].trainedWordIds} initialVariantStateByWordId={game.progress.units[unit.id].modules[screen.moduleId].variantStateByWordId} reducedMotion={game.settings.reducedMotion} onAttempt={saveModuleAttempt} onBack={() => setScreen({ name: 'unit', unitId: unit.id })} />)
    }
  }

  if (screen.name === 'word-strike') {
    const unit = units.find((candidate) => candidate.id === screen.unitId)
    if (unit) {
      const vocabulary = vocabularyContext(unit)
      return present(<WordStrike unit={unit} words={vocabulary.activeWords} scopeLabel={vocabulary.scopeLabel} initialWeakWords={game.progress.weakWords} initialReviewClock={game.progress.reviewClock} initialTrainedWordIds={game.progress.units[unit.id].modules['word-strike'].trainedWordIds} initialVariantStateByWordId={game.progress.units[unit.id].modules['word-strike'].variantStateByWordId} tutorialSeen={game.progress.wordStrikeTutorialSeen} reducedMotion={game.settings.reducedMotion} onTutorialSeen={markWordStrikeTutorialSeen} onAttempt={saveModuleAttempt} onBack={() => setScreen({ name: 'unit', unitId: unit.id })} />)
    }
  }

  if (screen.name === 'code-fighter') {
    const unit = units.find((candidate) => candidate.id === screen.unitId)
    if (unit) {
      const vocabulary = vocabularyContext(unit)
      return present(<CodeFighter unit={unit} words={vocabulary.activeWords} scopeLabel={vocabulary.scopeLabel} avatarId={game.profile.avatarId} playerName={game.profile.name} initialWeakWords={game.progress.weakWords} initialReviewClock={game.progress.reviewClock} initialTrainedWordIds={game.progress.units[unit.id].modules['code-fighter'].trainedWordIds} initialVariantStateByWordId={game.progress.units[unit.id].modules['code-fighter'].variantStateByWordId} reducedMotion={game.settings.reducedMotion} onAttempt={saveModuleAttempt} onBack={() => setScreen({ name: 'unit', unitId: unit.id })} />)
    }
  }

  if (screen.name === 'fighting-level') {
    const config = fightingMilestones[screen.milestoneId]
    const unitId = `unit-${String(config.endUnit).padStart(2, '0')}`
    return present(<FightingLevel milestoneId={screen.milestoneId} allUnits={units} progress={game.progress.fightingLevels[screen.milestoneId]} reducedMotion={game.settings.reducedMotion} demoMode={demoMode} onProgressChange={saveFightingLevelProgress} onBack={() => setScreen({ name: 'unit', unitId })} />)
  }

  return present(<World profile={game.profile} progress={game.progress} revealingUnitId={revealingUnitId} onOpenUnit={(unitId) => setScreen({ name: 'unit', unitId })} onNavigate={navigate} onCelebrateWorld={celebrateWorld} />)
}

function World({ profile, progress, revealingUnitId, onOpenUnit, onNavigate, onCelebrateWorld }: { profile: PlayerProfile; progress: PlayerProgress; revealingUnitId: string | null; onOpenUnit: (id: string) => void; onNavigate: (screen: MainSection) => void; onCelebrateWorld: () => void }) {
  const completedUnits = completedUnitCount(progress)
  const worldComplete = completedUnits === units.length
  return (
    <main className={`app-shell ${worldComplete ? 'world-restored' : ''}`}>
      <header className="topbar">
        <button className="brand" type="button" aria-label="Power Up 2 world map"><span className="brand-mark">✦</span> POWER UP <b>2</b></button>
        <button className="player-summary player-summary-button" type="button" onClick={() => onNavigate('account')} aria-label="Open explorer profile">
          <img src={assets.avatars[profile.avatarId - 1].baseAsset} alt="" />
          <div><strong>{profile.name}</strong><EvolutionRank stage={progress.avatarEvolutionStage} /></div>
        </button>
      </header>

      <section className="world-heading">
        <div>
          <p className="eyebrow">Your adventure map</p>
          <h1>The Arcane Lightworld</h1>
          <p className="muted">Every completed training station constructs another part of its floating city.</p>
        </div>
        <div className="world-total"><strong>{completedUnits}</strong><span>of 9 cities restored</span></div>
      </section>

      <div className="world-map-viewport" role="region" aria-label="Scrollable Arcane Lightworld map" tabIndex={0}>
        <section className="map-panel world-map-panel" aria-label="Nine cities being constructed across the Arcane Lightworld">
          <img className="world-map" src={assets.worldMap} alt="An open sky world where nine floating cities are gradually restored" />
          <svg className="world-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {worldRouteSegments.map((path, index) => <path className={isUnitComplete(progress, units[index].id) ? 'is-active' : ''} d={path} key={path} />)}
          </svg>
          <div className="world-city-layer">
            {units.map((unit, index) => {
              const completed = completedModuleCount(progress, unit.id)
              const unlocked = isUnitUnlocked(progress, index)
              const placement = cityRevealByUnit[unit.id].map
              return <button
                className={`world-city activation-${completed} ${unlocked ? '' : 'locked'} ${unit.number === 9 ? 'final-destination' : ''}`}
                type="button"
                key={unit.id}
                disabled={!unlocked}
                onClick={() => onOpenUnit(unit.id)}
                style={{ left: `${placement.x}%`, top: `${placement.y}%`, width: `${placement.width}%`, height: `${placement.height}%`, zIndex: placement.zIndex }}
                aria-label={`${unlocked ? 'Open' : 'Locked'} Unit ${unit.number}: ${unit.title}, ${completed} of 5 structures restored`}
              >
                <CityReveal unitId={unit.id} completedModules={completed} variant="map" image={assets.unitImages[index]} highlight={revealingUnitId === unit.id} />
                <span className="world-city-marker"><b>{unit.number}</b><span>{unit.title}</span><small>{completed}/5</small></span>
              </button>
            })}
          </div>
        </section>
      </div>
      <p className="world-map-hint">Select an available city to build it through five learning games. On smaller screens, swipe the world map sideways to explore.</p>
      {worldComplete && !progress.worldCompletionCelebrated && <section className="world-complete-banner" role="dialog" aria-modal="true"><span aria-hidden="true">✦</span><p className="eyebrow">All nine cities are shining</p><h1>World Restored</h1><p>Your learning awakened the whole Arcane Lightworld. Every game remains open for practice.</p><button className="primary-button" type="button" onClick={onCelebrateWorld}>Explore the restored world</button></section>}
      <MainNav active="world" onNavigate={onNavigate} />
    </main>
  )
}

export function UnitHub({ unit, profile, progress, selectedParts, onPartSelectionChange, highlightReveal, showCompletion, onClaimReward, onCompleteFlow, onBack, onOpenModule, onOpenFightingLevel }: { unit: UnitData; profile: PlayerProfile; progress: PlayerProgress; selectedParts: VocabularySourcePart[]; onPartSelectionChange: (parts: VocabularySourcePart[]) => void; highlightReveal: boolean; showCompletion: boolean; onClaimReward: () => void; onCompleteFlow: () => void; onBack: () => void; onOpenModule: (moduleId: ModuleId) => void; onOpenFightingLevel?: (milestoneId: FightingMilestoneId) => void }) {
  const completed = completedModuleCount(progress, unit.id)
  const words = wordsForUnit(unit)
  const hasWords = words.length > 0
  const fightingMilestone = fightingMilestoneForUnit(unit.number)
  return <main className="app-shell unit-shell">
    <header className="topbar"><button className="back-button" type="button" onClick={onBack}>← <span>World map</span></button><div className="player-summary"><img src={assets.avatars[profile.avatarId - 1].baseAsset} alt="" /><div><strong>{profile.name}</strong><EvolutionRank stage={progress.avatarEvolutionStage} /></div></div></header>
    <section className={`unit-hero activation-${Math.min(5, completed)}`}>
      <CityReveal unitId={unit.id} completedModules={completed} variant="hero" image={assets.unitImages[unit.number - 1]} highlight={highlightReveal} />
      <div className="unit-hero-content"><p className="eyebrow">Unit {String(unit.number).padStart(2, '0')}</p><h1>{unit.title}</h1><p>{hasWords ? <>{unit.courseTitle && <><strong>{unit.courseTitle}</strong> · </>}Play the five learning games below to construct this city.</> : 'Five learning games will construct this city. Vocabulary will be added by your teacher.'}</p><div className="hero-progress"><span style={{ width: `${completed * 20}%` }} /><b>{completed}/5 restored</b></div></div>
    </section>
    <VocabularyPartSelector unit={unit} words={words} selectedParts={selectedParts} onChange={onPartSelectionChange} />
    <section className="module-section" aria-labelledby="modules-title">
      <div><p className="eyebrow">Training route</p><h2 id="modules-title">Five power stations</h2></div>
      {!hasWords && <p className="empty-note">Vocabulary for this Unit is awaiting content. You can still open a training station to see its content-ready state.</p>}
      <div className="module-grid">{modules.map((module, index) => {
        const moduleProgress = progress.units[unit.id].modules[module.id]
        const coverage = coverageForModule(unit, module.id, moduleProgress)
        return <article className={`module-card ${coverage.complete ? 'completed' : ''}`} key={module.id}>
          <span className={`module-icon module-icon-${module.id}`} style={{ backgroundImage: `url(${moduleIconAssets[module.id]})` }} aria-hidden="true"><small>{coverage.complete ? '✓' : `0${index + 1}`}</small></span><div><h3>{module.title}</h3><p>{module.description}</p>{coverage.total > 0 && <span className="module-coverage"><span>{coverage.trained} / {coverage.total} words trained{coverage.complete ? ' · Complete' : ''}</span><i><b style={{ width: `${coverage.trained / coverage.total * 100}%` }} /></i></span>}</div><button className="module-open" type="button" onClick={() => onOpenModule(module.id)}>{coverage.complete ? 'Replay' : coverage.trained > 0 ? 'Continue' : 'Open'}</button>
        </article>
      })}</div>
    </section>
    {fightingMilestone && <FightingMilestoneCard milestoneId={fightingMilestone.id} progress={progress.fightingLevels[fightingMilestone.id]} allUnits={units} unlocked={demoMode || isUnitComplete(progress, unit.id)} demoMode={demoMode} onOpen={() => onOpenFightingLevel?.(fightingMilestone.id)} />}
    {showCompletion && <UnitCompletionFlow unitTitle={unit.title} tier={chestTierForUnit(progress, unit.id)} rewards={rewardsForUnit(unit.number)} onClaim={onClaimReward} onContinue={onCompleteFlow} />}
  </main>
}
