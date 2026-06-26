import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase client — null si les variables d'entorn no estan configurades.
 * En aquest cas l'app fa servir localStorage com a fallback automàtic.
 */
export const supabase = url && key ? createClient(url, key) : null

/** true quan Supabase està configurat i actiu */
export const hasDB = Boolean(supabase)

// ── Column whitelist per evitar errors d'inserció ─────────────────────────────
export const PROJECT_COLS = [
  'id', 'title', 'description', 'service', 'owner_name',
  'current_phase', 'status', 'priority', 'budget', 'estimated_roi',
  'tags', 'ai_related', 'impact',
  'wizard_activacio', 'wizard_ideas', 'wizard_selected',
  'wizard_experimental', 'wizard_validacio', 'wizard_dissenyFinal',
  'validation_score', 'dictamen', 'methodology', 'validation_types',
  'enoll_criteria', 'created_at', 'updated_at',
]

/** Extreu només els camps vàlids per a Supabase */
export function projectToRow(p) {
  const row = {}
  for (const col of PROJECT_COLS) {
    const v = p[col]
    row[col] = v === undefined ? null : v
  }
  return row
}

/** Converteix files de project_tasks a { [projectId]: [task,...] } */
export function rowsToTaskMap(rows) {
  const map = {}
  for (const r of rows) {
    const pid = r.project_id
    if (!map[pid]) map[pid] = []
    map[pid].push({ ...r, isCustom: true, due_date: r.due_date || '', assigned_to: r.assigned_to || '' })
  }
  return map
}

/** Converteix files de timeline_events a { [projectId]: [event,...] } */
export function rowsToEventMap(rows) {
  const map = {}
  for (const r of rows) {
    const pid = r.project_id
    if (!map[pid]) map[pid] = []
    map[pid].push({ ...r, isCustom: true, notes: r.notes || '' })
  }
  return map
}
