/**
 * Vercel Serverless Function — /api/users-list
 * GET → { users: [...] }  (mai retorna password_hash)
 */
import { getAdminClient, setCors } from './_authHelpers.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const admin = getAdminClient()
  if (!admin) return res.status(503).json({ error: 'Backend no configurat (SUPABASE_SERVICE_ROLE_KEY).' })

  const { data, error } = await admin
    .from('app_users')
    .select('id, name, email, role, service, active, created_at')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ users: data || [] })
}
