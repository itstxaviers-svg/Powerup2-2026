import { useState } from 'react'
import { AvatarEvolution, EvolutionRank } from '../components/avatars/AvatarEvolution'
import { RewardIcon } from '../components/rewards/RewardChest'
import { CityReveal } from '../components/world/CityReveal'
import { assets } from '../data/assets'
import type { EvolutionStage } from '../data/avatarEvolution'
import { achievements as achievementDefinitions, moduleMedals, rewardsForUnit } from '../data/rewards'
import { units } from '../data/units'
import { coverageForModule } from '../learning/moduleCoverage'
import { completedModuleCount, completedUnitCount } from '../progress/progressionEngine'
import { moduleIds, type GameSettings, type ModuleId, type PlayerProfile, type PlayerProgress, type UnitData } from '../types/game'

export type MainSection = 'world' | 'progress' | 'rewards' | 'account' | 'settings'

const nextEvolutionAt: Partial<Record<EvolutionStage, number>> = { 1: 3, 2: 5, 3: 8 }
const moduleLabels: Record<ModuleId, string> = { repair: 'Repair', 'error-hunt': 'Error Hunt', 'audio-code': 'Audio Code', 'word-strike': 'Word Strike', 'code-fighter': 'Code Fighter' }

export function evolutionProgressText(completedUnits: number, stage: EvolutionStage) {
  const restored = `${completedUnits} ${completedUnits === 1 ? 'city' : 'cities'} restored`
  const nextThreshold = nextEvolutionAt[stage]
  return nextThreshold
    ? `${restored} · Next evolution at ${nextThreshold}`
    : `${restored} · Final evolution reached`
}

export function MainNav({ active, onNavigate }: { active: MainSection; onNavigate: (screen: MainSection) => void }) {
  const entries: Array<{ id: MainSection; icon: string; label: string }> = [
    { id: 'world', icon: '⌁', label: 'World' }, { id: 'progress', icon: '◌', label: 'Progress' }, { id: 'rewards', icon: '✦', label: 'Rewards' }, { id: 'account', icon: '◐', label: 'Profile' }, { id: 'settings', icon: '⚙', label: 'Settings' },
  ]
  return <nav className="bottom-nav" aria-label="Main navigation">{entries.map((entry) => <button className={active === entry.id ? 'active' : ''} type="button" key={entry.id} onClick={() => onNavigate(entry.id)}>{entry.icon}<span>{entry.label}</span></button>)}</nav>
}

function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="cabinet-heading"><div><p className="eyebrow">Student cabinet</p><h1>{title}</h1><p>{subtitle}</p></div></header>
}

export function ProgressView({ profile, progress, onNavigate }: { profile: PlayerProfile; progress: PlayerProgress; onNavigate: (screen: MainSection) => void }) {
  const completedUnits = completedUnitCount(progress)
  const completedModules = units.reduce((sum, unit) => sum + completedModuleCount(progress, unit.id), 0)
  return <main className="app-shell cabinet-shell"><ScreenHeader title={`${profile.name}'s progress`} subtitle="A station activates after every eligible Unit word has been trained in that game." /><section className="progress-overview"><article><strong>{completedUnits}/9</strong><span>Cities restored</span></article><article><strong>{completedModules}/45</strong><span>Stations active</span></article><article><strong>{Object.keys(progress.achievements).length}</strong><span>Achievements</span></article></section><section className="progress-city-list" aria-label="City progress">{units.map((unit) => { const count = completedModuleCount(progress, unit.id); return <article key={unit.id} className={`progress-city activation-${count}`}><CityReveal unitId={unit.id} completedModules={count} variant="progress" image={assets.unitImages[unit.number - 1]} /><div><strong>{unit.title}</strong><span>{count}/5 stations active</span><div className="mini-progress"><i style={{ width: `${count * 20}%` }} /></div><ProgressCityCoverage unit={unit} progress={progress} /></div>{count === 5 && <b>Restored</b>}</article> })}</section><MainNav active="progress" onNavigate={onNavigate} /></main>
}

function ProgressCityCoverage({ unit, progress }: { unit: UnitData; progress: PlayerProgress }) {
  if (!unit.words.length) return <span className="progress-vocabulary-pending">Vocabulary pending</span>
  return <div className="progress-module-coverage">{moduleIds.map((moduleId) => {
    const coverage = coverageForModule(unit, moduleId, progress.units[unit.id].modules[moduleId])
    return <span key={moduleId}>{moduleLabels[moduleId]} <b>{coverage.trained}/{coverage.total}</b></span>
  })}</div>
}

export function RewardsView({ progress, onNavigate }: { progress: PlayerProgress; onNavigate: (screen: MainSection) => void }) {
  const inventoryEntries = Object.entries(progress.inventory).filter(([id, quantity]) => quantity > 0 && !id.startsWith('medal.'))
  return <main className="app-shell cabinet-shell rewards-shell"><ScreenHeader title="Rewards & achievements" subtitle="Treasures are earned through learning—never random or paid." /><section className="cabinet-panel"><p className="eyebrow">Module medals</p><div className="medal-grid">{Object.values(moduleMedals).map((medal) => <article className={progress.inventory[medal.id] ? 'unlocked' : 'locked'} key={medal.id}><RewardIcon reward={medal} /><strong>{medal.label}</strong><span>{progress.inventory[medal.id] ? 'Earned' : 'Complete its station'}</span></article>)}</div></section><section className="cabinet-panel"><p className="eyebrow">Collection</p>{inventoryEntries.length ? <div className="collection-grid">{inventoryEntries.map(([id, quantity]) => { const reward = units.flatMap((unit) => rewardsForUnit(unit.number)).find((candidate) => candidate.id === id); return reward ? <article key={id}><RewardIcon reward={reward} /><strong>{reward.label}</strong><span>×{quantity}</span></article> : null })}</div> : <div className="collection-empty"><span aria-hidden="true">✦</span><p>Complete your first Unit to start your collection.</p></div>}</section><section className="cabinet-panel"><p className="eyebrow">Achievements</p><div className="achievement-list">{Object.entries(achievementDefinitions).map(([id, achievement]) => <article className={progress.achievements[id] ? 'unlocked' : 'locked'} key={id}><span aria-hidden="true">✦</span><div><strong>{achievement.title}</strong><p>{achievement.description}</p></div><b>{progress.achievements[id] ? 'Unlocked' : 'In progress'}</b></article>)}</div></section><MainNav active="rewards" onNavigate={onNavigate} /></main>
}

