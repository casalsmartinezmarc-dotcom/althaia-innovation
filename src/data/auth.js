// ─── Compte admin fix (no es pot eliminar ni modificar) ──────────────────────
export const ADMIN_ACCOUNT = {
  id:       'admin',
  name:     'Administrador',
  email:    'admin@althaia.cat',
  password: 'althaia2024',
  role:     'admin',
  service:  'Administració',
  active:   true,
  created_at: '2024-01-01',
}

const USERS_KEY   = 'althaia_users'
const SESSION_KEY = 'althaia_session'

// ─── Carregar usuaris registrats ──────────────────────────────────────────────
export function loadUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

// ─── Guardar usuaris ──────────────────────────────────────────────────────────
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// ─── Tots els usuaris (admin + registrats) ────────────────────────────────────
export function getAllUsers() {
  return [ADMIN_ACCOUNT, ...loadUsers()]
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function login(email, password) {
  const all = getAllUsers()
  const user = all.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return { ok: false, error: 'No existeix cap compte amb aquest correu.' }
  if (user.password !== password) return { ok: false, error: 'Contrasenya incorrecta.' }
  if (!user.active) return { ok: false, error: 'Aquest compte està desactivat. Contacta l\'administrador.' }
  // Guardar sessió (sense password)
  const session = { id: user.id, name: user.name, email: user.email, role: user.role, service: user.service }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, user: session }
}

// ─── Registre ─────────────────────────────────────────────────────────────────
export function register({ name, email, password, service }) {
  const all = getAllUsers()
  if (all.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'Ja existeix un compte amb aquest correu.' }
  }
  const newUser = {
    id:         `user_${Date.now()}`,
    name:       name.trim(),
    email:      email.trim().toLowerCase(),
    password,
    role:       'professional',
    service:    service.trim(),
    active:     true,
    created_at: new Date().toISOString().split('T')[0],
  }
  const users = loadUsers()
  saveUsers([...users, newUser])
  // Auto-login
  const session = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, service: newUser.service }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, user: session }
}

// ─── Sessió actual ────────────────────────────────────────────────────────────
export function getSession() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
