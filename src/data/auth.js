const ADMIN_EMAIL    = 'admin@althaia.cat'
const ADMIN_PASSWORD = 'althaia2024'
const SESSION_KEY     = 'althaia_session'
const USERS_KEY        = 'althaia_users'

const ADMIN_RECORD = {
  id: 'admin', name: 'Administrador', email: ADMIN_EMAIL,
  role: 'admin', service: 'Administració',
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

// ─── Fallback local (mentre el backend no tingui SUPABASE_SERVICE_ROLE_KEY) ───
// Un cop configurada la clau a Vercel, login/register fan servir sempre
// Supabase i aquest fallback deixa de ser necessari (queda com a xarxa de
// seguretat perquè l'app professional no es trenqui mentrestant).

function loadLocalUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function saveLocalUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function localLogin(email, password) {
  const user = loadLocalUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user)                      return { ok: false, error: 'No existeix cap compte amb aquest correu.' }
  if (user.password !== password) return { ok: false, error: 'Contrasenya incorrecta.' }
  if (user.active === false)      return { ok: false, error: "Compte desactivat. Contacta l'administrador." }
  return { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, service: user.service } }
}

function localRegister({ name, email, password, service }) {
  const all = loadLocalUsers()
  if (all.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, error: 'Ja existeix un compte amb aquest correu.' }
  const newUser = {
    id: `user_${Date.now()}`, name, email, password, role: 'professional', service,
    active: true, created_at: new Date().toISOString().split('T')[0],
  }
  saveLocalUsers([...all, newUser])
  return { ok: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, service: newUser.service } }
}

/** fetch amb timeout dur — mai es queda penjat esperant el backend */
async function fetchJSON(url, body, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res  = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const json = await res.json().catch(() => ({}))
    if (res.status === 503) return { ok: false, error: 'BACKEND_NOT_CONFIGURED' }
    if (!res.ok && !('ok' in json)) return { ok: false, error: json.error || `Error ${res.status}` }
    return json
  } catch (err) {
    if (err.name === 'AbortError') return { ok: false, error: 'El servidor triga massa a respondre. Torna-ho a provar.' }
    return { ok: false, error: 'BACKEND_NOT_CONFIGURED' }
  } finally {
    clearTimeout(timer)
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const lEmail = email.trim().toLowerCase()

  // L'admin és sempre local i instantani — funciona des de qualsevol
  // dispositiu sense dependre del backend.
  if (lEmail === ADMIN_EMAIL) {
    if (password !== ADMIN_PASSWORD) return { ok: false, error: 'Contrasenya incorrecta.' }
    saveSession(ADMIN_RECORD)
    return { ok: true, user: ADMIN_RECORD }
  }

  // Comptes professionals: Supabase (multi-dispositiu). Si el backend
  // encara no està configurat, fallback a localStorage (només aquest navegador).
  let result = await fetchJSON('/api/login', { email: lEmail, password })
  if (result.error === 'BACKEND_NOT_CONFIGURED') result = localLogin(lEmail, password)
  if (result.ok) saveSession(result.user)
  return result
}

// ─── Registre ─────────────────────────────────────────────────────────────────

export async function register({ name, email, password, service }) {
  const lEmail = email.trim().toLowerCase()
  let result = await fetchJSON('/api/register', { name: name.trim(), email: lEmail, password, service: service.trim() })
  if (result.error === 'BACKEND_NOT_CONFIGURED') result = localRegister({ name: name.trim(), email: lEmail, password, service: service.trim() })
  if (result.ok) saveSession(result.user)
  return result
}

// ─── Sessió ───────────────────────────────────────────────────────────────────

export function getSession() {
  try { const s = sessionStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null }
  catch { return null }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

/** Comptes registrats només localment (fallback mentre no hi ha backend) */
export function getLocalOnlyUsers() {
  return loadLocalUsers().map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, service: u.service,
    active: u.active, created_at: u.created_at, localOnly: true,
  }))
}

export function updateLocalUser(id, updates) {
  saveLocalUsers(loadLocalUsers().map(u => u.id === id ? { ...u, ...updates } : u))
}

export function deleteLocalUser(id) {
  saveLocalUsers(loadLocalUsers().filter(u => u.id !== id))
}
