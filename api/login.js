/**
 * Vercel Serverless Function — /api/login
 * POST { email, password } → { ok, user } | { ok: false, error }
 *
 * L'usuari admin NO passa per aquí (es valida al client, veure src/data/auth.js).
 * Aquest endpoint només és per a comptes professionals guardats a Supabase
 * (taula app_users), que no té cap policy d'accés anon — només aquest
 * backend, amb la service role key, hi pot llegir.
 */
import { getAdminClient, verifyPassword, setCors } from './_authHelpers.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Falten credencials.' })

  const admin = getAdminClient()
  if (!admin) return res.status(503).json({ ok: false, error: 'Backend no configurat (SUPABASE_SERVICE_ROLE_KEY).' })

  const lEmail = String(email).trim().toLowerCase()
  const { data: user, error } = await admin.from('app_users').select('*').eq('email', lEmail).maybeSingle()

  if (error)  return res.status(500).json({ ok: false, error: error.message })
  if (!user)  return res.status(200).json({ ok: false, error: 'No existeix cap compte amb aquest correu.' })
  if (!verifyPassword(password, user.password_hash))
    return res.status(200).json({ ok: false, error: 'Contrasenya incorrecta.' })
  if (user.active === false)
    return res.status(200).json({ ok: false, error: "Compte desactivat. Contacta l'administrador." })

  return res.status(200).json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, service: user.service },
  })
}
