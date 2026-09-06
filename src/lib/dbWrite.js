import { supabase } from './supabase'

async function directWrite(table, op, id, data) {
  let result
  if (op === 'insert')         result = await supabase.from(table).insert(data)
  else if (op === 'update')    result = await supabase.from(table).update(data).eq('id', id)
  else if (op === 'delete')    result = await supabase.from(table).delete().eq('id', id)
  else if (op === 'deleteAll') result = await supabase.from(table).delete().gt('id', 0)
  if (result.error) throw new Error(result.error.message)
  return { ok: true }
}

/**
 * Totes les escriptures (insert/update/delete) passen pel backend /api/db,
 * que fa servir la service role key de Supabase — així la clau anon del
 * navegador es pot restringir a només lectura (veure database/migration-2-security.sql).
 *
 * Fallback: si el backend encara no té SUPABASE_SERVICE_ROLE_KEY configurada
 * (503) o no es pot contactar, escriu directament amb la clau anon — perquè
 * l'app segueixi funcionant igual que abans mentre no es faci la migració.
 * Un cop configurada la clau i aplicat el tancament de RLS, aquest fallback
 * ja no s'arriba a fer servir (la clau anon deixa de tenir permís d'escriptura).
 */
export async function dbWrite(table, op, { id, data, noFallback } = {}) {
  try {
    const res = await fetch('/api/db', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ table, op, id, data }),
    })
    if (res.status === 503) throw new Error('SERVICE_KEY_MISSING')
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
    return json
  } catch (err) {
    const canFallback = !noFallback && supabase && (err.message === 'SERVICE_KEY_MISSING' || err instanceof TypeError)
    if (canFallback) return directWrite(table, op, id, data)
    throw err
  }
}
