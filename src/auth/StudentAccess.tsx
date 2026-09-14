import { useState, type FormEvent } from 'react'
import { cloudApiEnabled, loginStudent, registerStudent } from '../cloud/cloudClient'
import { clearCloudSession } from '../cloud/cloudSession'
import { avatars } from '../data/assets'
import { CURRENT_SCHEMA_VERSION, createProfile, createProgress, defaultSettings } from '../progress/localProgressRepository'
import type { SavedGame } from '../types/game'

type Mode = 'register' | 'login'

export function StudentAccess({ onReady }: { onReady: (game: SavedGame) => void }) {
  const [mode, setMode] = useState<Mode>('register')
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [pin, setPin] = useState('')
  const [avatarId, setAvatarId] = useState(1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [created, setCreated] = useState<{ code: string; pin: string; game: SavedGame } | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'login') {
        const result = await loginStudent(studentCode.trim().toUpperCase(), pin)
        const game = result.game ?? {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          profile: { ...createProfile(result.profile.name, result.profile.group, result.profile.avatarId), playerId: result.profile.playerId, studentCode: result.profile.studentCode, joinCode: result.profile.joinCode, createdAt: result.profile.createdAt },
          progress: createProgress(result.profile.avatarId),
          settings: defaultSettings,
        }
        onReady(game)
        return
      }

      if (!name.trim()) throw new Error('Enter the student name.')
      if (!cloudApiEnabled) {
        clearCloudSession()
        const profile = createProfile(name, joinCode, avatarId)
        onReady({ schemaVersion: CURRENT_SCHEMA_VERSION, profile, progress: createProgress(avatarId), settings: defaultSettings })
        return
      }
      if (!/^[0-9]{6}$/.test(pin)) throw new Error('PIN must contain exactly 6 digits.')
      const result = await registerStudent({ displayName: name, joinCode, avatarId, pin })
      const profile = { ...createProfile(result.profile.name, result.profile.group, result.profile.avatarId), playerId: result.profile.playerId, studentCode: result.profile.studentCode, joinCode: result.profile.joinCode, createdAt: result.profile.createdAt }
      const game: SavedGame = result.game ?? { schemaVersion: CURRENT_SCHEMA_VERSION, profile, progress: createProgress(avatarId), settings: defaultSettings }
      setCreated({ code: result.profile.studentCode, pin, game })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not connect. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (created) return <main className="access-shell"><section className="credential-card" role="status"><p className="eyebrow">Account created</p><h1>Save your Explorer ID</h1><p>Use this ID and PIN to continue on another device. Your teacher can reset the PIN.</p><div className="credential-grid"><span><small>Explorer ID</small><strong>{created.code}</strong></span><span><small>PIN</small><strong>{created.pin}</strong></span></div><button className="primary-button" type="button" onClick={() => onReady(created.game)}>I saved it · Continue</button></section></main>

  return <main className="access-shell">
    <section className="access-intro"><p className="eyebrow">Power Up 2 · Lightworld Academy</p><h1>{mode === 'register' ? 'Create your explorer' : 'Welcome back'}</h1><p>{mode === 'register' ? 'Join your teacher’s group, choose an avatar, and keep your progress on every device.' : 'Enter the Explorer ID and PIN you received when you joined.'}</p>{!cloudApiEnabled && <div className="local-mode-note"><strong>Local preview</strong><span>Cloud is not connected yet. Progress stays in this browser.</span></div>}</section>
    <form className="access-card" onSubmit={submit}>
      <div className="access-tabs" role="tablist"><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMessage('') }}>New explorer</button><button type="button" className={mode === 'login' ? 'active' : ''} disabled={!cloudApiEnabled} onClick={() => { setMode('login'); setMessage('') }}>Sign in</button></div>
      {mode === 'register' ? <>
        <label>Student name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="First name or nickname" required autoComplete="name" /></label>
        <label>Group code<input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder={cloudApiEnabled ? 'From your teacher' : 'For example, 2B'} required={cloudApiEnabled} autoCapitalize="characters" /></label>
        {cloudApiEnabled && <label>Create a 6-digit PIN<input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" inputMode="numeric" autoComplete="new-password" required /></label>}
        <fieldset><legend>Choose your avatar</legend><div className="access-avatar-grid">{avatars.map((avatar) => <button key={avatar.id} type="button" aria-label={avatar.name} aria-pressed={avatarId === avatar.id} className={avatarId === avatar.id ? 'selected' : ''} onClick={() => setAvatarId(avatar.id)}><img src={avatar.baseAsset} alt="" /><span>{String(avatar.id).padStart(2, '0')}</span></button>)}</div></fieldset>
      </> : <>
        <label>Explorer ID<input value={studentCode} onChange={(event) => setStudentCode(event.target.value.toUpperCase())} placeholder="For example, SOPHIE-482" autoCapitalize="characters" required /></label>
        <label>6-digit PIN<input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" inputMode="numeric" autoComplete="current-password" required /></label>
      </>}
      {message && <p className="access-error" role="alert">{message}</p>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Connecting…' : mode === 'register' ? 'Start adventure' : 'Enter Lightworld'}</button>
    </form>
  </main>
}
