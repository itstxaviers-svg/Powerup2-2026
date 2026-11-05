import { useState, type ChangeEvent, type FormEvent } from 'react'
import { avatars } from '../data/assets'
import { CURRENT_SCHEMA_VERSION, activateSavedProfile, createProfile, createProgress, defaultSettings, savedProfiles } from '../progress/localProgressRepository'
import { parseExplorerBackup } from '../progress/profileTransfer'
import type { SavedGame } from '../types/game'

export function StudentAccess({ onReady }: { onReady: (game: SavedGame) => boolean }) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [avatarId, setAvatarId] = useState(1)
  const [message, setMessage] = useState('')
  const profiles = savedProfiles()

  const resume = (id: string) => {
    const game = activateSavedProfile(id)
    if (!game || !onReady(game)) setMessage('Could not open this profile. Check browser storage and try again.')
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 10_000_000) { setMessage('This backup is too large. Choose a file under 10 MB.'); return }
    try {
      const game = parseExplorerBackup(await file.text())
      if (profiles.some((profile) => profile.playerId === game.profile.playerId) &&
        !window.confirm(`A local profile for ${game.profile.name} already exists. Replace its progress with this backup?`)) return
      if (!onReady(game)) setMessage('Could not save the imported profile on this device.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not read this backup.') }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) { setMessage('Enter the student name.'); return }
    const profile = createProfile(name, group, avatarId)
    const saved = onReady({ schemaVersion: CURRENT_SCHEMA_VERSION, profile, progress: createProgress(avatarId), settings: defaultSettings })
    if (!saved) setMessage('This browser could not save progress. Allow site storage and try again.')
  }

  return <main className="access-shell">
    <section className="access-intro"><p className="eyebrow">Power Up 2 · Lightworld Academy</p><h1>{profiles.length ? 'Choose your explorer' : 'Create your explorer'}</h1><p>Continue a saved adventure or bring a backup from another device.</p><div className="local-mode-note"><strong>Saved on this device only</strong><span>Sign out keeps every saved profile in this browser. Download a backup before changing devices. Clearing browser data or removing the app can erase progress.</span></div></section>
    <div className="access-workspace">
    {profiles.length > 0 && <section className="access-card saved-profile-card" aria-label="Saved profiles"><h2>Saved on this device</h2><div className="saved-profile-list">{profiles.map((profile) => <button key={profile.playerId} type="button" onClick={() => resume(profile.playerId)}><img src={avatars[profile.avatarId - 1].baseAsset} alt="" /><span><strong>{profile.name}</strong><small>{profile.group || 'Explorer'}</small></span><b>Continue →</b></button>)}</div></section>}
    <form className="access-card" onSubmit={submit}>
      <h2>Create a new explorer</h2>
      <label>Student name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="First name or nickname" required autoComplete="name" /></label>
      <label>Group or class (optional)<input value={group} onChange={(event) => setGroup(event.target.value)} placeholder="For example, 5A" /></label>
      <fieldset><legend>Choose your avatar</legend><div className="access-avatar-grid">{avatars.map((avatar) => <button key={avatar.id} type="button" aria-label={avatar.name} aria-pressed={avatarId === avatar.id} className={avatarId === avatar.id ? 'selected' : ''} onClick={() => setAvatarId(avatar.id)}><img src={avatar.baseAsset} alt="" /><span>{String(avatar.id).padStart(2, '0')}</span></button>)}</div></fieldset>
      {message && <p className="access-error" role="alert">{message}</p>}
      <button className="primary-button" type="submit">Start adventure</button>
    </form>
    <section className="access-card import-profile-card"><h2>Move from another device</h2><p>Choose a Power Up 2 profile backup (.json). The profile and progress will be saved in this browser.</p><label>Import backup<input type="file" accept=".json,application/json" onChange={(event) => void importBackup(event)} /></label></section>
    </div>
  </main>
}
