import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { PHASES, SERVICES, IMPACT_AREAS } from '../data/constants'
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react'
import clsx from 'clsx'

const STEPS = [
  { id: 1, label: 'Dades bàsiques',   icon: '📋' },
  { id: 2, label: 'Impacte',          icon: '📊' },
  { id: 3, label: 'Tècnic',           icon: '⚙️' },
  { id: 4, label: 'Estat inicial',    icon: '🚦' },
]

const initialForm = {
  title: '', service: '', description: '', owner_name: '',
  impact: { clinical: 5, economic: 5, organizational: 5, patient_exp: 5 },
  technologies: '', ai_related: false, indicators: '',
  current_phase: 1, priority: 'mitja', status: 'active',
  budget: '', tags: '',
}

function ScoreSlider({ label, value, onChange }) {
  const color = value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-althaia-500' : 'bg-orange-400'
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full text-white', color)}>
          {value}/10
        </span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-althaia-600"
      />
    </div>
  )
}

export default function NewProjectPage() {
  const { addProject } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    ...initialForm,
    current_phase: Number(params.get('phase') || 1),
  })
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setImpact = (key, val) => setForm(f => ({ ...f, impact: { ...f.impact, [key]: val } }))

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const project = addProject({
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      budget: Number(form.budget) || 0,
      estimated_roi: 0,
      owner_name: form.owner_name || 'Administrador',
      team: [],
    })
    setSaved(true)
    // Redirigeix al workspace del nou projecte
    setTimeout(() => navigate(`/projects/${project.id}`), 1500)
  }

  return (
    <Layout title="Nou Projecte" subtitle="Formulari de creació">
      <div className="max-w-2xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => setStep(s.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                  step === s.id
                    ? 'bg-althaia-600 text-white shadow-sm'
                    : step > s.id
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                )}
              >
                {step > s.id ? <Check size={14} /> : <span>{s.icon}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-gray-300 mx-1 shrink-0" />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6 animate-slide-in">
          {/* Step 1: Basic data */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Dades bàsiques del projecte</h2>
              <div>
                <label className="label">Títol del projecte *</label>
                <input className="input" placeholder="Ex: IA per detecció precoç de sèpsia"
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Servei *</label>
                  <select className="input" value={form.service} onChange={e => set('service', e.target.value)}>
                    <option value="">Selecciona...</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Responsable</label>
                  <input
                    className="input"
                    placeholder="Nom del responsable"
                    value={form.owner_name}
                    onChange={e => set('owner_name', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">Descripció del problema / oportunitat *</label>
                <textarea className="input h-28 resize-none" placeholder="Descriure el problema clínic o l'oportunitat de millora..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">Etiquetes (separades per comes)</label>
                <input className="input" placeholder="Ex: IA, Cardiologia, Wearables"
                  value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Impact */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-gray-900">Impacte esperat</h2>
              <p className="text-sm text-gray-500">Valora l'impacte esperat de 1 (mínim) a 10 (màxim) en cada àmbit.</p>
              {IMPACT_AREAS.map(area => (
                <ScoreSlider
                  key={area.key}
                  label={area.label}
                  value={form.impact[area.key]}
                  onChange={v => setImpact(area.key, v)}
                />
              ))}
              <div>
                <label className="label">Prioritat</label>
                <div className="flex gap-3">
                  {['alta','mitja','baixa'].map(p => (
                    <button key={p}
                      onClick={() => set('priority', p)}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                        form.priority === p
                          ? 'bg-althaia-600 text-white border-althaia-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Technical */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Informació tècnica</h2>
              <div>
                <label className="label">Tecnologies implicades</label>
                <input className="input" placeholder="Ex: Python, TensorFlow, HL7 FHIR, React..."
                  value={form.technologies} onChange={e => set('technologies', e.target.value)} />
              </div>
              <div>
                <label className="label">Indicadors afectats</label>
                <input className="input" placeholder="Ex: Mortalitat UCi, Temps estada, Reingressos..."
                  value={form.indicators} onChange={e => set('indicators', e.target.value)} />
              </div>
              <div>
                <label className="label">Pressupost estimat (€)</label>
                <input className="input" type="number" placeholder="Ex: 120000"
                  value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>
              <div>
                <label className="label">Projecte relacionat amb IA</label>
                <div className="flex gap-3 mt-2">
                  {[true, false].map(v => (
                    <button key={String(v)}
                      onClick={() => set('ai_related', v)}
                      className={clsx(
                        'px-5 py-2 rounded-lg text-sm font-medium border transition-all',
                        form.ai_related === v
                          ? 'bg-althaia-600 text-white border-althaia-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}
                    >{v ? '✅ Sí' : '❌ No'}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Initial state */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-gray-900">Estat inicial del projecte</h2>
              <div>
                <label className="label">Fase d'entrada</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PHASES.map(ph => (
                    <button key={ph.id}
                      onClick={() => set('current_phase', ph.id)}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-all text-left',
                        form.current_phase === ph.id
                          ? 'bg-althaia-600 text-white border-althaia-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-althaia-300'
                      )}
                    >
                      <span>{ph.icon}</span>
                      <span className="font-medium">{ph.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resum</p>
                <p className="text-sm font-semibold text-gray-900">{form.title || '(sense títol)'}</p>
                <p className="text-xs text-gray-500">
                  {form.service} · {PHASES[form.current_phase - 1]?.icon} {PHASES[form.current_phase - 1]?.name}
                  {form.owner_name && ` · ${form.owner_name}`}
                </p>
                {form.budget && <p className="text-xs text-gray-500">Pressupost: €{Number(form.budget).toLocaleString()}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Banner de confirmació */}
        {saved && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3 animate-slide-in">
            <Check size={18} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Projecte guardat correctament!</p>
              <p className="text-xs text-green-600">Redirigint al workspace del projecte...</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/projects')}
            className="btn-secondary"
            disabled={saved}
          >
            <ChevronLeft size={15} /> {step > 1 ? 'Anterior' : 'Cancel·lar'}
          </button>
          {step < 4
            ? <button onClick={() => setStep(s => s + 1)} className="btn-primary" disabled={step === 1 && !form.title}>
                Següent <ChevronRight size={15} />
              </button>
            : <button onClick={handleSubmit} className="btn-primary" disabled={saved || !form.title}>
                {saved
                  ? <><Check size={15} /> Guardat!</>
                  : <><Save size={15} /> Crear projecte</>
                }
              </button>
          }
        </div>
      </div>
    </Layout>
  )
}
