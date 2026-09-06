import { createClient } from '@supabase/supabase-js'
import { encryptText, decryptText, encryptJSON, decryptJSON } from './encryption'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const hasDB    = Boolean(supabase)

// ── Column whitelist ──────────────────────────────────────────────────────────
export const PROJECT_COLS = [
  'id', 'title', 'description', 'service', 'owner_name',
  'current_phase', 'status', 'priority', 'budget', 'estimated_roi',
  'tags', 'ai_related', 'impact',
  'wizard_activacio', 'wizard_ideas', 'wizard_selected',
  'wizard_experimental', 'wizard_validacio', 'wizard_dissenyFinal',
  'validation_score', 'dictamen', 'methodology', 'validation_types',
  'enoll_criteria', 'pilot_data', 'evaluation_data', 'created_at', 'updated_at',
]

// Camps sensibles per encriptar
const TEXT_ENC = ['title', 'description', 'service', 'owner_name', 'impact', 'dictamen', 'methodology']
const JSON_ENC = [
  'tags', 'wizard_activacio', 'wizard_ideas', 'wizard_selected',
  'wizard_experimental', 'wizard_validacio', 'wizard_dissenyFinal',
  'validation_types', 'enoll_criteria', 'pilot_data', 'evaluation_data',
]

// ── Projectes ─────────────────────────────────────────────────────────────────

/** Prepara una fila per a Supabase (encriptant camps sensibles) */
export function projectToRow(p) {
  const row = {}
  for (const col of PROJECT_COLS) {
    const v = p[col]
    if (v === undefined) { row[col] = null; continue }
    if (TEXT_ENC.includes(col)) row[col] = encryptText(v)
    else if (JSON_ENC.includes(col)) row[col] = encryptJSON(v)
    else row[col] = v
  }
  return row
}

/** Desencripta un projecte llegit de Supabase */
export function decryptProject(row) {
  const p = { ...row }
  for (const col of TEXT_ENC) { if (p[col] != null) p[col] = decryptText(p[col]) }
  for (const col of JSON_ENC) { if (p[col] != null) p[col] = decryptJSON(p[col]) }
  return p
}

/** Encripta un objecte d'actualització parcial de projecte */
export function encryptProjectUpdates(updates) {
  const out = { ...updates }
  for (const col of TEXT_ENC) { if (out[col] !== undefined) out[col] = encryptText(out[col]) }
  for (const col of JSON_ENC) { if (out[col] !== undefined) out[col] = encryptJSON(out[col]) }
  return out
}

// ── Tasques ───────────────────────────────────────────────────────────────────

const TASK_TEXT_ENC = ['title', 'description', 'assigned_to']

/** Prepara camps de tasca per a Supabase */
export function encryptTaskFields(t) {
  const out = { ...t }
  for (const f of TASK_TEXT_ENC) { if (out[f] != null) out[f] = encryptText(out[f]) }
  return out
}

/** Desencripta una tasca llegida de Supabase */
export function decryptTask(row) {
  const t = { ...row, isCustom: true, due_date: row.due_date || '', assigned_to: row.assigned_to || '' }
  for (const f of TASK_TEXT_ENC) { if (t[f] != null) t[f] = decryptText(t[f]) }
  return t
}

/** Converteix files de project_tasks a { [projectId]: [task,...] } */
export function rowsToTaskMap(rows) {
  const map = {}
  for (const r of rows) {
    const pid = r.project_id
    if (!map[pid]) map[pid] = []
    map[pid].push(decryptTask(r))
  }
  return map
}

// ── Esdeveniments timeline ────────────────────────────────────────────────────

const EVENT_TEXT_ENC = ['title', 'notes']

/** Prepara camps d'event per a Supabase */
export function encryptEventFields(e) {
  const out = { ...e }
  for (const f of EVENT_TEXT_ENC) { if (out[f] != null) out[f] = encryptText(out[f]) }
  return out
}

/** Desencripta un event llegit de Supabase */
export function decryptEvent(row) {
  const e = { ...row, isCustom: true, notes: row.notes || '' }
  for (const f of EVENT_TEXT_ENC) { if (e[f] != null) e[f] = decryptText(e[f]) }
  return e
}

/** Converteix files de timeline_events a { [projectId]: [event,...] } */
export function rowsToEventMap(rows) {
  const map = {}
  for (const r of rows) {
    const pid = r.project_id
    if (!map[pid]) map[pid] = []
    map[pid].push(decryptEvent(r))
  }
  return map
}

/** Extreu només els camps vàlids per a Supabase (sense encriptació, per usos interns) */
export function projectToRowRaw(p) {
  const row = {}
  for (const col of PROJECT_COLS) {
    const v = p[col]
    row[col] = v === undefined ? null : v
  }
  return row
}

// ── Feedback ──────────────────────────────────────────────────────────────────

const FEEDBACK_TEXT_ENC = ['message']

/** Prepara feedback per a Supabase */
export function encryptFeedbackFields(f) {
  const out = { ...f }
  for (const col of FEEDBACK_TEXT_ENC) { if (out[col] != null) out[col] = encryptText(out[col]) }
  return out
}

/** Desencripta feedback llegit de Supabase */
function decryptFeedback(row) {
  const f = { ...row, isCustom: true }
  for (const col of FEEDBACK_TEXT_ENC) { if (f[col] != null) f[col] = decryptText(f[col]) }
  return f
}

/** Converteix files de project_feedback a { [projectId]: [feedback,...] } */
export function rowsToFeedbackMap(rows) {
  const map = {}
  for (const r of rows) {
    const pid = r.project_id
    if (!map[pid]) map[pid] = []
    map[pid].push(decryptFeedback(r))
  }
  return map
}

// ── Banc d'idees ──────────────────────────────────────────────────────────────

export const IDEA_COLS = [
  'id', 'title', 'description', 'origin', 'submitter', 'service',
  'status', 'screening_result', 'screening_notes', 'screening_date',
  'priority_level', 'priority_notes', 'priority_date', 'created_at',
]

const IDEA_TEXT_ENC = ['title', 'description', 'submitter', 'screening_notes', 'priority_notes']

/** Prepara una idea per a Supabase (encriptant camps sensibles) */
export function ideaToRow(idea) {
  const row = {}
  for (const col of IDEA_COLS) {
    const v = idea[col]
    row[col] = v === undefined ? null : (IDEA_TEXT_ENC.includes(col) ? encryptText(v) : v)
  }
  return row
}

/** Desencripta una idea llegida de Supabase */
export function decryptIdea(row) {
  const i = { ...row }
  for (const col of IDEA_TEXT_ENC) { if (i[col] != null) i[col] = decryptText(i[col]) }
  return i
}

/** Encripta una actualització parcial d'idea (no toca els camps absents) */
export function encryptIdeaUpdates(updates) {
  const out = { ...updates }
  for (const col of IDEA_TEXT_ENC) { if (out[col] !== undefined) out[col] = encryptText(out[col]) }
  return out
}
