import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { SERVICES } from '../data/constants'
import {
  Search, Lightbulb, Target, PenLine,
  Plus, Trash2, ChevronLeft, ChevronRight,
  Check, Star, ArrowRight, AlertCircle,
} from 'lucide-react'
import clsx from 'clsx'

// ─── Límits de caràcters ─────────────────────────────────────────────────────
const LIMITS = {
  title:               100,
  owner_name:           80,
  problem_description: 1000,
  tags:                150,
  idea_title:          100,
  idea_description:    500,
  idea_pros:           300,
  idea_cons:           300,
  idea_tech:           150,
  objectives:          1000,
  kpis:                500,
  partners:            200,
  risks:               500,
  resources:           500,
  timeline:            500,
}

// ─── Configuració dels passos ────────────────────────────────────────────────
const STEPS = [
  { id: 1, icon: Search,    label: 'Detecció',  desc: 'Necessitat clínica'  },
  { id: 2, icon: Lightbulb, label: 'Idees',     desc: 'Possibles solucions' },
  { id: 3, icon: Target,    label: 'Selecció',  desc: 'Tria la millor idea' },
  { id: 4, icon: PenLine,   label: 'Disseny',   desc: 'Defineix la solució' },
]

// ─── Estat inicial ────────────────────────────────────────────────────────────
const initDeteccio = {
  title: '', service: '', owner_name: '', problem_description: '',
  clinical_impact: 5, economic_impact: 5, organizational_impact: 5, patient_exp: 5,
  priority: 'mitja', tags: '',
}

const initIdea = () => ({
  id: Date.now() + Math.random(),
  title: '', description: '', pros: '', cons: '',
  estimated_cost: '', required_tech: '', ai_related: false,
})

const initDisseny = {
  objectives: '', kpis: '', budget: '',
  risks: '', partners: '', resources: '', timeline: '',
}

// ─── Component comptador de caràcters ────────────────────────────────────────
function CharCount({ value, max }) {
  const len = (value || '').length
  const pct = len / max
  const near = pct >= 0.85
  const full  = pct >= 1
  if (len === 0) return null
  return (
    <span className={clsx(
      'text-xs font-medium ml-auto',
      full ? 'text-red-500' : near ? 'text-orange-400' : 'text-gray-300'
    )}>
      {len}/{max}
    </span>
  )
}

// ─── Input amb límit i comptador ─────────────────────────────────────────────
function LimitedInput({ label, value, onChange, max, placeholder, required, className }) {
  const over = value.length >= max
  return (
    <div className={className}>
      <div className="flex items-center mb-1 gap-1">
        <label className="label mb-0">{label}{required && ' *'}</label>
        <CharCount value={value} max={max} />
      </div>
      <input
        className={clsx('input', over && 'border-red-300 focus:ring-red-400')}
        placeholder={placeholder}
        value={value}
        maxLength={max}
        onChange={e => onChange(e.target.value)}
      />
      {over && <p className="text-xs text-red-500 mt-1">Límit de {max} caràcters assolit</p>}
    </div>
  )
}

// ─── Textarea amb límit i comptador ──────────────────────────────────────────
function LimitedTextarea({ label, value, onChange, max, placeholder, required, rows = 'h-20' }) {
  const over = value.length >= max
  return (
    <div>
      <div className="flex items-center mb-1 gap-1">
        <label className="label mb-0">{label}{required && ' *'}</label>
        <CharCount value={value} max={max} />
      </div>
      <textarea
        className={clsx('input resize-none', rows, over && 'border-red-300 focus:ring-red-400')}
        placeholder={placeholder}
        value={value}
        maxLength={max}
        onChange={e => onChange(e.target.value)}
      />
      {over && <p className="text-xs text-red-500 mt-1">Límit de {max} caràcters assolit</p>}
    </div>
  )
}

// ─── Component slider d'impacte ───────────────────────────────────────────────
function ScoreSlider({ label, value, onChange }) {
  const color = value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-althaia-500' : 'bg-orange-400'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full text-white', color)}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-althaia-600" />
    </div>
  )
}

