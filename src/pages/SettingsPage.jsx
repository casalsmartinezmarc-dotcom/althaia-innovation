import { useState, useRef } from 'react'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { supabase, hasDB, projectToRow } from '../lib/supabase'
import {
  Download, Upload, Trash2, Check, AlertTriangle,
  Database, Info, RefreshCw, HardDrive, Wifi, WifiOff,
} from 'lucide-react'
import clsx from 'clsx'

const STORAGE_KEY  = 'althaia_projects'
const TASKS_KEY    = 'althaia_project_tasks'
const TIMELINE_KEY = 'althaia_timeline_events'
const ALERTS_KEY   = 'althaia_alerts'

function Section({ title, icon: Icon, children, className }) {
  return (
    <div className={clsx('card p-6', className)}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-althaia-50 flex items-center justify-center">
          <Icon size={16} className="text-althaia-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { projects, resetToDemo } = useApp()
  const fileRef = useRef(null)

  const [exportDone,    setExportDone]    = useState(false)
  const [importMsg,     setImportMsg]     = useState(null)
  const [confirmReset,  setConfirmReset]  = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // ── Storage size (localStorage) ───────────────────────────────────────────
  function storageSize(key) {
    try { return (new Blob([localStorage.getItem(key) || '']).size / 1024).toFixed(1) }
    catch { return '0.0' }
  }

  const totalKB = [STORAGE_KEY, TASKS_KEY, TIMELINE_KEY, ALERTS_KEY]
    .reduce((acc, k) => acc + parseFloat(storageSize(k)), 0).toFixed(1)

  // ── Export ────────────────────────────────────────────────────────────────
  async function handleExport() {
    setExportLoading(true)
    let projectsData = [], tasksData = {}, eventsData = {}

    if (supabase) {
      const [{ data: p }, { data: t }, { data: e }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('project_tasks').select('*'),
        supabase.from('timeline_events').select('*'),
      ])
      projectsData = p || []
      for (const row of (t || [])) {
        const pid = row.project_id
        if (!tasksData[pid]) tasksData[pid] = []
        tasksData[pid].push(row)
      }
      for (const row of (e || [])) {
        const pid = row.project_id
        if (!eventsData[pid]) eventsData[pid] = []
        eventsData[pid].push(row)
      }
    } else {
      projectsData = JSON.parse(localStorage.getItem(STORAGE_KEY)  || '[]')
      tasksData    = JSON.parse(localStorage.getItem(TASKS_KEY)     || '{}')
      eventsData   = JSON.parse(localStorage.getItem(TIMELINE_KEY)  || '{}')
    }

    const payload = {
      exported_at:     new Date().toISOString(),
      app_version:     '1.0',
      source:          hasDB ? 'supabase' : 'localStorage',
      projects:        projectsData,
      project_tasks:   tasksData,
      timeline_events: eventsData,
      alerts:          JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `althaia-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportLoading(false)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2500)
  }

  // ── Import ────────────────────────────────────────────────────────────────
  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.projects || !Array.isArray(data.projects)) {
          setImportMsg({ type: 'error', text: 'Format invàlid: el fitxer no conté "projects".' })
          return
        }

        if (supabase) {
          setImportMsg({ type: 'info', text: 'Important dades a Supabase...' })

          // 1. Esborra tot (cascade elimina tasks i events)
          await supabase.from('projects').delete().gt('id', 0)

          // 2. Insereix projectes
          if (data.projects.length > 0) {
            const { error } = await supabase.from('projects').insert(data.projects.map(projectToRow))
            if (error) throw error
          }

          // 3. Insereix tasques
          const taskRows = Object.entries(data.project_tasks || {}).flatMap(([pid, tasks]) =>
            (tasks || []).map(t => ({
              id:          t.id,
              project_id:  Number(pid),
              title:       t.title,
              description: t.description || null,
              status:      t.status      || 'pending',
              priority:    t.priority    || 'mitja',
              due_date:    t.due_date    || null,
              assigned_to: t.assigned_to || null,
            }))
          )
          if (taskRows.length > 0) await supabase.from('project_tasks').insert(taskRows)

          // 4. Insereix timeline events
          const eventRows = Object.entries(data.timeline_events || {}).flatMap(([pid, events]) =>
            (events || []).map(ev => ({
              id:         ev.id,
              project_id: Number(pid),
              title:      ev.title,
              date:       ev.date,
              type:       ev.type  || 'milestone',
              notes:      ev.notes || null,
            }))
          )
          if (eventRows.length > 0) await supabase.from('timeline_events').insert(eventRows)

          setImportMsg({
            type: 'ok',
            text: `✅ Importats ${data.projects.length} projectes a Supabase. Recarregant la pàgina...`,
          })
        } else {
          // Fallback: localStorage
          localStorage.setItem(STORAGE_KEY,  JSON.stringify(data.projects))
          localStorage.setItem(TASKS_KEY,    JSON.stringify(data.project_tasks    || {}))
          localStorage.setItem(TIMELINE_KEY, JSON.stringify(data.timeline_events  || {}))
          localStorage.setItem(ALERTS_KEY,   JSON.stringify(data.alerts           || []))
          setImportMsg({
            type: 'ok',
            text: `✅ Importats ${data.projects.length} projectes al navegador. Recarregant...`,
          })
        }

        setTimeout(() => window.location.reload(), 2000)
      } catch (err) {
        console.error(err)
        setImportMsg({ type: 'error', text: `Error: ${err.message || 'Fitxer invàlid o error de connexió'}` })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  async function handleReset() {
    await resetToDemo()
    setConfirmReset(false)
  }

  return (
    <Layout title="Configuració" subtitle="Gestió de dades i persistència">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Estat de connexió ──────────────────────────────────────────── */}
        <div className={clsx('rounded-xl p-4 flex gap-3 border',
          hasDB
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        )}>
          {hasDB
            ? <Wifi size={18} className="text-green-500 shrink-0 mt-0.5" />
            : <WifiOff size={18} className="text-amber-500 shrink-0 mt-0.5" />
          }
          <div className="text-sm">
            {hasDB ? (
              <>
                <p className="font-semibold text-green-900 mb-1">✅ Connectat a Supabase (PostgreSQL)</p>
                <p className="text-green-700 text-xs leading-relaxed">
                  Les dades es guarden automàticament a la base de dades al núvol.
                  Els projectes són accessibles des de qualsevol navegador o dispositiu.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-amber-900 mb-1">⚠️ Sense base de dades — mode localStorage</p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Les variables <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> i{' '}
                  <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no estan configurades.
                  Les dades es guarden localment al navegador i desapareixeran si neteges la caché o canvies de navegador/dispositiu.
                </p>
                <p className="text-amber-700 text-xs mt-1.5">
                  👉 Consulta <strong>Configuració → Supabase</strong> a Vercel per afegir les variables d'entorn.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Estat de l'emmagatzematge ──────────────────────────────────── */}
        {!hasDB && (
          <Section title="Emmagatzematge local (localStorage)" icon={HardDrive}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Projectes',       key: STORAGE_KEY,  icon: '📁' },
                { label: 'Tasques',         key: TASKS_KEY,    icon: '✅' },
                { label: 'Timeline events', key: TIMELINE_KEY, icon: '📅' },
                { label: 'Alertes',         key: ALERTS_KEY,   icon: '🔔' },
              ].map(item => (
                <div key={item.key} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{storageSize(item.key)} KB</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
              <span className="text-gray-500">Total localStorage usat</span>
              <span className="font-bold text-althaia-700">{totalKB} KB</span>
            </div>
          </Section>
        )}

        {/* ── Exportar ──────────────────────────────────────────────────── */}
        <Section title="Exportar projectes (còpia de seguretat)" icon={Download}>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            {hasDB
              ? 'Descarrega tots els projectes de Supabase en un fitxer JSON. Útil com a còpia de seguretat.'
              : 'Descarrega tots els projectes del navegador en un fitxer JSON. Útil per migrar a un altre navegador o per connectar Supabase.'}
          </p>
          <button type="button" onClick={handleExport} disabled={exportLoading}
            className={clsx('btn-primary w-full justify-center', exportDone && 'bg-green-500')}>
            {exportDone
              ? <><Check size={15} /> Fitxer descarregat!</>
              : exportLoading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Exportant...</>
              : <><Download size={15} /> Exportar {projects.length} projectes (.json)</>}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Format: <code>althaia-backup-YYYY-MM-DD.json</code>
          </p>
        </Section>

        {/* ── Importar ──────────────────────────────────────────────────── */}
        <Section title="Importar projectes" icon={Upload}>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Carrega un fitxer de còpia de seguretat exportat prèviament.
            Això <strong>substituirà</strong> tots els projectes{hasDB ? ' a Supabase' : ' actuals'}.
          </p>

          {importMsg && (
            <div className={clsx('rounded-xl p-3 mb-4 flex items-start gap-2 text-sm',
              importMsg.type === 'ok'    ? 'bg-green-50 border border-green-200 text-green-800' :
              importMsg.type === 'info'  ? 'bg-blue-50  border border-blue-200  text-blue-800'  :
                                          'bg-red-50   border border-red-200   text-red-700'
            )}>
              {importMsg.type === 'ok'
                ? <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                : <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />}
              <p>{importMsg.text}</p>
            </div>
          )}

          <input type="file" ref={fileRef} accept=".json" className="hidden" onChange={handleImport} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="btn-secondary w-full justify-center">
            <Upload size={15} /> Seleccionar fitxer JSON...
          </button>
        </Section>

        {/* ── Com configurar Supabase ────────────────────────────────────── */}
        {!hasDB && (
          <Section title="Com connectar Supabase (base de dades real)" icon={Database}>
            <ol className="space-y-3 text-sm text-gray-600">
              {[
                <>Crea un compte gratuït a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-althaia-600 underline">supabase.com</a> i crea un projecte nou.</>,
                <>A l'editor SQL de Supabase, executa el fitxer <code className="bg-gray-100 px-1 rounded text-xs">database/supabase-schema.sql</code> del repositori.</>,
                <>Ves a <strong>Settings → API</strong> i copia la <strong>Project URL</strong> i la clau <strong>anon public</strong>.</>,
                <>A <strong>Vercel → Settings → Environment Variables</strong>, afegeix:<br />
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs block mt-1.5">VITE_SUPABASE_URL = https://xxxx.supabase.co</code>
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs block mt-1">VITE_SUPABASE_ANON_KEY = eyJhbGciOiJ...</code>
                </>,
                <>Torna a desplegar a Vercel (<strong>Redeploy</strong>) o empeny un nou commit al repositori.</>,
                <>Un cop connectat, importa els projectes des d'un backup JSON si en tens un.</>,
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-althaia-100 text-althaia-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── Reset demo ────────────────────────────────────────────────── */}
        <Section title="Restablir dades" icon={RefreshCw} className="border border-red-100">
          <p className="text-sm text-gray-500 mb-4">
            Elimina tots els projectes{hasDB ? ' de Supabase' : ' actuals'} i comença amb pissarra neta.
            <strong className="text-red-600"> Acció irreversible.</strong>
          </p>
          {!confirmReset
            ? <button type="button" onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Eliminar tots els projectes
              </button>
            : <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-700 font-semibold">
                  Segur que vols eliminar tots els projectes{hasDB ? ' de Supabase' : ''}?
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={handleReset}
                    className="flex-1 justify-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                    <Trash2 size={14} /> Sí, eliminar tot
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="btn-secondary flex-1 justify-center">
                    Cancel·lar
                  </button>
                </div>
              </div>
          }
        </Section>

        {/* ── Info tècnica ──────────────────────────────────────────────── */}
        <Section title="Informació tècnica" icon={Info}>
          <div className="space-y-1 text-xs text-gray-500">
            {[
              ['Frontend',          'React 18 + Vite + Tailwind CSS'],
              ['Persistència',      hasDB ? '✅ Supabase (PostgreSQL al núvol)' : '⚠️ localStorage (browser local)'],
              ['Backend propi',     'No connectat (schema.sql disponible)'],
              ['Desplegament',      'Vercel (estàtic)'],
              ['Repositori',        'GitHub → casalsmartinezmarc-dotcom/althaia-innovation'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span>{k}</span>
                <span className={clsx('font-mono', hasDB && k === 'Persistència' ? 'text-green-600' : 'text-gray-700')}>{v}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </Layout>
  )
}
