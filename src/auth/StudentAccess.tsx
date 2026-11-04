import { useState, type FormEvent } from 'react'
import { avatars } from '../data/assets'
import { CURRENT_SCHEMA_VERSION, createProfile, createProgress, defaultSettings } from '../progress/localProgressRepository'
import type { SavedGame } from '../types/game'

export function StudentAccess({ onReady }: { onReady: (game: SavedGame) => boolean }) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [avatarId, setAvatarId] = useState(1)
  const [message, setMessage] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) { setMessage('Enter the student name.'); return }
    const profile = createProfile(name, group, avatarId)
    const saved = onReady({ schemaVersion: CURRENT_SCHEMA_VERSION, profile, progress: createProgress(avatarId), settings: defaultSettings })
    if (!saved) setMessage('This browser could not save progress. Allow site storage and try again.')
  }

  return <main className="access-shell">
    <section className="access-intro"><p className="eyebrow">Power Up 2 · Lightworld Academy</p><h1>Create your explorer</h1><p>Choose your avatar and keep your adventure on this phone.</p><div className="local-mode-note"><strong>Saved on this device only</strong><span>No account, PIN or cloud connection is needed. Use the same browser each time. Clearing browser data or removing the app can erase progress.</span></div></section>
    <form className="access-card" onSubmit={submit}>
      <label>Student name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="First name or nickname" required autoComplete="name" /></label>
      <label>Group or class (optional)<input value={group} onChange={(event) => setGroup(event.target.value)} placeholder="For example, 5A" /></label>
      <fieldset><legend>Choose your avatar</legend><div className="access-avatar-grid">{avatars.map((avatar) => <button key={avatar.id} type="button" aria-label={avatar.name} aria-pressed={avatarId === avatar.id} className={avatarId === avatar.id ? 'selected' : ''} onClick={() => setAvatarId(avatar.id)}><img src={avatar.baseAsset} alt="" /><span>{String(avatar.id).padStart(2, '0')}</span></button>)}</div></fieldset>
      {message && <p className="access-error" role="alert">{message}</p>}
      <button className="primary-button" type="submit">Start adventure</button>
    </form>
  </main>
}
