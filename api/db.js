/**
 * Vercel Serverless Function — /api/db
 *
 * Proxy privilegiat per a totes les escriptures a Supabase (insert/update/
 * delete/deleteAll). Fa servir la SUPABASE_SERVICE_ROLE_KEY (només al
 * servidor, mai al navegador) perquè la clau anon del client es pugui
 * restringir a només lectura (veure database/migration-2-security.sql).
 *
 * POST { table, op: 'insert'|'update'|'delete'|'deleteAll', id?, data? }
 */
import { getAdminClient, setCors } from './_authHelpers.js'

// Per cada taula, quines operacions es permeten via aquest proxy genèric.
// app_users NOMÉS admet update/delete — crear un compte sempre passa per
// /api/register (l'únic lloc que fa el hash de la contrasenya).
const TABLE_OPS = {
  projects:         ['insert', 'update', 'delete', 'deleteAll'],
  project_tasks:    ['insert', 'update', 'delete'],
  timeline_events:  ['insert', 'delete'],
  project_feedback: ['insert', 'delete'],
  ideas_bank:       ['insert', 'update', 'delete'],
  app_users:        ['update', 'delete'],
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { table, op, id, data } = req.body ?? {}
  const allowedOps = TABLE_OPS[table]
  if (!allowedOps)              return res.status(400).json({ error: `Taula no permesa: ${table}` })
  if (!allowedOps.includes(op)) return res.status(400).json({ error: `Operació no permesa a "${table}": ${op}` })

  const admin = getAdminClient()
  if (!admin) {
    return res.status(503).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY no configurada al servidor (Vercel → Settings → Environment Variables)',
    })
  }

  // Mai permetre tocar el hash de contrasenya des d'aquí.
  const safeData = data && typeof data === 'object' && !Array.isArray(data)
    ? Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'password_hash'))
    : data

  try {
    let result
    if (op === 'insert') {
      if (!safeData) return res.status(400).json({ error: 'Falta "data"' })
      result = await admin.from(table).insert(safeData)
    } else if (op === 'update') {
      if (id === undefined) return res.status(400).json({ error: 'Falta "id"' })
      if (!safeData) return res.status(400).json({ error: 'Falta "data"' })
      result = await admin.from(table).update(safeData).eq('id', id)
    } else if (op === 'delete') {
      if (id === undefined) return res.status(400).json({ error: 'Falta "id"' })
      result = await admin.from(table).delete().eq('id', id)
    } else if (op === 'deleteAll') {
      result = await admin.from(table).delete().gt('id', 0)
    }

    if (result.error) return res.status(500).json({ error: result.error.message })
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
