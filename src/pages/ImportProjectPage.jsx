import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { SERVICES } from '../data/constants'
import {
  Upload, FileText, File, AlertCircle, Check,
  Wand2, RotateCcw, Eye, X, Loader2,
} from 'lucide-react'
import clsx from 'clsx'
import { runPipeline }           from '../lib/import/Pipeline.js'
import { isSupported }           from '../lib/import/extractors/index.js'

// ─── Helpers de formulari ─────────────────────────────────────────────────────
function FieldGroup({ label, detected, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="label mb-0 text-sm">{label}</label>
        {detected && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Wand2 size={10} /> Auto-detectat
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function AutoTextarea({ value, onChange, placeholder, rows = 'h-20', detected }) {
  return (
    <textarea
      className={clsx('input resize-none text-sm', rows,
        detected && value ? 'border-amber-300 bg-amber-50/30' : ''
      )}
      placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)} />
  )
}

function AutoInput({ value, onChange, placeholder, detected }) {
  return (
    <input
      className={clsx('input text-sm',
        detected && value ? 'border-amber-300 bg-amber-50/30' : ''
      )}
      placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)} />
  )
}

// ─── Pàgina d'importació ──────────────────────────────────────────────────────
export default function ImportProjectPage() {
  const { addProject } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [stage, setStage]           = useState('upload')
  const [loading, setLoading]       = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError]           = useState('')
  const [pastedText, setPastedText] = useState('')
  const [fileName, setFileName]     = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [detected, setDetected]     = useState({})

  const emptyForm = {
    title: '', service: '', owner_name: '', problem_description: '',
    beneficiary_profile: '', recurrence: '', existing_alternatives: '',
    objectives: '', hypotheses: '', indicators: '', success_criteria: '',
    test_protocol: '', simulation_scenarios: '',
    budget: '', partners: '', resources: '', risks: '', timeline: '',
    priority: 'mitja', tags: '', kpis: '',
  }
  const [form, setForm] = useState(emptyForm)
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Core: run the pipeline and apply results ─────────────────────────────
  const runAnalysis = useCallback(async (input) => {
    setLoading(true)
    setError('')
    try {
      const { newForm, flags } = await runPipeline(
        input,
        emptyForm,
        msg => setLoadingMsg(msg)
      )
      setDetected(flags)
      setForm(newForm)
      setStage('review')
    } catch (err) {
      setError(err.message || 'Error inesperat. Torna-ho a intentar.')
      setStage('upload')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!isSupported(file)) {
      setError('Format no suportat. Puja un fitxer .docx, .pdf o .txt.')
      return
    }
    setFileName(file.name)
    setError('')
    setLoadingMsg(`Llegint ${file.name}...`)
    await runAnalysis(file)
  }, [runAnalysis])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleManualText = () => {
    if (pastedText.trim().length < 20) {
      setError('El text és massa curt. Enganxa el contingut complet del document.')
      return
    }
    setFileName('')
    runAnalysis(pastedText.trim())
  }

  const handleSave = () => {
    const project = addProject({
      title:         form.title.trim() || 'Projecte importat',
      description:   form.problem_description.trim(),
      service:       form.service,
      owner_name:    form.owner_name.trim(),
      priority:      form.priority,
      tags:          form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      current_phase: 4,
      status:        'active',
      impact:        { clinical: 5, economic: 5, organizational: 5, patient_exp: 5 },
      budget:        Number(form.budget || 0),
      estimated_roi: 0,
      wizard_activacio: {
        title: form.title, service: form.service, owner_name: form.owner_name,
        problem_description: form.problem_description,
        beneficiary_profile: form.beneficiary_profile,
        recurrence: form.recurrence,
        existing_alternatives: form.existing_alternatives,
        priority: form.priority, tags: form.tags,
      },
      wizard_experimental: {
        objectives: form.objectives, hypotheses: form.hypotheses,
        indicators: form.indicators, success_criteria: form.success_criteria,
        test_protocol: form.test_protocol, simulation_scenarios: form.simulation_scenarios,
        methodology: 'design_thinking', validation_types: [],
      },
      wizard_dissenyFinal: {
        kpis: form.kpis, budget: form.budget, partners: form.partners,
        resources: form.resources, risks: form.risks, timeline: form.timeline, notes: '',
      },
      imported_from: fileName || 'text manual',
    })

    setStage('done')
    setTimeout(() => navigate(`/projects/${project.id}`), 1600)
  }

  // ─── Stage: upload ───────────────────────────────────────────────────────────
  if (stage === 'upload') return (
    <Layout title="Importar projecte" subtitle="Carrega un document Word, PDF o TXT">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Wand2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Importació intel·ligent de documents</p>
            <p className="text-xs text-blue-600 mt-1">
              Carrega un document Word (.docx), PDF (.pdf) o text pla (.txt). El motor analitza
              el document per seccions i detecta automàticament: títol, descripció, objectius,
              indicadors, protocol, escenaris, alternatives, recursos i riscos.
              Podràs revisar-ho tot abans de guardar.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
            isDragOver
              ? 'border-althaia-400 bg-althaia-50'
              : 'border-gray-200 bg-gray-50 hover:border-althaia-300 hover:bg-althaia-50/50'
          )}>
          <input ref={fileInputRef} type="file" accept=".docx,.txt,.pdf" className="hidden"
            onChange={e => handleFile(e.target.files?.[0])} />

          {loading ? (
            <div className="space-y-3">
              <Loader2 size={40} className="mx-auto text-althaia-500 animate-spin" />
              <p className="text-sm font-medium text-althaia-700">{loadingMsg}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-althaia-100 rounded-2xl flex items-center justify-center">
                <Upload size={28} className="text-althaia-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700">Arrossega el document aquí</p>
                <p className="text-sm text-gray-400 mt-1">o fes clic per seleccionar un fitxer</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                {[
                  { icon: FileText, label: '.docx', color: 'text-blue-500 bg-blue-50' },
                  { icon: FileText, label: '.txt',  color: 'text-gray-500 bg-gray-100' },
                  { icon: File,     label: '.pdf',  color: 'text-red-400 bg-red-50' },
                ].map(f => (
                  <div key={f.label} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold', f.color)}>
                    <f.icon size={14} /> {f.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="text-center">
          <button type="button" onClick={() => setStage('text')}
            className="text-sm text-gray-400 hover:text-althaia-600 underline transition-colors">
            O enganxa el text del document directament →
          </button>
        </div>
      </div>
    </Layout>
  )

  // ─── Stage: text (enganxar manualment) ───────────────────────────────────────
  if (stage === 'text') return (
    <Layout title="Importar projecte" subtitle="Enganxa el text del document">
      <div className="max-w-2xl mx-auto space-y-5">

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">Com fer-ho:</p>
          <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
            <li>Obre el document Word o PDF</li>
            <li>Selecciona tot el text (Ctrl+A o Cmd+A)</li>
            <li>Copia (Ctrl+C o Cmd+C)</li>
            <li>Fes clic al camp de sota i enganxa (Ctrl+V o Cmd+V)</li>
          </ol>
          <p className="text-xs text-blue-500 mt-2">
            💡 El motor funciona millor quan el document té seccions clarament identificades (títols, encapçalaments).
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Contingut del document</label>
            {pastedText.length > 0 && (
              <button type="button" onClick={() => setPastedText('')}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <X size={12} /> Esborrar
              </button>
            )}
          </div>
          <textarea
            className="input resize-none h-72 font-mono text-xs"
            placeholder="Enganxa aquí el text complet del document..."
            value={pastedText}
            onChange={e => setPastedText(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">{pastedText.length.toLocaleString()} caràcters</p>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={() => { setStage('upload'); setError('') }} className="btn-secondary">
            ← Tornar
          </button>
          <button type="button" onClick={handleManualText}
            disabled={pastedText.trim().length < 20 || loading}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> {loadingMsg || 'Analitzant...'}</>
              : <><Wand2 size={15} /> Detectar camps</>
            }
          </button>
        </div>
      </div>
    </Layout>
  )

  // ─── Stage: review ───────────────────────────────────────────────────────────
  if (stage === 'review') {
    const detectedCount = Object.values(detected).filter(Boolean).length

    return (
      <Layout title="Revisió del projecte importat" subtitle="Revisa i corregeix els camps detectats automàticament">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Eye size={18} className="text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                {detectedCount} camps detectats automàticament
                {fileName && <span className="text-green-600 font-normal"> — {fileName}</span>}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Els camps en groc han estat detectats automàticament. Revisa'ls i corregeix si cal.
                Els camps buits els pots omplir manualment.
              </p>
            </div>
            <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
              <Wand2 size={12} /> Auto-detectat
            </span>
          </div>

          {/* ── Informació bàsica ── */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">1. Informació bàsica</h3>

            <FieldGroup label="Títol de la necessitat *" detected={detected.title}>
              <AutoInput value={form.title} onChange={v => setField('title', v)}
                placeholder="Títol del repte o problema detectat" detected={detected.title} />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Servei afectat" detected={detected.service}>
                <select className={clsx('input text-sm', detected.service && form.service ? 'border-amber-300 bg-amber-50/30' : '')}
                  value={form.service} onChange={e => setField('service', e.target.value)}>
                  <option value="">Selecciona un servei...</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Responsable / Referent" detected={detected.owner_name}>
                <AutoInput value={form.owner_name} onChange={v => setField('owner_name', v)}
                  placeholder="Nom del professional" detected={detected.owner_name} />
              </FieldGroup>
            </div>

            <FieldGroup label="Descripció del problema / La idea" detected={detected.problem_description}>
              <AutoTextarea value={form.problem_description} onChange={v => setField('problem_description', v)}
                placeholder="Descripció del problema o necessitat detectada..."
                rows="h-28" detected={detected.problem_description} />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Perfil de beneficiaris" detected={detected.beneficiary_profile}>
                <AutoTextarea value={form.beneficiary_profile} onChange={v => setField('beneficiary_profile', v)}
                  placeholder="Qui es beneficia de la solució..." detected={detected.beneficiary_profile} />
              </FieldGroup>
              <FieldGroup label="Intensitat i recurrència" detected={detected.recurrence}>
                <AutoTextarea value={form.recurrence} onChange={v => setField('recurrence', v)}
                  placeholder="Amb quina freqüència ocorre, quin volum..." detected={detected.recurrence} />
              </FieldGroup>
            </div>

            <FieldGroup label="Alternatives existents i per què no son suficients" detected={detected.existing_alternatives}>
              <AutoTextarea value={form.existing_alternatives} onChange={v => setField('existing_alternatives', v)}
                placeholder="Quines solucions actuals existeixen i per què son insuficients..."
                detected={detected.existing_alternatives} />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prioritat</label>
                <div className="flex gap-2">
                  {['alta', 'mitja', 'baixa'].map(p => (
                    <button key={p} type="button" onClick={() => setField('priority', p)}
                      className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition-all',
                        form.priority === p ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}>{p}</button>
                  ))}
                </div>
              </div>
              <FieldGroup label="Etiquetes (separades per comes)" detected={detected.tags}>
                <AutoInput value={form.tags} onChange={v => setField('tags', v)}
                  placeholder="Ex: IA, Living Lab, Cures..." detected={detected.tags} />
              </FieldGroup>
            </div>
          </div>

          {/* ── Disseny experimental ── */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">2. Disseny experimental</h3>

            <FieldGroup label="Objectius específics / Resultats esperats" detected={detected.objectives}>
              <AutoTextarea value={form.objectives} onChange={v => setField('objectives', v)}
                placeholder="Objectius mesurables del projecte..."
                rows="h-24" detected={detected.objectives} />
            </FieldGroup>

            <FieldGroup label="Hipòtesi de partida / Lema" detected={detected.hypotheses}>
              <AutoTextarea value={form.hypotheses} onChange={v => setField('hypotheses', v)}
                placeholder="Hipòtesi principal que es vol verificar..."
                detected={detected.hypotheses} />
            </FieldGroup>

            <FieldGroup label="Indicadors de mesura / KPIs" detected={detected.indicators}>
              <AutoTextarea value={form.indicators} onChange={v => setField('indicators', v)}
                placeholder="Indicadors concrets que es mesuraran..."
                detected={detected.indicators} />
            </FieldGroup>

            <FieldGroup label="Llindars d'èxit / Criteris de validació" detected={detected.success_criteria}>
              <AutoTextarea value={form.success_criteria} onChange={v => setField('success_criteria', v)}
                placeholder="Quins resultats mínims cal assolir..."
                detected={detected.success_criteria} />
            </FieldGroup>

            <FieldGroup label="Protocol de proves / Cas pràctic" detected={detected.test_protocol}>
              <AutoTextarea value={form.test_protocol} onChange={v => setField('test_protocol', v)}
                placeholder="Fases del pilot: simulació, experimentació, pilot real..."
                rows="h-28" detected={detected.test_protocol} />
            </FieldGroup>

            <FieldGroup label="Escenaris de simulació" detected={detected.simulation_scenarios}>
              <AutoTextarea value={form.simulation_scenarios} onChange={v => setField('simulation_scenarios', v)}
                placeholder="Casos d'ús concrets que es validaran..."
                detected={detected.simulation_scenarios} />
            </FieldGroup>
          </div>

          {/* ── Disseny de la solució ── */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">3. Disseny de la solució</h3>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Pressupost estimat (€)" detected={detected.budget}>
                <input className={clsx('input text-sm', detected.budget && form.budget ? 'border-amber-300 bg-amber-50/30' : '')}
                  type="number" min="0" placeholder="Ex: 350000"
                  value={form.budget} onChange={e => setField('budget', e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Partners / Proveïdors" detected={detected.partners}>
                <AutoInput value={form.partners} onChange={v => setField('partners', v)}
                  placeholder="Ex: Fundació TIC Salut, UPC..." detected={detected.partners} />
              </FieldGroup>
            </div>

            <FieldGroup label="KPIs finals" detected={detected.kpis}>
              <AutoTextarea value={form.kpis} onChange={v => setField('kpis', v)}
                placeholder="Indicadors clau de rendiment del projecte..."
                detected={detected.kpis} />
            </FieldGroup>

            <FieldGroup label="Recursos necessaris (equip, infraestructura, dades)" detected={detected.resources}>
              <AutoTextarea value={form.resources} onChange={v => setField('resources', v)}
                placeholder="Equip humà, infraestructura, accés a dades..."
                rows="h-24" detected={detected.resources} />
            </FieldGroup>

            <FieldGroup label="Riscos identificats" detected={detected.risks}>
              <AutoTextarea value={form.risks} onChange={v => setField('risks', v)}
                placeholder="Riscos del projecte i plans de mitigació..."
                rows="h-24" detected={detected.risks} />
            </FieldGroup>

            <FieldGroup label="Calendari / Timeline" detected={detected.timeline}>
              <AutoTextarea value={form.timeline} onChange={v => setField('timeline', v)}
                placeholder="Fases i terminis d'implementació..."
                detected={detected.timeline} />
            </FieldGroup>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pb-8">
            <button type="button"
              onClick={() => { setStage('upload'); setForm(emptyForm); setDetected({}) }}
              className="btn-secondary">
              <RotateCcw size={14} /> Tornar a pujar
            </button>
            <button type="button" onClick={handleSave}
              disabled={!form.title.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              <Check size={15} /> Guardar projecte
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // ─── Stage: done ─────────────────────────────────────────────────────────────
  return (
    <Layout title="Projecte importat" subtitle="">
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check size={36} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Projecte importat correctament!</h2>
        <p className="text-sm text-gray-500">Redirigint al workspace del projecte...</p>
      </div>
    </Layout>
  )
}
