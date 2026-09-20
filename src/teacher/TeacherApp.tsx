import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { clearCloudSession, getCloudSession } from '../cloud/cloudSession'
import { cloudApiEnabled, deleteStudent, getTeacherDashboard, loginTeacher, resetStudentPin } from '../cloud/cloudClient'
import type { TeacherDashboardSnapshot, TeacherStudentSnapshot } from '../cloud/types'
import { moduleIds, type SavedGame } from '../types/game'
import { units } from '../data/units'

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

const DAY_MS = 86_400_000
const wordDetails = new Map(units.flatMap((unit) => unit.words.map((word) => [word.id, { ...word, unitNumber: unit.number, unitTitle: unit.title }])))

const validAttemptTime = (occurredAt: string) => {
  const value = Date.parse(occurredAt)
  return Number.isFinite(value) ? value : 0
}

const dayKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`

export function trainingFrequency(student: TeacherStudentSnapshot, now = Date.now()) {
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return { key: dayKey(date), label: date.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }), attempts: 0, sessions: 0 }
  })
  const byKey = new Map(days.map((day) => [day.key, day]))
  const recent = student.recentAttempts.filter((attempt) => {
    const timestamp = validAttemptTime(attempt.occurredAt)
    return timestamp >= start.getTime() && timestamp <= end.getTime()
  })
  for (const attempt of recent) {
    const bucket = byKey.get(dayKey(new Date(validAttemptTime(attempt.occurredAt))))
    if (!bucket) continue
    bucket.attempts += 1
    if (attempt.payload.sessionCompleted || attempt.payload.sessionWon) bucket.sessions += 1
  }
  return {
    days,
    activeDays: days.filter((day) => day.attempts > 0).length,
    attempts: recent.length,
    sessions: recent.filter((attempt) => attempt.payload.sessionCompleted || attempt.payload.sessionWon).length,
    accuracy: recent.length ? Math.round(recent.filter((attempt) => attempt.payload.correct).length / recent.length * 100) : 0,
    lastActive: student.recentAttempts.reduce((latest, attempt) => Math.max(latest, validAttemptTime(attempt.occurredAt)), student.profile.createdAt),
  }
}

export function wordMistakeReport(student: TeacherStudentSnapshot) {
  const rows = new Map<string, { unitId: string; wordId: string; mistakes: number; lastMistakeAt: number; modules: Set<string>; needsReview: boolean }>()
  for (const attempt of student.recentAttempts) {
    const { payload } = attempt
    if (payload.correct || !payload.wordId) continue
    const key = `${payload.unitId}:${payload.wordId}`
    const current = rows.get(key) ?? { unitId: payload.unitId, wordId: payload.wordId, mistakes: 0, lastMistakeAt: 0, modules: new Set<string>(), needsReview: false }
    current.mistakes += 1
    current.lastMistakeAt = Math.max(current.lastMistakeAt, validAttemptTime(attempt.occurredAt))
    current.modules.add(moduleNames[payload.moduleId])
    rows.set(key, current)
  }
  for (const record of Object.values(student.game?.progress.weakWords ?? {})) {
    const key = `${record.unitId}:${record.wordId}`
    const current = rows.get(key) ?? { unitId: record.unitId, wordId: record.wordId, mistakes: 0, lastMistakeAt: 0, modules: new Set<string>(), needsReview: false }
    current.mistakes = Math.max(current.mistakes, record.mistakeCount, 1)
    current.lastMistakeAt = Math.max(current.lastMistakeAt, record.lastMistakeAt)
    current.needsReview = !record.mastered
    rows.set(key, current)
  }
  return [...rows.values()].map((row) => {
    const details = wordDetails.get(row.wordId)
    const fallbackUnit = teacherUnits.find((unit) => unit.id === row.unitId)
    return {
      ...row,
      word: details?.word ?? row.wordId,
      translation: details?.translation,
      unitNumber: details?.unitNumber ?? fallbackUnit?.number,
      unitTitle: details?.unitTitle ?? fallbackUnit?.title ?? row.unitId,
      modules: [...row.modules],
    }
  }).sort((a, b) => Number(b.needsReview) - Number(a.needsReview) || b.mistakes - a.mistakes || b.lastMistakeAt - a.lastMistakeAt)
}

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

export function studentMetrics(student: TeacherStudentSnapshot, now = Date.now()) {
  const progress = student.game?.progress
  const modules = progress ? teacherUnits.flatMap((unit) => moduleIds.map((moduleId) => progress.units[unit.id]?.modules[moduleId])).filter(Boolean) : []
  const attempted = modules.filter((module) => module.attempts > 0)
  const activity = trainingFrequency(student, now)
  const recentAccuracy = student.recentAttempts.length
    ? Math.round(student.recentAttempts.filter((attempt) => attempt.payload.correct).length / student.recentAttempts.length * 100)
    : null
  return {
    completedUnits: progress ? teacherUnits.filter((unit) => progress.units[unit.id]?.completed).length : 0,
    completedModules: modules.filter((module) => module.completed).length,
    accuracy: recentAccuracy ?? (attempted.length ? Math.round(attempted.reduce((sum, module) => sum + module.bestAccuracy, 0) / attempted.length * 100) : 0),
    weak: progress ? Object.values(progress.weakWords).filter((word) => !word.mastered).length : 0,
    lastActive: activity.lastActive,
    activeDays: activity.activeDays,
    recentAttempts: activity.attempts,
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
  const classAttempts = (dashboard?.students ?? []).flatMap((student) => student.recentAttempts)
  const classAccuracy = classAttempts.length ? Math.round(classAttempts.filter((attempt) => attempt.payload.correct).length / classAttempts.length * 100) : 0

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
    <section className="teacher-overview"><article><strong>{dashboard?.students.length ?? 0}</strong><span>Students</span></article><article><strong>{activeThisWeek}</strong><span>Active this week</span></article><article><strong>{classAccuracy}%</strong><span>Recent answer accuracy</span></article><article><strong>{totals.reduce((sum, metric) => sum + metric.weak, 0)}</strong><span>Words to review</span></article></section>
    <section className="teacher-workspace">
      <div className="teacher-roster"><header><div><p className="eyebrow">Students</p><h2>Class overview</h2></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find student" aria-label="Find student" /></header><div className="teacher-table-head"><span>Student</span><span>Coverage</span><span>Accuracy</span><span>Review</span><span>Frequency (7d)</span></div>{students.map((student) => { const metric = studentMetrics(student); return <button className={selected?.profile.playerId === student.profile.playerId ? 'selected' : ''} type="button" key={student.profile.playerId} onClick={() => setSelectedId(student.profile.playerId)}><span><strong>{student.profile.name}</strong><small>{student.profile.studentCode}</small></span><b>{metric.completedModules}/45</b><b>{metric.accuracy}%</b><b>{metric.weak}</b><span className="roster-frequency"><b>{metric.activeDays}/7 days</b><small>{metric.recentAttempts} answers</small></span></button> })}{!students.length && <p className="teacher-empty">No students have joined this group yet.</p>}</div>
      <aside className="teacher-detail">{selected ? <StudentDetail student={selected} onResetPin={() => void resetPin(selected)} onDelete={() => void remove(selected)} busy={busy} /> : <div className="teacher-empty">Select a student to see details.</div>}</aside>
    </section>
  </main>
}

function StudentDetail({ student, onResetPin, onDelete, busy }: { student: TeacherStudentSnapshot; onResetPin: () => void; onDelete: () => void; busy: boolean }) {
  const progress = student.game?.progress
  const mistakes = wordMistakeReport(student)
  const frequency = trainingFrequency(student)
  const maxAttempts = Math.max(1, ...frequency.days.map((day) => day.attempts))
  return <><header><p className="eyebrow">Selected student</p><h2>{student.profile.name}</h2><span>{student.profile.studentCode}</span></header>
    <section className="training-frequency-report"><div className="report-heading"><div><p className="eyebrow">Last 7 days</p><h3>Training frequency</h3></div><time>{frequency.attempts ? `Last training: ${formatActivity(frequency.lastActive)}` : 'No synced training yet'}</time></div><div className="frequency-summary"><article><strong>{frequency.activeDays}/7</strong><span>active days</span></article><article><strong>{frequency.sessions}</strong><span>completed sessions</span></article><article><strong>{frequency.attempts}</strong><span>answers</span></article><article><strong>{frequency.accuracy}%</strong><span>accuracy</span></article></div><div className="activity-chart" aria-label="Answers per day during the last seven days">{frequency.days.map((day) => <div key={day.key}><span><i style={{ height: `${Math.max(day.attempts ? 12 : 2, day.attempts / maxAttempts * 100)}%` }} /></span><b>{day.attempts}</b><small>{day.label}</small></div>)}</div></section>
    <section className="weak-word-report"><div className="report-heading"><div><p className="eyebrow">Individual vocabulary</p><h3>Words with mistakes</h3></div><span>{mistakes.filter((word) => word.needsReview).length} to review</span></div>{mistakes.length ? <div className="mistake-list">{mistakes.map((item) => <article key={`${item.unitId}:${item.wordId}`}><div><strong>{item.word}</strong>{item.translation && <em>{item.translation}</em>}<small>Unit {item.unitNumber ?? '—'} · {item.unitTitle}{item.modules.length ? ` · ${item.modules.join(', ')}` : ''}</small></div><span className={item.needsReview ? 'needs-review' : 'mastered'}>{item.needsReview ? 'Review' : 'Practised'}</span><b>{item.mistakes} {item.mistakes === 1 ? 'error' : 'errors'}</b><time>{item.lastMistakeAt ? formatActivity(item.lastMistakeAt) : 'Earlier'}</time></article>)}</div> : <p>No word mistakes have been synced yet.</p>}</section>
    <section className="student-unit-report"><h3>Coverage by Unit</h3>{teacherUnits.map((unit) => <article key={unit.id}><div><strong>Unit {unit.number} · {unit.title}</strong><small>{moduleIds.map((id) => `${moduleNames[id]} ${progress?.units[unit.id]?.modules[id].trainedWordIds.length ?? 0}`).join(' · ')}</small></div><b>{moduleIds.filter((id) => progress?.units[unit.id]?.modules[id].completed).length}/5</b></article>)}</section><footer><button type="button" onClick={onResetPin} disabled={busy || !cloudApiEnabled}>Reset PIN</button><button className="danger" type="button" onClick={onDelete} disabled={busy || !cloudApiEnabled}>Delete student</button></footer></>
}