// ─── Pas 1: Detecció ─────────────────────────────────────────────────────────
function StepDeteccio({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3">
        <Search size={18} className="text-purple-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-purple-800">Detecció de necessitat clínica</p>
          <p className="text-xs text-purple-600 mt-0.5">Descriu el problema o oportunitat de millora que has identificat al teu servei.</p>
        </div>
      </div>

      <LimitedInput
        label="Títol de la necessitat" required
        value={data.title} max={LIMITS.title}
        placeholder="Ex: Dificultat per detectar sèpsia a temps a la UCI"
        onChange={v => set('title', v)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Servei afectat *</label>
          <select className="input" value={data.service} onChange={e => set('service', e.target.value)}>
            <option value="">Selecciona...</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <LimitedInput
          label="Responsable / Referent"
          value={data.owner_name} max={LIMITS.owner_name}
          placeholder="Nom del professional"
          onChange={v => set('owner_name', v)}
        />
      </div>

      <LimitedTextarea
        label="Descripció del problema" required rows="h-32"
        value={data.problem_description} max={LIMITS.problem_description}
        placeholder="Explica detalladament el problema: qui afecta, amb quina freqüència, quines conseqüències té..."
        onChange={v => set('problem_description', v)}
      />

      <div>
        <label className="label mb-3">Impacte estimat de la necessitat</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
          <ScoreSlider label="Impacte Clínic"       value={data.clinical_impact}       onChange={v => set('clinical_impact', v)} />
          <ScoreSlider label="Impacte Econòmic"     value={data.economic_impact}       onChange={v => set('economic_impact', v)} />
          <ScoreSlider label="Impacte Organitzatiu" value={data.organizational_impact} onChange={v => set('organizational_impact', v)} />
          <ScoreSlider label="Exp. Pacient"         value={data.patient_exp}           onChange={v => set('patient_exp', v)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Prioritat</label>
          <div className="flex gap-2">
            {['alta','mitja','baixa'].map(p => (
              <button key={p} type="button" onClick={() => set('priority', p)}
                className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition-all',
                  data.priority === p ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                )}>{p}</button>
            ))}
          </div>
        </div>
        <LimitedInput
          label="Etiquetes (separades per comes)"
          value={data.tags} max={LIMITS.tags}
          placeholder="Ex: UCI, Crítics, Alarmes"
          onChange={v => set('tags', v)}
        />
      </div>
    </div>
  )
}

