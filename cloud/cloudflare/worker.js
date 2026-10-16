const encoder = new TextEncoder()
const PIN_ITERATIONS = 100_000
const JOIN_CODE = 'POWERUP2'
const GROUP_NAME = 'Power Up 2'

const json = (body, status = 200, request) => Response.json(body, {
  status,
  headers: {
    'Access-Control-Allow-Origin': request?.headers.get('Origin') || '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Bootstrap-Secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  },
})

const corsPreflight = (request) => new Response(null, {
  status: 204,
  headers: {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Bootstrap-Secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  },
})

const base64Url = (bytes, padding = false) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const encoded = btoa(binary).replaceAll('+', '-').replaceAll('/', '_')
  return padding ? encoded : encoded.replace(/=+$/, '')
}

const decodeBase64Url = (value) => {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
}

const constantTimeEqual = (left, right) => {
  const a = encoder.encode(String(left))
  const b = encoder.encode(String(right))
  if (a.length !== b.length) return false
  let difference = 0
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index]
  return difference === 0
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))
}

async function issueToken(env, role, subjectId, extra = {}) {
  const expires = Math.floor(Date.now() / 1000) + 86_400 * (role === 'teacher' ? 90 : 30)
  const payload = { role, sub: subjectId, exp: expires, ...extra }
  const encoded = base64Url(encoder.encode(JSON.stringify(payload)))
  const signature = base64Url(await hmac(env.AUTH_SECRET, encoded))
  return {
    token: `${encoded}.${signature}`,
    role,
    subjectId,
    expiresAt: new Date(expires * 1000).toISOString(),
    ...Object.fromEntries(Object.entries(extra).filter(([key]) => ['studentCode', 'joinCode'].includes(key))),
  }
}

async function authenticate(request, env, role) {
  const authorization = request.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) return null
  try {
    const [encoded, signature] = authorization.slice(7).split('.', 2)
    const expected = base64Url(await hmac(env.AUTH_SECRET, encoded))
    if (!constantTimeEqual(signature, expected)) return null
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encoded)))
    if (Number(payload.exp || 0) <= Math.floor(Date.now() / 1000)) return null
    if (role && payload.role !== role) return null
    return payload
  } catch {
    return null
  }
}

async function hashPin(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits'])
  const digest = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PIN_ITERATIONS }, material, 256))
  return `${PIN_ITERATIONS}$${base64Url(salt, true)}$${base64Url(digest, true)}`
}

async function verifyPin(pin, stored) {
  try {
    const [iterations, salt, expected] = stored.split('$', 3)
    const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits'])
    const digest = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: decodeBase64Url(salt), iterations: Number(iterations) }, material, 256))
    return constantTimeEqual(base64Url(digest, true), expected)
  } catch {
    return false
  }
}

const readBody = async (request) => {
  try { return await request.json() } catch { return {} }
}

const profileFromRow = (row) => ({
  playerId: row.student_id,
  studentCode: row.student_code,
  name: row.display_name,
  group: row.group_name,
  joinCode: row.join_code,
  avatarId: Number(row.avatar_id),
  createdAt: Number(row.created_at),
})

