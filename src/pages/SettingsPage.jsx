import { useState, useRef } from 'react'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import {
  Download, Upload, Trash2, Check, AlertTriangle,
  Database, Info, RefreshCw, HardDrive,
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

  const [exportDone,  setExportDone]  = useState(false)
  const [importMsg,   setImportMsg]   = useState(null) // { type: 'ok'|'error', text }
  const [confirmReset, setConfirmReset] = useState(false)

  // ── Storage size ──────────────────────────────────────────────────────────
  function storageSize(key) {
    try {
      const val = localStorage.getItem(key) || ''
      return (new Blob([val]).size / 1024).toFixed(1)
    } catch { return '0.0' }
  }

  const totalKB = [STORAGE_KEY, TASKS_KEY, TIMELINE_KEY, ALERTS_KEY].reduce(
    (acc, k) => acc + parseFloat(storageSize(k)), 0
  ).toFixed(1)

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport() {
    const payload = {
      exported_at:    new Date().toISOString(),
      app_version:    '1.0',
      projects:       JSON.parse(localStorage.getItem(STORAGE_KEY)  || '[]'),
      project_tasks:  JSON.parse(localStorage.getItem(TASKS_KEY)    || '{}'),
      timeline_events:JSON.parse(localStorage.getItem(TIMELINE_KEY) || '{}'),
      alerts:         JSON.parse(localStorage.getItem(ALERTS_KEY)   || '[]'),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `althaia-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2000)
  }

  // ── Import ────────────────────────────────────────────────────────────────
  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.projects || !Array.isArray(data.projects)) {
          setImportMsg({ type: 'error', text: 'Format invàlid: el fitxer no té la clau "projects".' })
          return
        }
        // Write to localStorage
        localStorage.setItem(STORAGE_KEY,  JSON.stringify(data.projects))
        localStorage.setItem(TASKS_KEY,    JSON.stringify(data.project_tasks   || {}))
        localStorage.setItem(TIMELINE_KEY, JSON.stringify(data.timeline_events || {}))
        localStorage.setItem(ALERTS_KEY,   JSON.stringify(data.alerts          || []))
        setImportMsg({
          type: 'ok',
          text: `Importats ${data.projects.length} projectes. Recarrega la pàgina per veure els canvis.`,
        })
        // Reload after 2s to re-initialize state
        setTimeout(() => window.location.reload(), 2000)
      } catch {
        setImportMsg({ type: 'error', text: 'Error llegint el fitxer. Assegura\'t que és un JSON vàlid.' })
      }
    }
    reader.readAsText(file)
    // Reset file input
    e.target.value = ''
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleReset() {
    resetToDemo()
    setConfirmReset(false)
  }

  return (
    <Layout title="Configuració" subtitle="Gestió de dades i persistència">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Avís sobre localStorage ─────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900 mb-1">Com es guarden les dades ara</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              L'aplicació utilitza <strong>localStorage</strong> del navegador — les dades es guarden
              localment a cada navegador i domini. Si crees projectes a <code className="bg-amber-100 px-1 rounded">localhost</code> i
              els vols veure a <code className="bg-amber-100 px-1 rounded">althaia-innovation.vercel.app</code>,
              cal fer un <strong>exportar → importar</strong>. El mateix si canvies d'ordinador o navegador.
            </p>
            <p className="text-amber-700 text-xs mt-1.5">
              ℹ️ La base de dades PostgreSQL que existeix al codi (<code className="bg-amber-100 px-1 rounded">/database/schema.sql</code>)
              no está connectada. Es pot implementar quan calgui.
            </p>
          </div>
        </div>

        {/* ── Estat de l'emmagatzematge ───────────────────────────────────── */}
        <Section title="Estat de l'emmagatzematge local" icon={HardDrive}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Projectes',          key: STORAGE_KEY,  icon: '📁' },
              { label: 'Tasques',            key: TASKS_KEY,    icon: '✅' },
              { label: 'Timeline events',    key: TIMELINE_KEY, icon: '📅' },
              { label: 'Alertes',            key: ALERTS_KEY,   icon: '🔔' },
            ].map(item => {
              const kb = storageSize(item.key)
              return (
                <div key={item.key} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{kb} KB</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-gray-500">Total localStorage usat</span>
            <span className="font-bold text-althaia-700">{totalKB} KB</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Projectes en memòria</span>
            <span className="font-bold text-althaia-700">{projects.length}</span>
          </div>
        </Section>

        {/* ── Exportar ────────────────────────────────────────────────────── */}
        <Section title="Exportar projectes (còpia de seguretat)" icon={Download}>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Descarrega tots els projectes, tasques i fites en un fitxer JSON.
            Guarda'l per migrar les dades a un altre navegador o ordinador.
          </p>
          <button type="button" onClick={handleExport}
            className={clsx('btn-primary w-full justify-center', exportDone && 'bg-green-500')}>
            {exportDone
              ? <><Check size={15} /> Fitxer descarregat!</>
              : <><Download size={15} /> Exportar {projects.length} projectes</>}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Format: <code>althaia-backup-YYYY-MM-DD.json</code>
          </p>
        </Section>

        {/* ── Importar ────────────────────────────────────────────────────── */}
        <Section title="Importar projectes" icon={Upload}>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Carrega un fitxer de còpia de seguretat exportat prèviament. Això
            <strong> substituirà</strong> tots els projectes actuals.
          </p>

          {importMsg && (
            <div className={clsx('rounded-xl p-3 mb-4 flex items-start gap-2 text-sm',
              importMsg.type === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-700'
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

        {/* ── Reset demo ──────────────────────────────────────────────────── */}
        <Section title="Tornar a les dades de demo" icon={RefreshCw} className="border border-red-100">
          <p className="text-sm text-gray-500 mb-4">
            Elimina tots els projectes creats i restaura les dades d'exemple originals.
            <strong className="text-red-600"> Acció irreversible.</strong>
          </p>
          {!confirmReset
            ? <button type="button" onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Restablir dades de demo
              </button>
            : <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-700 font-semibold">Segur que vols eliminar tots els projectes?</p>
                <div className="flex gap-3">
                  <button type="button" onClick={handleReset}
                    className="flex-1 justify-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                    <Trash2 size={14} /> Sí, restablir
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="btn-secondary flex-1 justify-center">
                    Cancel·lar
                  </button>
                </div>
              </div>
          }
        </Section>

        {/* ── Info tècnica ─────────────────────────────────────────────────── */}
        <Section title="Informació tècnica" icon={Info}>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span>Frontend</span><span className="font-mono text-gray-700">React 18 + Vite + Tailwind</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span>Persistència actual</span>
              <span className="font-mono text-amber-600">localStorage (browser)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span>Backend disponible</span>
              <span className="font-mono text-gray-400">No connectat (codi pendent)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span>Schema BD</span>
              <span className="font-mono text-gray-700">/database/schema.sql (PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Desplegament</span>
              <span className="font-mono text-gray-700">Vercel (estàtic)</span>
            </div>
          </div>
        </Section>

      </div>
    </Layout>
  )
}