export function AccountView({ profile, progress, onSignOut, onNavigate }: { profile: PlayerProfile; progress: PlayerProgress; onSignOut: () => void | Promise<void>; onNavigate: (screen: MainSection) => void }) {
  const activeReviews = Object.values(progress.weakWords).filter((record) => !record.mastered).length
  const completedUnits = completedUnitCount(progress)
  const stage = progress.avatarEvolutionStage
  const avatar = assets.avatars[profile.avatarId - 1]
  const accessories = Object.entries(progress.inventory).filter(([id, count]) => id.startsWith('accessory.') && count > 0)
  return <main className="app-shell cabinet-shell">
    <ScreenHeader title="Explorer profile" subtitle="Your avatar grows as Lightworld cities are restored." />
    <section className="profile-card"><AvatarEvolution avatar={avatar} stage={stage} label={profile.name} /><div><p className="eyebrow">Current evolution</p><div className="profile-name-rank"><h1>{profile.name}</h1><EvolutionRank stage={stage} /></div><p>{avatar.name}</p><div className="profile-stage-track"><span style={{ width: `${Math.max(8, completedUnits / 9 * 100)}%` }} /></div><small>{evolutionProgressText(completedUnits, stage)}</small></div></section>
    {profile.studentCode && <section className="explorer-login-card" aria-label="Explorer sign-in details"><div><p className="eyebrow">Sign in on another device</p><h2>Keep this Explorer ID safe</h2><p>Your teacher can reset the PIN if it is forgotten.</p></div><dl><div><dt>Explorer ID</dt><dd>{profile.studentCode}</dd></div><div><dt>Group code</dt><dd>{profile.joinCode ?? profile.group}</dd></div></dl></section>}
    <section className="profile-summary"><article><strong>{completedUnits}</strong><span>Cities restored</span></article><article><strong>{activeReviews}</strong><span>Words coming back for review</span></article><article><strong>{accessories.length}</strong><span>Accessories collected</span></article></section>
    {accessories.length > 0 && <section className="cabinet-panel"><p className="eyebrow">Avatar collectibles</p><p className="friendly-empty">{accessories.map(([id]) => id.split('.')[1]).join(' · ')}. These are safely stored until dedicated overlay art is available.</p></section>}
    <section className="account-signout-card"><div><p className="eyebrow">Account</p><h2>Finished for now?</h2><p>Sign out on this device. Your saved progress will not be deleted.</p></div><button className="secondary-button" type="button" onClick={() => void onSignOut()}>Sign out</button></section>
    <MainNav active="account" onNavigate={onNavigate} />
  </main>
}

export function SettingsView({ settings, onChange, onResetProgress, onResetProfile, onNavigate }: { settings: GameSettings; onChange: (settings: GameSettings) => void; onResetProgress: () => void; onResetProfile: () => void; onNavigate: (screen: MainSection) => void }) {
  const [confirm, setConfirm] = useState<'progress' | 'profile' | null>(null)
  return <main className={`app-shell cabinet-shell ${settings.reducedMotion ? 'reduce-motion' : ''}`}><ScreenHeader title="Settings" subtitle="Choose how Lightworld sounds and moves on this device." /><section className="settings-panel"><Toggle label="Music" description="Background music when tracks are available." checked={settings.musicEnabled} onChange={(checked) => onChange({ ...settings, musicEnabled: checked })} /><Toggle label="Sound effects" description="Game action and reward effects." checked={settings.sfxEnabled} onChange={(checked) => onChange({ ...settings, sfxEnabled: checked })} /><Toggle label="Reduced motion" description="Use static lights instead of moving particles and flights." checked={settings.reducedMotion} onChange={(checked) => onChange({ ...settings, reducedMotion: checked })} /></section><section className="settings-panel reset-panel"><h2>Reset options</h2><p>Reset game progress keeps the student profile and these settings. Reset full profile returns to registration.</p>{confirm === null && <div className="reset-actions"><button className="secondary-button" type="button" onClick={() => setConfirm('progress')}>Reset game progress</button><button className="danger-button" type="button" onClick={() => setConfirm('profile')}>Reset full profile</button></div>}{confirm && <div className="confirm-reset" role="alert"><strong>{confirm === 'progress' ? 'Reset every Unit, reward, review word and achievement?' : 'Erase this local profile and all game data?'}</strong><div><button className="secondary-button" type="button" onClick={() => setConfirm(null)}>Cancel</button><button className="danger-button" type="button" onClick={confirm === 'progress' ? onResetProgress : onResetProfile}>Confirm reset</button></div></div>}</section><MainNav active="settings" onNavigate={onNavigate} /></main>
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="setting-row"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>
}
