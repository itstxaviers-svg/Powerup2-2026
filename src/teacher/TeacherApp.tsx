import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { clearCloudSession, getCloudSession } from '../cloud/cloudSession'
import { cloudApiEnabled, deleteStudent, getTeacherDashboard, loginTeacher, resetStudentPin } from '../cloud/cloudClient'
import type { TeacherDashboardSnapshot, TeacherStudentSnapshot } from '../cloud/types'
import { moduleIds, type SavedGame } from '../types/game'

const moduleNames = { repair: 'Repair', 'error-hunt': 'Error Hunt', 'audio-code': 'Audio Code', 'word-strike': 'Word Strike', 'code-fighter': 'Code Fighter' } as const
const teacherUnits = [
  { id: 'unit-01', number: 1, title: 'Skyport Basics' },
  { id: 'unit-02', number: 2, title: 'Clockwork City' },
  { id: 'unit-03', number: 3, title: 'Garden of Words' },
  { id: 'unit-04', number: 4, title: 'Crystal Library' },
  { id: 'unit-05', number: 5, title: 'Light Engine Core' },
  { id: 'unit-06', number: 6, title: 'Echo Canyon' },
  { id: 'unit-07', number: 7, title: 'Starfall Observatory' },
  { id: 'unit-08', number: 8, title: 'Dreamspire Tower' },
  { id: 'unit-09', number: 9, title: 'Radiant Citadel' },
] as const

function demoDashboard(): TeacherDashboardSnapshot {
  let game: SavedGame | null = null
  try {
    const raw = localStorage.getItem('power-up-2-progress-v1')
    game = raw ? JSON.parse(raw) as SavedGame : null
  } catch {
    game = null
  }
  if (!game) return { group: { joinCode: 'LOCAL', displayName: 'Local preview' }, students: [] }
  return { group: { joinCode: game.profile.joinCode ?? (game.profile.group || 'LOCAL'), displayName: game.profile.group || 'Local preview' }, students: [{ profile: { playerId: game.profile.playerId, studentCode: game.profile.studentCode ?? 'LOCAL-001', name: game.profile.name, group: game.profile.group, joinCode: game.profile.joinCode ?? game.profile.group, avatarId: game.profile.avatarId, createdAt: game.profile.createdAt }, game, recentAttempts: [] }] }
}

function studentMetrics(student: TeacherStudentSnapshot) {
  const progress = student.game?.progress
  if (!progress) return { completedUnits: 0, completedModules: 0, accuracy: 0, weak: 0, lastActive: student.profile.createdAt }
  const modules = teacherUnits.flatMap((unit) => moduleIds.map((moduleId) => progress.units[unit.id]?.modules[moduleId])).filter(Boolean)
  const attempted = modules.filter((module) => module.attempts > 0)
  const latestAttempt = student.recentAttempts[0]?.occurredAt
  return {
    completedUnits: teacherUnits.filter((unit) => progress.units[unit.id]?.completed).length,
    completedModules: modules.filter((module) => module.completed).length,
    accuracy: attempted.length ? Math.round(attempted.reduce((sum, module) => sum + module.bestAccuracy, 0) / attempted.length) : 0,
    weak: Object.values(progress.weakWords).filter((word) => !word.mastered).length,
    lastActive: latestAttempt ? Date.parse(latestAttempt) : student.profile.createdAt,
  }
}

