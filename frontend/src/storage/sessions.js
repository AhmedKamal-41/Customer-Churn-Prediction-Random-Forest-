const STORAGE_KEY = 'churn_sessions_v1'
const ACTIVE_ID_KEY = 'churn_active_session_id'
const MAX_SESSIONS = 30

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function defaultTitle() {
  const d = new Date()
  const short = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `New session (${short})`
}

function readSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessions(sessions) {
  const sorted = [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  const trimmed = sorted.length > MAX_SESSIONS ? sorted.slice(0, MAX_SESSIONS) : sorted
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('sessions:changed'))
}

export function listSessions() {
  const sessions = readSessions()
  return [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

/** Returns the full session including messages, or null if not found. */
export function getSession(id) {
  const sessions = readSessions()
  return sessions.find((s) => s.id === id) ?? null
}

export function updateSession(id, partial) {
  const session = getSession(id)
  if (!session) return null
  const now = new Date().toISOString()
  const updated = { ...session, ...partial, updatedAt: now }
  const sessions = readSessions()
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx === -1) return null
  const next = sessions.map((s, i) => (i === idx ? updated : s))
  writeSessions(next)
  return updated
}

/** Appends a message to the session. Message should have id, role, content, createdAt; type and payload optional. */
export function appendMessage(sessionId, message) {
  const session = getSession(sessionId)
  if (!session) return null
  const normalized = {
    id: message.id ?? genId(),
    role: message.role ?? 'user',
    content: message.content ?? '',
    createdAt: message.createdAt ?? Date.now(),
    ...(message.type != null && { type: message.type }),
    ...(message.payload != null && { payload: message.payload }),
  }
  const messages = [...(session.messages ?? []), normalized]
  return updateSession(sessionId, { messages })
}

/** Overwrites session.messages with a copy of the given array. Ensures each message has id and createdAt. */
export function replaceMessages(sessionId, messages) {
  const session = getSession(sessionId)
  if (!session) return null
  const copy = Array.isArray(messages)
    ? messages.map((m) => ({
        id: m.id ?? genId(),
        role: m.role ?? 'user',
        content: m.content ?? '',
        createdAt: m.createdAt ?? Date.now(),
        ...(m.type != null && { type: m.type }),
        ...(m.payload != null && { payload: m.payload }),
      }))
    : []
  return updateSession(sessionId, { messages: copy })
}

export function createSession(partial) {
  const now = new Date().toISOString()
  const session = {
    id: partial?.id ?? genId(),
    title: partial?.title ?? defaultTitle(),
    createdAt: partial?.createdAt ?? now,
    updatedAt: now,
    messages: partial?.messages ?? [],
    answers: partial?.answers ?? {},
    status: partial?.status ?? 'collecting',
    prediction: partial?.prediction ?? null,
    ui: partial?.ui ?? { rightTab: 'profile' },
    currentStepIndex: partial?.currentStepIndex ?? 0,
    editStepKey: partial?.editStepKey ?? null,
  }
  const sessions = readSessions()
  const existing = sessions.findIndex((s) => s.id === session.id)
  let next = existing >= 0 ? sessions.map((s, i) => (i === existing ? session : s)) : [session, ...sessions]
  next = [...next].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  if (next.length > MAX_SESSIONS) next = next.slice(0, MAX_SESSIONS)
  writeSessions(next)
  return session
}

export function upsertSession(session) {
  const now = new Date().toISOString()
  const updated = { ...session, updatedAt: now }
  const sessions = readSessions()
  const idx = sessions.findIndex((s) => s.id === updated.id)
  const next = idx >= 0
    ? sessions.map((s, i) => (i === idx ? updated : s))
    : [updated, ...sessions]
  writeSessions(next)
  return updated
}

export function deleteSession(id) {
  const sessions = readSessions().filter((s) => s.id !== id)
  writeSessions(sessions)
  if (getActiveSessionId() === id) setActiveSessionId(null)
}

export function renameSession(id, title) {
  const session = getSession(id)
  if (!session) return null
  return upsertSession({ ...session, title })
}

export function getActiveSessionId() {
  try {
    return localStorage.getItem(ACTIVE_ID_KEY) || null
  } catch {
    return null
  }
}

export function setActiveSessionId(id) {
  try {
    if (id == null) localStorage.removeItem(ACTIVE_ID_KEY)
    else localStorage.setItem(ACTIVE_ID_KEY, String(id))
  } catch {}
}

export function exportSessionJson(id) {
  const session = getSession(id)
  return session ? JSON.stringify(session, null, 2) : ''
}