// ─── Pas 2: Generació d'idees ─────────────────────────────────────────────────
function StepIdees({ ideas, onChange }) {
  const addIdea    = () => onChange([...ideas, initIdea()])
  const removeIdea = (id) => onChange(ideas.filter(i => i.id !== id))
  const updateIdea = (id, field, val) =>
    onChange(ideas.map(i => i.id === id ? { ...i, [field]: val } : i))

  return (
    <div className="space-y-5">
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex gap-3">
        <Lightbulb size={18} className="text-pink-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-pink-800">Generació d'idees</p>
          <p className="text-xs text-pink-600 mt-0.5">Afegeix totes les possibles solucions. Al pas següent triaràs la millor.</p>
        </div>
      </div>

      {ideas.map((idea, idx) => (
        <div key={idea.id} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Idea {idx + 1}</span>
            {ideas.length > 1 && (
              <button type="button" onClick={() => removeIdea(idea.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <LimitedInput
            label="Títol de la idea" required
            value={idea.title} max={LIMITS.idea_title}
            placeholder="Ex: Model d'IA basat en LSTM per a predicció de sèpsia"
            onChange={v => updateIdea(idea.id, 'title', v)}
          />

          <LimitedTextarea
            label="Descripció"
            value={idea.description} max={LIMITS.idea_description}
            placeholder="Explica breument com funcionaria aquesta solució..."
            onChange={v => updateIdea(idea.id, 'description', v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-1 gap-1">
                <label className="label mb-0 text-green-600">✅ Avantatges</label>
                <CharCount value={idea.pros} max={LIMITS.idea_pros} />
              </div>
              <textarea
                className={clsx('input h-20 resize-none border-green-200 focus:ring-green-400',
                  idea.pros.length >= LIMITS.idea_pros && 'border-red-300')}
                placeholder="Punts forts d'aquesta idea..."
                value={idea.pros} maxLength={LIMITS.idea_pros}
                onChange={e => updateIdea(idea.id, 'pros', e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center mb-1 gap-1">
                <label className="label mb-0 text-red-500">❌ Inconvenients</label>
                <CharCount value={idea.cons} max={LIMITS.idea_cons} />
              </div>
              <textarea
                className={clsx('input h-20 resize-none border-red-200 focus:ring-red-400',
                  idea.cons.length >= LIMITS.idea_cons && 'border-red-500')}
                placeholder="Riscos o limitacions..."
                value={idea.cons} maxLength={LIMITS.idea_cons}
                onChange={e => updateIdea(idea.id, 'cons', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cost estimat (€)</label>
              <input className="input" type="number" min="0" placeholder="Ex: 80000"
                value={idea.estimated_cost}
                onChange={e => updateIdea(idea.id, 'estimated_cost', e.target.value)} />
            </div>
            <LimitedInput
              label="Tecnologies necessàries"
              value={idea.required_tech} max={LIMITS.idea_tech}
              placeholder="Ex: Python, HL7 FHIR..."
              onChange={v => updateIdea(idea.id, 'required_tech', v)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="label mb-0">Implica Intel·ligència Artificial?</label>
            <div className="flex gap-2 ml-auto">
              {[true, false].map(v => (
                <button key={String(v)} type="button" onClick={() => updateIdea(idea.id, 'ai_related', v)}
                  className={clsx('px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    idea.ai_related === v
                      ? 'bg-althaia-600 text-white border-althaia-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                  )}>{v ? '🤖 Sí' : 'No'}</button>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addIdea}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-althaia-600 hover:border-althaia-300 hover:bg-althaia-50 transition-all flex items-center justify-center gap-2">
        <Plus size={16} /> Afegir altra idea
      </button>
    </div>
  )
}

// ─── Pas 3: Selecció ─────────────────────────────────────────────────────────
function StepSeleccio({ ideas, selected, onSelect }) {
  const validIdeas = ideas.filter(i => i.title.trim())

  if (validIdeas.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <AlertCircle size={36} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm">No hi ha idees amb títol. Torna al pas anterior i omple almenys una idea.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Target size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Selecció de la solució</p>
          <p className="text-xs text-blue-600 mt-0.5">Revisa totes les idees i clica la que vols portar endavant.</p>
        </div>
      </div>

      <div className="space-y-3">
        {validIdeas.map((idea, idx) => {
          const isSelected = selected === idea.id
          return (
            <button key={idea.id} type="button" onClick={() => onSelect(idea.id)}
              className={clsx(
                'w-full text-left border-2 rounded-xl p-4 transition-all',
                isSelected
                  ? 'border-althaia-500 bg-althaia-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-althaia-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                  isSelected ? 'border-althaia-500 bg-althaia-500' : 'border-gray-300'
                )}>
                  {isSelected && <Check size={13} className="text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={clsx('text-sm font-semibold', isSelected ? 'text-althaia-700' : 'text-gray-900')}>
                      {idx + 1}. {idea.title}
                    </p>
                    {idea.ai_related && <span className="badge bg-violet-100 text-violet-700 text-xs">🤖 IA</span>}
                  </div>
                  {idea.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {idea.pros && (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                        ✅ {idea.pros.slice(0, 60)}{idea.pros.length > 60 ? '…' : ''}
                      </span>
                    )}
                    {idea.cons && (
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                        ❌ {idea.cons.slice(0, 60)}{idea.cons.length > 60 ? '…' : ''}
                      </span>
                    )}
                    {idea.estimated_cost && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        💰 €{Number(idea.estimated_cost).toLocaleString()}
                      </span>
                    )}
                    {idea.required_tech && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        🛠 {idea.required_tech.slice(0, 40)}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Star size={18} className="text-althaia-500 fill-althaia-500 shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check size={16} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            Has seleccionat: <strong>{validIdeas.find(i => i.id === selected)?.title}</strong>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Pas 4: Disseny ──────────────────────────────────────────────────────────
function StepDisseny({ data, onChange, selectedIdea }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-3">
        <PenLine size={18} className="text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-teal-800">Disseny de la solució</p>
          <p className="text-xs text-teal-600 mt-0.5">Defineix com implementaràs la idea seleccionada.</p>
        </div>
      </div>

      {selectedIdea && (
        <div className="bg-althaia-50 border border-althaia-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-althaia-600 uppercase tracking-wide mb-1">Idea seleccionada</p>
          <p className="text-sm font-semibold text-althaia-800">✅ {selectedIdea.title}</p>
          {selectedIdea.description && <p className="text-xs text-gray-500 mt-1">{selectedIdea.description}</p>}
        </div>
      )}

      <LimitedTextarea
        label="Objectius del projecte" required rows="h-24"
        value={data.objectives} max={LIMITS.objectives}
        placeholder="Quins resultats vols assolir? Sigues específic i mesurable..."
        onChange={v => set('objectives', v)}
      />

      <LimitedTextarea
        label="KPIs i indicadors de mesura"
        value={data.kpis} max={LIMITS.kpis}
        placeholder="Ex: Reducció mortalitat sèpsia 20%, Detecció 6h abans, NPS > 8..."
        onChange={v => set('kpis', v)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Pressupost estimat (€)</label>
          <input className="input" type="number" min="0"
            placeholder={selectedIdea?.estimated_cost || 'Ex: 120000'}
            value={data.budget}
            onChange={e => set('budget', e.target.value)} />
        </div>
        <LimitedInput
          label="Partners / Proveïdors"
          value={data.partners} max={LIMITS.partners}
          placeholder="Ex: Philips, Telefónica, UPC..."
          onChange={v => set('partners', v)}
        />
      </div>

      <LimitedTextarea
        label="Riscos identificats"
        value={data.risks} max={LIMITS.risks}
        placeholder="Ex: Resistència dels professionals, problemes d'integració HCE..."
        onChange={v => set('risks', v)}
      />

      <LimitedTextarea
        label="Recursos necessaris"
        value={data.resources} max={LIMITS.resources}
        placeholder="Ex: 2 data scientists, infraestructura cloud, accés a dades HCE..."
        onChange={v => set('resources', v)}
      />

      <LimitedTextarea
        label="Calendari / Timeline"
        value={data.timeline} max={LIMITS.timeline}
        placeholder="Ex: Mes 1-2: disseny tècnic. Mes 3-4: desenvolupament. Mes 5-8: pilot..."
        onChange={v => set('timeline', v)}
      />
    </div>
  )
}

// ─── Pàgina principal del wizard ──────────────────────────────────────────────
export default function InnovationWizardPage() {
  const { addProject } = useApp()
  const navigate = useNavigate()

  const [step, setStep]         = useState(1)
  const [deteccio, setDeteccio] = useState(initDeteccio)
  const [ideas, setIdeas]       = useState([initIdea()])
  const [selected, setSelected] = useState(null)
  const [disseny, setDisseny]   = useState(initDisseny)
  const [saved, setSaved]       = useState(false)

  const selectedIdea = ideas.find(i => i.id === selected)

  const canNext = () => {
    if (step === 1) return (
      deteccio.title.trim().length > 0 &&
      deteccio.title.length <= LIMITS.title &&
      deteccio.service.trim().length > 0 &&
      deteccio.problem_description.trim().length > 0 &&
      deteccio.problem_description.length <= LIMITS.problem_description
    )
    if (step === 2) return ideas.some(i => i.title.trim().length > 0)
    if (step === 3) return !!selected
    if (step === 4) return (
      disseny.objectives.trim().length > 0 &&
      disseny.objectives.length <= LIMITS.objectives
    )
    return true
  }

  const handleFinish = () => {
    const project = addProject({
      title:         deteccio.title.trim(),
      description:   deteccio.problem_description.trim(),
      service:       deteccio.service,
      owner_name:    deteccio.owner_name.trim(),
      priority:      deteccio.priority,
      tags:          deteccio.tags ? deteccio.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      current_phase: 4,
      status:        'active',
      impact: {
        clinical:       deteccio.clinical_impact,
        economic:       deteccio.economic_impact,
        organizational: deteccio.organizational_impact,
        patient_exp:    deteccio.patient_exp,
      },
      budget:        Number(disseny.budget || selectedIdea?.estimated_cost || 0),
      estimated_roi: 0,
      // Dades del wizard (persisitides a localStorage)
      wizard_ideas:    ideas.filter(i => i.title.trim()),
      wizard_selected: selectedIdea,
      wizard_disseny:  disseny,
    })
    setSaved(true)
    setTimeout(() => navigate(`/projects/${project.id}`), 1500)
  }

  return (
    <Layout title="Nova Innovació" subtitle="Procés guiat de 4 fases">
      <div className="max-w-2xl mx-auto">

        {/* Progress steps */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => {
            const done = step > s.id
            const curr = step === s.id
            const Icon = s.icon
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => done && setStep(s.id)}
                  className={clsx(
                    'flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all',
                    curr  ? 'bg-althaia-600 text-white shadow-md' :
                    done  ? 'bg-green-50 text-green-700 border border-green-200 cursor-pointer hover:bg-green-100' :
                            'bg-gray-50 text-gray-300 border border-gray-100'
                  )}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20">
                    {done ? <Check size={15} /> : <Icon size={15} />}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
                  <span className="text-xs opacity-70 hidden sm:block">{s.desc}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={14} className={clsx('mx-1 shrink-0', done ? 'text-green-400' : 'text-gray-200')} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="card p-6 mb-5 animate-slide-in">
          {step === 1 && <StepDeteccio data={deteccio} onChange={setDeteccio} />}
          {step === 2 && <StepIdees ideas={ideas} onChange={setIdeas} />}
          {step === 3 && <StepSeleccio ideas={ideas} selected={selected} onSelect={setSelected} />}
          {step === 4 && <StepDisseny data={disseny} onChange={setDisseny} selectedIdea={selectedIdea} />}
        </div>

        {/* Banner èxit */}
        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3 animate-slide-in">
            <Check size={18} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Projecte creat i guardat correctament!</p>
              <p className="text-xs text-green-600">Redirigint al workspace del projecte...</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
            className="btn-secondary"
            disabled={saved}
          >
            <ChevronLeft size={15} />
            {step > 1 ? 'Anterior' : 'Cancel·lar'}
          </button>

          <span className="text-xs text-gray-400">Pas {step} de {STEPS.length}</span>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Següent <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canNext() || saved}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? <><Check size={15} /> Creat!</> : <><Check size={15} /> Crear projecte</>}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