function formatActivity(timestamp: number) {
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export function TeacherApp() {
  const [session, setSession] = useState(() => getCloudSession('teacher'))
  const [dashboard, setDashboard] = useState<TeacherDashboardSnapshot | null>(() => cloudApiEnabled ? null : demoDashboard())
  const [selectedId, setSelectedId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('')
  const [temporaryPin, setTemporaryPin] = useState<{ name: string; pin: string } | null>(null)

  const load = async () => {
    if (!cloudApiEnabled) { setDashboard(demoDashboard()); return }
    setBusy(true)
    try {
      const result = await getTeacherDashboard()
      setDashboard(result)
      if (!selectedId && result.students[0]) setSelectedId(result.students[0].profile.playerId)
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load the class.')
    } finally { setBusy(false) }
  }

  useEffect(() => { if (session || !cloudApiEnabled) void load() }, [session])

  const signIn = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setMessage('')
    try { setSession(await loginTeacher(email, password)) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not sign in.') }
    finally { setBusy(false) }
  }

  const students = useMemo(() => (dashboard?.students ?? []).filter((student) => `${student.profile.name} ${student.profile.studentCode}`.toLowerCase().includes(filter.toLowerCase())), [dashboard, filter])
  const selected = (dashboard?.students ?? []).find((student) => student.profile.playerId === selectedId) ?? students[0]
  const totals = (dashboard?.students ?? []).map(studentMetrics)
  const activeThisWeek = totals.filter((metric) => Date.now() - metric.lastActive < 7 * 86_400_000).length
  const classAccuracy = totals.length ? Math.round(totals.reduce((sum, metric) => sum + metric.accuracy, 0) / totals.length) : 0

  if (cloudApiEnabled && !session) return <main className="teacher-login-shell"><form className="teacher-login-card" onSubmit={signIn}><p className="eyebrow">Power Up 2 · Teacher</p><h1>Teacher dashboard</h1><p>Sign in to see only the students in your group.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{message && <p className="access-error" role="alert">{message}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></main>

  const remove = async (student: TeacherStudentSnapshot) => {
    if (!window.confirm(`Delete ${student.profile.name}'s cloud account and progress?`)) return
    setBusy(true)
    try { await deleteStudent(student.profile.studentCode); setSelectedId(''); await load() }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete the student.') }
    finally { setBusy(false) }
  }

  const resetPin = async (student: TeacherStudentSnapshot) => {
    setBusy(true)
    try { const result = await resetStudentPin(student.profile.studentCode); setTemporaryPin({ name: student.profile.name, pin: result.temporaryPin }) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not reset the PIN.') }
    finally { setBusy(false) }
  }

  return <main className="teacher-shell">
    <header className="teacher-topbar"><div><p className="eyebrow">Power Up 2 · Teacher dashboard</p><h1>{dashboard?.group.displayName ?? 'Your class'}</h1><span>Join code: <strong>{dashboard?.group.joinCode ?? '—'}</strong></span></div><div><button type="button" onClick={() => void load()} disabled={busy}>{busy ? 'Updating…' : 'Refresh'}</button>{cloudApiEnabled && <button type="button" onClick={() => { clearCloudSession(); setSession(null); setDashboard(null) }}>Sign out</button>}</div></header>
    {!cloudApiEnabled && <div className="teacher-demo-banner"><strong>Local teacher preview</strong><span>Connect the Yandex API to collect progress from children’s devices.</span></div>}
    {message && <p className="teacher-message" role="alert">{message}</p>}
    {temporaryPin && <section className="teacher-pin-result" role="status"><div><strong>Temporary PIN for {temporaryPin.name}</strong><span>Give it directly to the student.</span></div><code>{temporaryPin.pin}</code><button type="button" onClick={() => setTemporaryPin(null)}>Close</button></section>}
    <section className="teacher-overview"><article><strong>{dashboard?.students.length ?? 0}</strong><span>Students</span></article><article><strong>{activeThisWeek}</strong><span>Active this week</span></article><article><strong>{classAccuracy}%</strong><span>Average best accuracy</span></article><article><strong>{totals.reduce((sum, metric) => sum + metric.weak, 0)}</strong><span>Words to review</span></article></section>
    <section className="teacher-workspace">
      <div className="teacher-roster"><header><div><p className="eyebrow">Students</p><h2>Class overview</h2></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find student" aria-label="Find student" /></header><div className="teacher-table-head"><span>Student</span><span>Coverage</span><span>Accuracy</span><span>Review</span><span>Activity</span></div>{students.map((student) => { const metric = studentMetrics(student); return <button className={selected?.profile.playerId === student.profile.playerId ? 'selected' : ''} type="button" key={student.profile.playerId} onClick={() => setSelectedId(student.profile.playerId)}><span><strong>{student.profile.name}</strong><small>{student.profile.studentCode}</small></span><b>{metric.completedModules}/45</b><b>{metric.accuracy}%</b><b>{metric.weak}</b><time>{formatActivity(metric.lastActive)}</time></button> })}{!students.length && <p className="teacher-empty">No students have joined this group yet.</p>}</div>
      <aside className="teacher-detail">{selected ? <StudentDetail student={selected} onResetPin={() => void resetPin(selected)} onDelete={() => void remove(selected)} busy={busy} /> : <div className="teacher-empty">Select a student to see details.</div>}</aside>
    </section>
  </main>
}

function StudentDetail({ student, onResetPin, onDelete, busy }: { student: TeacherStudentSnapshot; onResetPin: () => void; onDelete: () => void; busy: boolean }) {
  const progress = student.game?.progress
  const weakWords = progress ? Object.values(progress.weakWords).filter((word) => !word.mastered).sort((a, b) => b.priority - a.priority) : []
  return <><header><p className="eyebrow">Selected student</p><h2>{student.profile.name}</h2><span>{student.profile.studentCode}</span></header><div className="student-unit-report">{teacherUnits.map((unit) => <article key={unit.id}><div><strong>Unit {unit.number} · {unit.title}</strong><small>{moduleIds.map((id) => `${moduleNames[id]} ${progress?.units[unit.id]?.modules[id].trainedWordIds.length ?? 0}`).join(' · ')}</small></div><b>{moduleIds.filter((id) => progress?.units[unit.id]?.modules[id].completed).length}/5</b></article>)}</div><section className="weak-word-report"><h3>Priority review</h3>{weakWords.length ? <div>{weakWords.slice(0, 10).map((word) => <span key={word.wordId}>{word.wordId} <b>{word.mistakeCount}</b></span>)}</div> : <p>No active weak words.</p>}</section><footer><button type="button" onClick={onResetPin} disabled={busy || !cloudApiEnabled}>Reset PIN</button><button className="danger" type="button" onClick={onDelete} disabled={busy || !cloudApiEnabled}>Delete student</button></footer></>
}
