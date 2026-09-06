/**
 * Vercel Serverless Function — /api/register
 * POST { name, email, password, service } → { ok, user } | { ok: false, error }
 */
import { getAdminClient, hashPassword, setCors } from './_authHelpers.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, password, service } = req.body ?? {}
  if (!name || !email || !password) return res.status(400).json({ ok: false, error: 'Falten camps obligatoris.' })
  if (String(password).length < 6) return res.status(400).json({ ok: false, error: 'La contrasenya ha de tenir mínim 6 caràcters.' })

  const admin = getAdminClient()
  if (!admin) return res.status(503).json({ ok: false, error: 'Backend no configurat (SUPABASE_SERVICE_ROLE_KEY).' })

  const lEmail = String(email).trim().toLowerCase()
  const { data: existing } = await admin.from('app_users').select('id').eq('email', lEmail).maybeSingle()
  if (existing) return res.status(200).json({ ok: false, error: 'Ja existeix un compte amb aquest correu.' })

  const newUser = {
    id:            `user_${Date.now()}`,
    name:          String(name).trim(),
    email:         lEmail,
    password_hash: hashPassword(password),
    role:          'professional',
    service:       String(service || '').trim(),
    active:        true,
    created_at:    new Date().toISOString().split('T')[0],
  }

  const { error: insErr } = await admin.from('app_users').insert(newUser)
  if (insErr) return res.status(500).json({ ok: false, error: insErr.message })

  return res.status(200).json({
    ok: true,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, service: newUser.service },
  })
}