async function registerStudent(request, env) {
  const data = await readBody(request)
  const displayName = String(data.displayName || '').trim().slice(0, 32)
  const joinCode = String(data.joinCode || '').trim().toUpperCase().slice(0, 24)
  const pin = String(data.pin || '')
  const avatarId = Number(data.avatarId)
  if (!displayName || joinCode !== JOIN_CODE || !/^\d{6}$/.test(pin) || avatarId < 1 || avatarId > 10) {
    return json({ message: joinCode !== JOIN_CODE ? 'Group not found. Check the code with your teacher.' : 'Check the name, avatar, and 6-digit PIN.' }, 400, request)
  }
  const stem = displayName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PLAYER'
  let studentCode = ''
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = `${stem}-${Math.floor(Math.random() * 900) + 100}`
    if (!await env.DB.prepare('SELECT student_id FROM students WHERE student_code = ?').bind(candidate).first()) {
      studentCode = candidate
      break
    }
  }
  if (!studentCode) return json({ message: 'Could not create an ID. Try again.' }, 503, request)
  const studentId = crypto.randomUUID()
  const createdAt = Date.now()
  await env.DB.prepare(`INSERT INTO students
    (student_id, student_code, display_name, group_name, join_code, avatar_id, pin_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(studentId, studentCode, displayName, GROUP_NAME, JOIN_CODE, avatarId, await hashPin(pin), createdAt, createdAt).run()
  const row = await env.DB.prepare('SELECT * FROM students WHERE student_id = ?').bind(studentId).first()
  return json({ session: await issueToken(env, 'student', studentId, { studentCode, joinCode: JOIN_CODE }), profile: profileFromRow(row), game: null }, 201, request)
}

async function loginStudent(request, env) {
  const data = await readBody(request)
  const studentCode = String(data.studentCode || '').trim().toUpperCase().slice(0, 40)
  const pin = String(data.pin || '')
  if (!/^[A-Z0-9]{2,12}-\d{3}$/.test(studentCode) || !/^\d{6}$/.test(pin)) {
    return json({ message: 'Explorer ID or PIN is not correct.' }, 401, request)
  }
  const row = await env.DB.prepare('SELECT * FROM students WHERE student_code = ?').bind(studentCode).first()
  if (row && !row.pin_hash) {
    return json({ message: 'This account needs a new PIN from your teacher. Your progress is safe on the original device.' }, 409, request)
  }
  if (!row || !await verifyPin(pin, row.pin_hash)) {
    return json({ message: 'Explorer ID or PIN is not correct.' }, 401, request)
  }
  const snapshot = await env.DB.prepare('SELECT payload FROM snapshots WHERE student_id = ?').bind(row.student_id).first()
  return json({
    session: await issueToken(env, 'student', row.student_id, { studentCode, joinCode: row.join_code }),
    profile: profileFromRow(row),
    game: snapshot ? JSON.parse(snapshot.payload) : null,
  }, 200, request)
}

async function loginTeacher(request, env) {
  const data = await readBody(request)
  const email = String(data.email || '').trim().toLowerCase()
  const allowedEmails = [String(env.TEACHER_EMAIL || '').toLowerCase(), 'sophie@powerup2.local']
  const emailMatches = allowedEmails.some((allowedEmail) => constantTimeEqual(email, allowedEmail))
  if (!emailMatches || !constantTimeEqual(String(data.password || ''), env.TEACHER_PASSWORD || '')) {
    return json({ message: 'Email or password is not correct.' }, 401, request)
  }
  return json({ session: await issueToken(env, 'teacher', 'teacher-power-up-2', { joinCode: JOIN_CODE }) }, 200, request)
}

async function syncEvents(request, env) {
  const identity = await authenticate(request, env, 'student')
  if (!identity) return json({ message: 'Please sign in again.' }, 401, request)
  const data = await readBody(request)
  if (!Array.isArray(data.events) || data.events.length > 50) return json({ message: 'Send up to 50 sync events.' }, 400, request)
  const acknowledgedIds = []
  for (const event of data.events) {
    if (!event || event.studentId !== identity.sub || !['game.snapshot', 'attempt.recorded'].includes(event.type)) continue
    if (!event.id || typeof event.payload !== 'object') continue
    const eventId = String(event.id).slice(0, 80)
    const duplicate = await env.DB.prepare('SELECT event_id FROM sync_events WHERE event_id = ?').bind(eventId).first()
    if (duplicate) {
      acknowledgedIds.push(event.id)
      continue
    }
    if (event.type === 'game.snapshot') {
      const profile = event.payload.profile || {}
      if (String(profile.playerId || '') !== identity.sub) continue
      const studentCode = String(identity.studentCode || profile.studentCode || `PLAYER-${identity.sub.slice(0, 3)}`).toUpperCase().slice(0, 40)
      const now = Date.now()
      const restoredProfile = await env.DB.prepare('SELECT student_id FROM students WHERE student_code = ?').bind(studentCode).first()
      if (restoredProfile && restoredProfile.student_id !== identity.sub) {
        await env.DB.batch([
          env.DB.prepare('UPDATE snapshots SET student_id = ? WHERE student_id = ?').bind(identity.sub, restoredProfile.student_id),
          env.DB.prepare('UPDATE attempts SET student_id = ? WHERE student_id = ?').bind(identity.sub, restoredProfile.student_id),
          env.DB.prepare('UPDATE sync_events SET student_id = ? WHERE student_id = ?').bind(identity.sub, restoredProfile.student_id),
          env.DB.prepare('DELETE FROM students WHERE student_id = ?').bind(restoredProfile.student_id),
        ])
      }
      await env.DB.prepare(`INSERT INTO students
        (student_id, student_code, display_name, group_name, join_code, avatar_id, pin_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET student_code=excluded.student_code, display_name=excluded.display_name,
          group_name=excluded.group_name, join_code=excluded.join_code, avatar_id=excluded.avatar_id, updated_at=excluded.updated_at`)
        .bind(identity.sub, studentCode, String(profile.name || studentCode).slice(0, 32), String(profile.group || GROUP_NAME), String(profile.joinCode || identity.joinCode || JOIN_CODE).toUpperCase(), Number(profile.avatarId || 1), Number(profile.createdAt || now), now).run()
      await env.DB.prepare(`INSERT INTO snapshots (student_id, payload, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at`)
        .bind(identity.sub, JSON.stringify(event.payload), now).run()
    } else {
      await env.DB.prepare('INSERT OR IGNORE INTO attempts (student_id, event_id, occurred_at, payload) VALUES (?, ?, ?, ?)')
        .bind(identity.sub, eventId, String(event.occurredAt || new Date().toISOString()), JSON.stringify(event.payload)).run()
    }
    await env.DB.prepare('INSERT OR IGNORE INTO sync_events (event_id, student_id, received_at) VALUES (?, ?, ?)')
      .bind(eventId, identity.sub, Date.now()).run()
    acknowledgedIds.push(event.id)
  }
  return json({ acknowledgedIds }, 200, request)
}

async function teacherDashboard(request, env) {
  const identity = await authenticate(request, env, 'teacher')
  if (!identity) return json({ message: 'Teacher login required.' }, 401, request)
  const { results: rows } = await env.DB.prepare('SELECT * FROM students WHERE join_code = ? ORDER BY display_name COLLATE NOCASE').bind(identity.joinCode || JOIN_CODE).all()
  const students = []
  for (const row of rows) {
    const snapshot = await env.DB.prepare('SELECT payload FROM snapshots WHERE student_id = ?').bind(row.student_id).first()
    const { results: attempts } = await env.DB.prepare('SELECT event_id, occurred_at, payload FROM attempts WHERE student_id = ? ORDER BY occurred_at DESC LIMIT 80').bind(row.student_id).all()
    students.push({
      profile: profileFromRow(row),
      game: snapshot ? JSON.parse(snapshot.payload) : null,
      recentAttempts: attempts.map((attempt) => ({ id: attempt.event_id, occurredAt: attempt.occurred_at, payload: JSON.parse(attempt.payload) })),
    })
  }
  return json({ group: { joinCode: JOIN_CODE, displayName: GROUP_NAME }, students }, 200, request)
}

async function teacherStudentAction(request, env, action) {
  if (!await authenticate(request, env, 'teacher')) return json({ message: 'Teacher login required.' }, 401, request)
  const data = await readBody(request)
  const studentCode = String(data.studentCode || '').trim().toUpperCase().slice(0, 40)
  const row = await env.DB.prepare('SELECT student_id FROM students WHERE student_code = ? AND join_code = ?').bind(studentCode, JOIN_CODE).first()
  if (!row) return json({ message: 'Student not found in this group.' }, 404, request)
  if (action === 'reset') {
    const pin = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
    await env.DB.prepare('UPDATE students SET pin_hash = ?, updated_at = ? WHERE student_id = ?').bind(await hashPin(pin), Date.now(), row.student_id).run()
    return json({ ok: true, temporaryPin: pin }, 200, request)
  }
  await env.DB.batch([
    env.DB.prepare('DELETE FROM snapshots WHERE student_id = ?').bind(row.student_id),
    env.DB.prepare('DELETE FROM attempts WHERE student_id = ?').bind(row.student_id),
    env.DB.prepare('DELETE FROM sync_events WHERE student_id = ?').bind(row.student_id),
    env.DB.prepare('DELETE FROM students WHERE student_id = ?').bind(row.student_id),
  ])
  return json({ ok: true }, 200, request)
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return corsPreflight(request)
    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/'
    try {
      if (request.method === 'GET' && path === '/health') return json({ ok: true, service: 'power-up-2-cloudflare' }, 200, request)
      if (request.method === 'POST' && path === '/student/register') return registerStudent(request, env)
      if (request.method === 'POST' && path === '/student/login') return loginStudent(request, env)
      if (request.method === 'POST' && path === '/teacher/login') return loginTeacher(request, env)
      if (request.method === 'POST' && path === '/sync/events') return syncEvents(request, env)
      if (request.method === 'GET' && path === '/teacher/dashboard') return teacherDashboard(request, env)
      if (request.method === 'POST' && path === '/teacher/students/reset-pin') return teacherStudentAction(request, env, 'reset')
      if (request.method === 'POST' && path === '/teacher/students/delete') return teacherStudentAction(request, env, 'delete')
      return json({ message: 'Route not found.' }, 404, request)
    } catch (error) {
      console.error(error)
      return json({ message: 'Cloud error. Progress is still safe on the device.' }, 500, request)
    }
  },
}
