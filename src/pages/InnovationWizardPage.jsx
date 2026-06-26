import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { SERVICES } from '../data/constants'
import {
  Search, Lightbulb, Target, PenLine, FlaskConical, ShieldCheck,
  Plus, Trash2, ChevronLeft, ChevronRight, Check, Star,
  ArrowRight, AlertCircle, BookOpen,
} from 'lucide-react'
import clsx from 'clsx'

// ─── Límits de caràcters ─────────────────────────────────────────────────────
const LIMITS = {
  title: 100, owner_name: 80,
  problem_description: 1000, beneficiary_profile: 500,
  recurrence: 300, existing_alternatives: 400, tags: 150,
  idea_title: 100, idea_description: 500, idea_pros: 300,
  idea_cons: 300, idea_tech: 150,
  objectives: 1000, hypotheses: 500, indicators: 500,
  success_criteria: 500, test_protocol: 800, simulation_scenarios: 500,
  crit_text: 400, kpis: 500, partners: 200, risks: 500,
  resources: 500, timeline: 500, notes: 600,
}

// ─── Configuració dels 6 passos ──────────────────────────────────────────────
const STEPS = [
  { id: 1, icon: Search,      label: 'Activació',    desc: 'Detecció de necessitat'  },
  { id: 2, icon: Lightbulb,   label: 'Idees',         desc: 'Generació de solucions'  },
  { id: 3, icon: Target,      label: 'Selecció',      desc: 'Tria la millor idea'     },
  { id: 4, icon: FlaskConical,label: 'Experimental',  desc: 'Protocol i metodologia'  },
  { id: 5, icon: ShieldCheck, label: 'Validació',     desc: '6 criteris del manual'   },
  { id: 6, icon: PenLine,     label: 'Disseny final', desc: 'Implementació'           },
]

// ─── Estat inicial ────────────────────────────────────────────────────────────
const initActivacio = {
  title: '', service: '', owner_name: '', problem_description: '',
  beneficiary_profile: '', recurrence: '', existing_alternatives: '',
  social_relevance: 3,
  clinical_impact: 5, economic_impact: 5, organizational_impact: 5, patient_exp: 5,
  priority: 'mitja', tags: '',
}

const initIdea = () => ({
  id: Date.now() + Math.random(),
  title: '', description: '', pros: '', cons: '',
  estimated_cost: '', required_tech: '', ai_related: false,
})

const initExperimental = {
  objectives: '', hypotheses: '', indicators: '', success_criteria: '',
  test_protocol: '', simulation_scenarios: '',
  methodology: 'design_thinking',
  validation_types: [],
}

const initValidacio = {
  necessitat_score: 5, necessitat_text: '',
  usabilitat_score: 5, usabilitat_text: '',
  seguretat_score:  5, seguretat_text:  '',
  interop_score:    5, interop_text:    '',
  impacte_score:    5, impacte_text:    '',
  escalabilitat_score: 5, escalabilitat_text: '',
  dictamen: 'favorable',
}

const initDissenyFinal = {
  kpis: '', budget: '', partners: '',
  resources: '', risks: '', timeline: '', notes: '',
}

// ─── Helper components ────────────────────────────────────────────────────────
function CharCount({ value, max }) {
  const len = (value || '').length
  const pct = len / max
  if (len === 0) return null
  return (
    <span className={clsx('text-xs font-medium ml-auto',
      pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-orange-400' : 'text-gray-300'
    )}>{len}/{max}</span>
  )
}

function LimitedInput({ label, value, onChange, max, placeholder, required, className, helpText }) {
  const over = value.length >= max
  return (
    <div className={className}>
      <div className="flex items-center mb-1 gap-1">
        <label className="label mb-0">{label}{required && ' *'}</label>
        <CharCount value={value} max={max} />
      </div>
      {helpText && <p className="text-xs text-gray-400 mb-1">{helpText}</p>}
      <input className={clsx('input', over && 'border-red-300 focus:ring-red-400')}
        placeholder={placeholder} value={value} maxLength={max}
        onChange={e => onChange(e.target.value)} />
      {over && <p className="text-xs text-red-500 mt-1">Límit de {max} caràcters assolit</p>}
    </div>
  )
}

function LimitedTextarea({ label, value, onChange, max, placeholder, required, rows = 'h-20', helpText }) {
  const over = value.length >= max
  return (
    <div>
      <div className="flex items-center mb-1 gap-1">
        <label className="label mb-0">{label}{required && ' *'}</label>
        <CharCount value={value} max={max} />
      </div>
      {helpText && <p className="text-xs text-gray-400 mb-1">{helpText}</p>}
      <textarea className={clsx('input resize-none', rows, over && 'border-red-300 focus:ring-red-400')}
        placeholder={placeholder} value={value} maxLength={max}
        onChange={e => onChange(e.target.value)} />
      {over && <p className="text-xs text-red-500 mt-1">Límit de {max} caràcters assolit</p>}
    </div>
  )
}

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

function SectionBanner({ icon: Icon, title, desc, color = 'purple' }) {
  const colors = {
    purple: 'bg-purple-50 border-purple-200 text-purple-500 text-purple-800 text-purple-600',
    pink:   'bg-pink-50 border-pink-200 text-pink-500 text-pink-800 text-pink-600',
    blue:   'bg-blue-50 border-blue-200 text-blue-500 text-blue-800 text-blue-600',
    teal:   'bg-teal-50 border-teal-200 text-teal-600 text-teal-800 text-teal-600',
    green:  'bg-green-50 border-green-200 text-green-600 text-green-800 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-500 text-orange-800 text-orange-600',
  }
  const bg    = `bg-${color}-50`
  const border = `border-${color}-200`
  const ic    = `text-${color}-500`
  const tit   = `text-${color}-800`
  const sub   = `text-${color}-600`
  return (
    <div className={clsx('border rounded-xl p-4 flex gap-3', bg, border)}>
      <Icon size={18} className={clsx('shrink-0 mt-0.5', ic)} />
      <div>
        <p className={clsx('text-sm font-semibold', tit)}>{title}</p>
        <p className={clsx('text-xs mt-0.5', sub)}>{desc}</p>
      </div>
    </div>
  )
}

// ─── Pas 1: Activació ────────────────────────────────────────────────────────
function StepActivacio({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <SectionBanner icon={Search} color="purple"
        title="Activació — Detecció de necessitat"
        desc="Descriu el problema clínic o organitzatiu que has identificat i el seu context. Segueix la metodologia Human Centered Design." />

      <LimitedInput label="Títol de la necessitat" required
        value={data.title} max={LIMITS.title}
        placeholder="Ex: Dificultat per detectar sèpsia a temps a la UCI"
        onChange={v => set('title', v)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Servei afectat *</label>
          <select className="input" value={data.service} onChange={e => set('service', e.target.value)}>
            <option value="">Selecciona...</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <LimitedInput label="Responsable / Referent"
          value={data.owner_name} max={LIMITS.owner_name}
          placeholder="Nom del professional"
          onChange={v => set('owner_name', v)} />
      </div>

      <LimitedTextarea label="Descripció del problema" required rows="h-28"
        value={data.problem_description} max={LIMITS.problem_description}
        helpText="Explica el context clínic, amb quina freqüència ocorre i quines conseqüències té."
        placeholder="Descriu el problema detalladament: qui afecta, amb quina freqüència, quines conseqüències té per al pacient i l'organització..."
        onChange={v => set('problem_description', v)} />

      <LimitedTextarea label="Perfil de persones beneficiàries" rows="h-20"
        value={data.beneficiary_profile} max={LIMITS.beneficiary_profile}
        helpText="Identifica qui es beneficiaria directament d'una solució."
        placeholder="Ex: Pacients de la UCI amb risc de sèpsia, infermeres de guàrdia nocturna..."
        onChange={v => set('beneficiary_profile', v)} />

      <div className="grid grid-cols-2 gap-4">
        <LimitedTextarea label="Intensitat i recurrència" rows="h-20"
          value={data.recurrence} max={LIMITS.recurrence}
          helpText="Amb quina freqüència ocorre? Quants pacients/professionals afecta?"
          placeholder="Ex: 5-10 casos per setmana, afecta el 30% dels ingressos a UCI..."
          onChange={v => set('recurrence', v)} />
        <LimitedTextarea label="Alternatives existents" rows="h-20"
          value={data.existing_alternatives} max={LIMITS.existing_alternatives}
          helpText="Quines solucions existents hi ha i per què no son suficients?"
          placeholder="Ex: Protocols manuals existents però amb alta variabilitat entre professionals..."
          onChange={v => set('existing_alternatives', v)} />
      </div>

      {/* Rellevància social */}
      <div>
        <label className="label mb-2">Rellevància social / assistencial</label>
        <div className="flex gap-2">
          {[
            { v: 1, label: 'Molt baixa' },
            { v: 2, label: 'Baixa' },
            { v: 3, label: 'Mitja' },
            { v: 4, label: 'Alta' },
            { v: 5, label: 'Molt alta' },
          ].map(opt => (
            <button key={opt.v} type="button" onClick={() => set('social_relevance', opt.v)}
              className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold border transition-all',
                data.social_relevance === opt.v
                  ? 'bg-althaia-600 text-white border-althaia-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
              )}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Impacte */}
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
            {['alta', 'mitja', 'baixa'].map(p => (
              <button key={p} type="button" onClick={() => set('priority', p)}
                className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition-all',
                  data.priority === p ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                )}>{p}</button>
            ))}
          </div>
        </div>
        <LimitedInput label="Etiquetes (separades per comes)"
          value={data.tags} max={LIMITS.tags}
          placeholder="Ex: UCI, Crítics, IA, Alarmes"
          onChange={v => set('tags', v)} />
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
      <SectionBanner icon={Lightbulb} color="pink"
        title="Generació d'idees — Design Thinking (Idear)"
        desc="Aplica la fase d'ideació: afegeix totes les possibles solucions sense descartar cap. Al pas següent triaràs la millor." />

      {ideas.map((idea, idx) => (
        <div key={idea.id} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Idea {idx + 1}</span>
            {ideas.length > 1 && (
              <button type="button" onClick={() => removeIdea(idea.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <LimitedInput label="Títol de la idea" required
            value={idea.title} max={LIMITS.idea_title}
            placeholder="Ex: Model d'IA basat en LSTM per a predicció de sèpsia"
            onChange={v => updateIdea(idea.id, 'title', v)} />

          <LimitedTextarea label="Descripció"
            value={idea.description} max={LIMITS.idea_description}
            placeholder="Explica breument com funcionaria aquesta solució..."
            onChange={v => updateIdea(idea.id, 'description', v)} />

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
                onChange={e => updateIdea(idea.id, 'pros', e.target.value)} />
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
                onChange={e => updateIdea(idea.id, 'cons', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cost estimat (€)</label>
              <input className="input" type="number" min="0" placeholder="Ex: 80000"
                value={idea.estimated_cost}
                onChange={e => updateIdea(idea.id, 'estimated_cost', e.target.value)} />
            </div>
            <LimitedInput label="Tecnologies necessàries"
              value={idea.required_tech} max={LIMITS.idea_tech}
              placeholder="Ex: Python, HL7 FHIR, Azure..."
              onChange={v => updateIdea(idea.id, 'required_tech', v)} />
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
      <SectionBanner icon={Target} color="blue"
        title="Selecció de la solució — Design Thinking (Prototipar)"
        desc="Avalua cada idea i selecciona la que té més potencial. Considera viabilitat tècnica, cost i impacte." />

      <div className="space-y-3">
        {validIdeas.map((idea, idx) => {
          const isSelected = selected === idea.id
          return (
            <button key={idea.id} type="button" onClick={() => onSelect(idea.id)}
              className={clsx('w-full text-left border-2 rounded-xl p-4 transition-all',
                isSelected ? 'border-althaia-500 bg-althaia-50 shadow-md' : 'border-gray-200 bg-white hover:border-althaia-300 hover:bg-gray-50'
              )}>
              <div className="flex items-start gap-3">
                <div className={clsx('w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                  isSelected ? 'border-althaia-500 bg-althaia-500' : 'border-gray-300')}>
                  {isSelected && <Check size={13} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={clsx('text-sm font-semibold', isSelected ? 'text-althaia-700' : 'text-gray-900')}>
                      {idx + 1}. {idea.title}
                    </p>
                    {idea.ai_related && <span className="badge bg-violet-100 text-violet-700 text-xs">🤖 IA</span>}
                  </div>
                  {idea.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{idea.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {idea.pros && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg">✅ {idea.pros.slice(0, 60)}{idea.pros.length > 60 ? '…' : ''}</span>}
                    {idea.cons && <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg">❌ {idea.cons.slice(0, 60)}{idea.cons.length > 60 ? '…' : ''}</span>}
                    {idea.estimated_cost && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">💰 €{Number(idea.estimated_cost).toLocaleString()}</span>}
                    {idea.required_tech && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">🛠 {idea.required_tech.slice(0, 40)}</span>}
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

// ─── Pas 4: Disseny experimental ─────────────────────────────────────────────
const METHODOLOGIES = [
  { value: 'hcd',            label: 'Human Centered Design',    desc: 'Centrat en les necessitats dels usuaris finals' },
  { value: 'design_thinking',label: 'Design Thinking',          desc: 'Empatitzar · Definir · Idear · Prototipar · Testar' },
  { value: 'living_lab',     label: 'Living Lab',               desc: 'Experimentació en entorn real amb usuaris reals' },
  { value: 'agile',          label: 'Innovació Àgil',           desc: 'Iteració ràpida i millora contínua' },
  { value: 'evidence_based', label: 'Evidence-Based Evaluation',desc: 'Decisions objectives basades en evidència científica' },
]

const VALIDATION_TYPES = [
  { id: 'funcional',    label: 'Funcional',    desc: 'Fa el que ha de fer?' },
  { id: 'tecnica',      label: 'Tècnica',      desc: 'És estable i fiable?' },
  { id: 'usabilitat',   label: 'Usabilitat',   desc: 'És comprensible i fàcil d\'usar?' },
  { id: 'contextual',   label: 'Contextual',   desc: 'Funciona en el context real?' },
  { id: 'impacte',      label: 'Impacte',      desc: 'Genera canvi mesurable?' },
]

function StepExperimental({ data, onChange, selectedIdea }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  const toggleValidationType = (id) => {
    const current = data.validation_types || []
    set('validation_types', current.includes(id) ? current.filter(t => t !== id) : [...current, id])
  }

  return (
    <div className="space-y-5">
      <SectionBanner icon={FlaskConical} color="teal"
        title="Disseny experimental — Protocol i metodologia"
        desc="Defineix com validaràs la solució. Segueix el mètode científic: objectius clars, hipòtesis mesurables i criteris d'èxit definits." />

      {selectedIdea && (
        <div className="bg-althaia-50 border border-althaia-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-althaia-600 uppercase tracking-wide mb-1">Solució seleccionada</p>
          <p className="text-sm font-semibold text-althaia-800">✅ {selectedIdea.title}</p>
        </div>
      )}

      <LimitedTextarea label="Objectius específics i mesurables (SMART)" required rows="h-28"
        value={data.objectives} max={LIMITS.objectives}
        helpText="Específics, Mesurables, Assolibles, Rellevants i amb un Termini. Un objectiu per línia."
        placeholder="Ex: Reduir el temps de detecció de sèpsia en un 40% en un termini de 6 mesos a la UCI...
Augmentar la satisfacció dels professionals de la salut amb la nova eina per sobre del 7/10..."
        onChange={v => set('objectives', v)} />

      <LimitedTextarea label="Hipòtesis de partida" rows="h-20"
        value={data.hypotheses} max={LIMITS.hypotheses}
        helpText="Quina és la hipòtesi que vols verificar amb el pilot?"
        placeholder="Ex: Si implementem un model d'alerta predictiva de sèpsia, els professionals podran actuar 4 hores abans, reduint la mortalitat un 20%..."
        onChange={v => set('hypotheses', v)} />

      <LimitedTextarea label="Indicadors de mesura (KPIs)" rows="h-20"
        value={data.indicators} max={LIMITS.indicators}
        helpText="Quins indicadors concrets mesuraràs? Defineix la mètrica i el mètode de mesura."
        placeholder="Ex:
- Disponibilitat sistema: > 99.5% (monitoratge automàtic)
- Puntuació SUS d'usabilitat: > 70/100 (enquesta post-pilot)
- Temps detecció sèpsia: -40% (registre HCE)
- Satisfacció professionals: NPS > 7 (enquesta mensual)"
        onChange={v => set('indicators', v)} />

      <LimitedTextarea label="Llindars d'èxit (condicions de validació)" rows="h-20"
        value={data.success_criteria} max={LIMITS.success_criteria}
        helpText="Quins resultats mínims cal assolir per considerar el pilot exitós? (Manual: compliment funcional 100%, 0 incidències crítiques, acceptació >70%)"
        placeholder="Ex: Compliment funcional ≥ 100%, Zero incidències de seguretat crítiques, Nivell d'acceptació professional ≥ 70%..."
        onChange={v => set('success_criteria', v)} />

      <LimitedTextarea label="Protocol de proves previst" rows="h-24"
        value={data.test_protocol} max={LIMITS.test_protocol}
        helpText="Defineix les fases del pilot: simulació, experimentació controlada i pilotatge real."
        placeholder="Ex:
Fase 1 - Simulació (setmana 1-2): Proves en entorn de test amb casos sintètics. 5 professionals.
Fase 2 - Experimentació (mes 1-2): Ús paral·lel amb sistema actual. 20 professionals. UCI.
Fase 3 - Pilot real (mes 3-6): Ús complet en entorn clínic real. Monitoratge continu..."
        onChange={v => set('test_protocol', v)} />

      <LimitedTextarea label="Escenaris de simulació" rows="h-20"
        value={data.simulation_scenarios} max={LIMITS.simulation_scenarios}
        helpText="Quins casos d'ús concrets es validaran a la fase de simulació?"
        placeholder="Ex: Escenari 1: Pacient amb signes vitals deteriorats sense sèpsia (fals positiu). Escenari 2: Pacient amb infecció oculta (detecció precoç)..."
        onChange={v => set('simulation_scenarios', v)} />

      {/* Metodologia */}
      <div>
        <label className="label mb-2">Metodologia principal</label>
        <div className="space-y-2">
          {METHODOLOGIES.map(m => (
            <button key={m.value} type="button" onClick={() => set('methodology', m.value)}
              className={clsx('w-full text-left p-3 rounded-xl border-2 transition-all',
                data.methodology === m.value
                  ? 'border-althaia-500 bg-althaia-50'
                  : 'border-gray-200 bg-white hover:border-althaia-200 hover:bg-gray-50'
              )}>
              <div className="flex items-center gap-3">
                <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  data.methodology === m.value ? 'border-althaia-500 bg-althaia-500' : 'border-gray-300')}>
                  {data.methodology === m.value && <Check size={9} className="text-white" />}
                </div>
                <div>
                  <p className={clsx('text-sm font-semibold', data.methodology === m.value ? 'text-althaia-700' : 'text-gray-700')}>{m.label}</p>
                  <p className="text-xs text-gray-400">{m.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tipus de validació */}
      <div>
        <label className="label mb-2">Tipus de validació previstos</label>
        <p className="text-xs text-gray-400 mb-3">Selecciona tots els tipus de validació que aplicarà aquest projecte.</p>
        <div className="grid grid-cols-1 gap-2">
          {VALIDATION_TYPES.map(vt => {
            const checked = (data.validation_types || []).includes(vt.id)
            return (
              <button key={vt.id} type="button" onClick={() => toggleValidationType(vt.id)}
                className={clsx('flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                  checked ? 'border-althaia-400 bg-althaia-50' : 'border-gray-200 bg-white hover:border-gray-300'
                )}>
                <div className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                  checked ? 'border-althaia-500 bg-althaia-500' : 'border-gray-300')}>
                  {checked && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <p className={clsx('text-sm font-semibold', checked ? 'text-althaia-700' : 'text-gray-700')}>{vt.label}</p>
                  <p className="text-xs text-gray-400">{vt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Pas 5: Criteris de validació ─────────────────────────────────────────────
const CRITERIS = [
  {
    key:     'necessitat',
    label:   '1. Respon a una necessitat real?',
    icon:    '🎯',
    color:   'text-blue-600',
    bg:      'bg-blue-50 border-blue-200',
    desc:    'La solució atén un problema clínic o organitzatiu real, identificat i prioritzat.',
    questions: ['Quins usuaris finals s\'han implicat en la detecció?', 'Quin percentatge de professionals confirma la necessitat?'],
    placeholder: 'Ex: La necessitat ha estat validada per 15 infermeres de la UCI. El 87% confirma el problema diàriament...',
  },
  {
    key:     'usabilitat',
    label:   '2. És fàcil d\'usar i aprendre?',
    icon:    '👤',
    color:   'text-green-600',
    bg:      'bg-green-50 border-green-200',
    desc:    'El sistema pot ser après i usat de forma autònoma per professionals amb formació bàsica.',
    questions: ['Quant temps requereix la formació inicial?', 'La interfície és accessible i clara?'],
    placeholder: 'Ex: Es requereix menys de 30 min de formació. Interfície en català amb etiquetes clares...',
  },
  {
    key:     'seguretat',
    label:   '3. És segura per al pacient i les dades?',
    icon:    '🛡️',
    color:   'text-red-600',
    bg:      'bg-red-50 border-red-200',
    desc:    'El sistema no genera riscos per al pacient, és estable i compleix la normativa de protecció de dades (RGPD).',
    questions: ['Quins riscos d\'ús s\'han identificat?', 'Compleix RGPD i normativa clínica?', 'Tolerància a errors?'],
    placeholder: 'Ex: Dades anonimitzades i emmagatzemades dins la infraestructura hospitalària. Compliment RGPD verificat. Sistema amb redundància activa...',
  },
  {
    key:     'interop',
    label:   '4. S\'integra amb sistemes existents?',
    icon:    '🔗',
    color:   'text-orange-600',
    bg:      'bg-orange-50 border-orange-200',
    desc:    'La solució es pot connectar amb el sistema d\'informació clínic (HCE), dispositius i altres plataformes.',
    questions: ['Quins protocols usa? (HL7 FHIR, DICOM, REST...)', 'Requereix middleware?', 'Impacte sobre sistemes actuals?'],
    placeholder: 'Ex: API REST amb HL7 FHIR. Connector amb SAP/HCE via middleware certificat. Impacte 0 sobre rendiment sistemes actuals...',
  },
  {
    key:     'impacte',
    label:   '5. Genera impacte assistencial?',
    icon:    '📈',
    color:   'text-purple-600',
    bg:      'bg-purple-50 border-purple-200',
    desc:    'La solució millora l\'autonomia del pacient, redueix la càrrega assistencial o augmenta la qualitat de vida.',
    questions: ['Quina millora funcional concreta genera?', 'Com es mesurarà l\'impacte?', 'Impacte econòmic estimat?'],
    placeholder: 'Ex: Reducció prevista 20% mortalitat sèpsia UCI. Estalvi estimat 150.000€/any en estades. Millora satisfacció pacient NPS +15...',
  },
  {
    key:     'escalabilitat',
    label:   '6. És replicable i sostenible?',
    icon:    '🚀',
    color:   'text-teal-600',
    bg:      'bg-teal-50 border-teal-200',
    desc:    'El model és econòmicament viable, es pot mantenir en el temps i extrapolar a altres centres.',
    questions: ['Quin és el cost de manteniment anual?', 'Es pot replicar a altres hospitals?', 'Quin és el model de sostenibilitat?'],
    placeholder: 'Ex: Cost manteniment estimat 20.000€/any. Model replicable a 8 hospitals de la xarxa. Finançament via pressupost d\'innovació...',
  },
]

const DICTAMENS = [
  { value: 'favorable',      label: '✅ Favorable',       desc: 'Compleix tots els criteris. Llest per al pilotatge real.', color: 'border-green-400 bg-green-50' },
  { value: 'condicionada',   label: '⚠️ Condicionada',    desc: 'Aprovació condicionada a correccions menors identificades.', color: 'border-yellow-400 bg-yellow-50' },
  { value: 'reformulacio',   label: '🔄 Reformulació',    desc: 'Requereix ajustos substancials. Torna a la fase de disseny.', color: 'border-orange-400 bg-orange-50' },
  { value: 'no_validacio',   label: '❌ No validació',    desc: 'No supera els criteris mínims. Projecte tancat.', color: 'border-red-400 bg-red-50' },
]

function CriteriCard({ criteri, score, text, onScore, onText }) {
  return (
    <div className={clsx('border rounded-xl p-4 space-y-3', criteri.bg)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={clsx('text-sm font-bold', criteri.color)}>{criteri.icon} {criteri.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{criteri.desc}</p>
        </div>
        <div className={clsx('shrink-0 text-sm font-bold px-2 py-1 rounded-lg bg-white border',
          score >= 7 ? 'text-green-600 border-green-300' : score >= 4 ? 'text-orange-500 border-orange-300' : 'text-red-500 border-red-300'
        )}>{score}/10</div>
      </div>

      <input type="range" min={1} max={10} value={score} onChange={e => onScore(Number(e.target.value))}
        className="w-full accent-althaia-600" />
      <div className="flex justify-between text-xs text-gray-400">
        <span>No compleix (1)</span><span>Acceptable (5)</span><span>Excel·lent (10)</span>
      </div>

      {criteri.questions.length > 0 && (
        <div className="bg-white/70 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preguntes guia:</p>
          {criteri.questions.map((q, i) => <p key={i} className="text-xs text-gray-400">• {q}</p>)}
        </div>
      )}

      <div>
        <div className="flex items-center mb-1 gap-1">
          <label className="text-xs font-semibold text-gray-600">Observacions / Evidències</label>
          <CharCount value={text} max={LIMITS.crit_text} />
        </div>
        <textarea className="input resize-none h-20 text-sm"
          placeholder={criteri.placeholder} value={text} maxLength={LIMITS.crit_text}
          onChange={e => onText(e.target.value)} />
      </div>
    </div>
  )
}

function StepValidacio({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  const avgScore = Math.round(
    (data.necessitat_score + data.usabilitat_score + data.seguretat_score +
     data.interop_score + data.impacte_score + data.escalabilitat_score) / 6
  )

  return (
    <div className="space-y-5">
      <SectionBanner icon={ShieldCheck} color="green"
        title="Criteris de validació — 6 criteris institucionals"
        desc="Avalua cada criteri del Manual Operatiu del Social Living Lab. La puntuació orientarà el dictamen final." />

      {/* Score global */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div className={clsx('w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white shrink-0',
          avgScore >= 7 ? 'bg-green-500' : avgScore >= 5 ? 'bg-althaia-500' : 'bg-orange-400'
        )}>{avgScore}/10</div>
        <div>
          <p className="text-sm font-bold text-gray-900">Puntuació global</p>
          <p className="text-xs text-gray-400 mt-0.5">Mitjana dels 6 criteris. Ajusta els sliders de cada criteri per reflexar l'avaluació real.</p>
        </div>
      </div>

      {CRITERIS.map(c => (
        <CriteriCard key={c.key} criteri={c}
          score={data[`${c.key}_score`]} text={data[`${c.key}_text`]}
          onScore={v => set(`${c.key}_score`, v)} onText={v => set(`${c.key}_text`, v)} />
      ))}

      {/* Dictamen provisional */}
      <div>
        <label className="label mb-2">Dictamen provisional</label>
        <p className="text-xs text-gray-400 mb-3">Basant-te en l'avaluació dels 6 criteris, quin és el dictamen provisional d'aquest projecte?</p>
        <div className="space-y-2">
          {DICTAMENS.map(d => (
            <button key={d.value} type="button" onClick={() => set('dictamen', d.value)}
              className={clsx('w-full text-left p-3 rounded-xl border-2 transition-all',
                data.dictamen === d.value ? d.color : 'border-gray-200 bg-white hover:border-gray-300'
              )}>
              <div className="flex items-center gap-3">
                <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  data.dictamen === d.value ? 'border-althaia-500 bg-althaia-500' : 'border-gray-300')}>
                  {data.dictamen === d.value && <Check size={9} className="text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{d.label}</p>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Pas 6: Disseny final ─────────────────────────────────────────────────────
const DOCUMENTS_CIRCUIT = [
  { id: 'fitxa_activacio',   label: 'Fitxa d\'activació',         phase: 'Activació' },
  { id: 'informe_diagnosi',  label: 'Informe de diagnosi',        phase: 'Anàlisi' },
  { id: 'protocol_experiment',label: 'Protocol experimental',     phase: 'Disseny' },
  { id: 'informe_simulacio', label: 'Informe de simulació',       phase: 'Simulació' },
  { id: 'informe_pilotatge', label: 'Informe de pilotatge',       phase: 'Pilot' },
  { id: 'informe_impacte',   label: 'Informe d\'impacte',         phase: 'Avaluació' },
  { id: 'resolucio_final',   label: 'Resolució final',            phase: 'Decisió' },
]

function StepDissenyFinal({ data, onChange, selectedIdea, experimental }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <SectionBanner icon={PenLine} color="orange"
        title="Disseny final de la solució"
        desc="Defineix el pressupost, l'equip, els recursos i el calendari d'implementació. Documenta els elements necessaris per al circuit." />

      {selectedIdea && (
        <div className="bg-althaia-50 border border-althaia-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-althaia-600 uppercase tracking-wide mb-1">Solució seleccionada</p>
          <p className="text-sm font-semibold text-althaia-800">✅ {selectedIdea.title}</p>
          {selectedIdea.description && <p className="text-xs text-gray-500 mt-1">{selectedIdea.description}</p>}
        </div>
      )}

      <LimitedTextarea label="KPIs i indicadors de mesura finals" rows="h-24"
        value={data.kpis} max={LIMITS.kpis}
        helpText="Resum dels indicadors clau que es monitoritzaran durant el pilot."
        placeholder="Ex: Disponibilitat > 99.5%, SUS > 70, Temps detecció -40%, NPS > 7..."
        onChange={v => set('kpis', v)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Pressupost total estimat (€)</label>
          <input className="input" type="number" min="0"
            placeholder={selectedIdea?.estimated_cost || 'Ex: 120000'}
            value={data.budget}
            onChange={e => set('budget', e.target.value)} />
        </div>
        <LimitedInput label="Partners / Proveïdors"
          value={data.partners} max={LIMITS.partners}
          placeholder="Ex: Philips, Telefónica, UPC..."
          onChange={v => set('partners', v)} />
      </div>

      <LimitedTextarea label="Recursos humans i tècnics necessaris" rows="h-20"
        value={data.resources} max={LIMITS.resources}
        placeholder="Ex: 2 data scientists, 1 tècnic HL7, infraestructura cloud Azure, accés a dades HCE..."
        onChange={v => set('resources', v)} />

      <LimitedTextarea label="Riscos identificats i plans de mitigació" rows="h-20"
        value={data.risks} max={LIMITS.risks}
        placeholder="Ex: Resistència dels professionals → formació específica. Problemes integració HCE → middleware certificat..."
        onChange={v => set('risks', v)} />

      <LimitedTextarea label="Calendari d'implementació" rows="h-24"
        value={data.timeline} max={LIMITS.timeline}
        placeholder="Ex: Mes 1-2: disseny tècnic i formació. Mes 3-4: simulació controlada. Mes 5-10: pilot real. Mes 11-12: avaluació impacte..."
        onChange={v => set('timeline', v)} />

      {/* Documents del circuit */}
      <div>
        <label className="label mb-2">Documents del circuit que generarà aquest projecte</label>
        <p className="text-xs text-gray-400 mb-3">El circuit complert genera 7 documents. Marca els que estan disponibles o en curs.</p>
        <div className="grid grid-cols-1 gap-2">
          {DOCUMENTS_CIRCUIT.map(doc => {
            const checked = (data.documents || []).includes(doc.id)
            return (
              <button key={doc.id} type="button"
                onClick={() => {
                  const curr = data.documents || []
                  set('documents', checked ? curr.filter(d => d !== doc.id) : [...curr, doc.id])
                }}
                className={clsx('flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                  checked ? 'border-althaia-400 bg-althaia-50' : 'border-gray-200 bg-white hover:border-gray-300'
                )}>
                <div className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                  checked ? 'border-althaia-500 bg-althaia-500' : 'border-gray-300')}>
                  {checked && <Check size={11} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={clsx('text-sm font-medium', checked ? 'text-althaia-700' : 'text-gray-700')}>{doc.label}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{doc.phase}</span>
              </button>
            )
          })}
        </div>
      </div>

      <LimitedTextarea label="Notes addicionals" rows="h-20"
        value={data.notes} max={LIMITS.notes}
        placeholder="Qualsevol altra informació rellevant per al projecte..."
        onChange={v => set('notes', v)} />
    </div>
  )
}

// ─── Pàgina principal del wizard ──────────────────────────────────────────────
export default function InnovationWizardPage() {
  const { addProject } = useApp()
  const navigate = useNavigate()

  const [step, setStep]               = useState(1)
  const [activacio, setActivacio]     = useState(initActivacio)
  const [ideas, setIdeas]             = useState([initIdea()])
  const [selected, setSelected]       = useState(null)
  const [experimental, setExperimental] = useState(initExperimental)
  const [validacio, setValidacio]     = useState(initValidacio)
  const [dissenyFinal, setDissenyFinal] = useState(initDissenyFinal)
  const [saved, setSaved]             = useState(false)

  const selectedIdea = ideas.find(i => i.id === selected)

  const canNext = () => {
    switch (step) {
      case 1: return (
        activacio.title.trim().length > 0 &&
        activacio.title.length <= LIMITS.title &&
        activacio.service.trim().length > 0 &&
        activacio.problem_description.trim().length > 0 &&
        activacio.problem_description.length <= LIMITS.problem_description
      )
      case 2: return ideas.some(i => i.title.trim().length > 0)
      case 3: return !!selected
      case 4: return (
        experimental.objectives.trim().length > 0 &&
        experimental.objectives.length <= LIMITS.objectives
      )
      case 5: return true   // Criteris de validació: sempre pot continuar
      case 6: return true   // Disseny final: sempre pot finalitzar
      default: return true
    }
  }

  const handleFinish = () => {
    const avgCritScore = Math.round(
      (validacio.necessitat_score + validacio.usabilitat_score + validacio.seguretat_score +
       validacio.interop_score + validacio.impacte_score + validacio.escalabilitat_score) / 6
    )

    const project = addProject({
      title:         activacio.title.trim(),
      description:   activacio.problem_description.trim(),
      service:       activacio.service,
      owner_name:    activacio.owner_name.trim(),
      priority:      activacio.priority,
      tags:          activacio.tags ? activacio.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      current_phase: 4,
      status:        'active',
      impact: {
        clinical:       activacio.clinical_impact,
        economic:       activacio.economic_impact,
        organizational: activacio.organizational_impact,
        patient_exp:    activacio.patient_exp,
      },
      budget:          Number(dissenyFinal.budget || selectedIdea?.estimated_cost || 0),
      estimated_roi:   0,

      // Dades del wizard (persistides a localStorage)
      wizard_activacio:    activacio,
      wizard_ideas:        ideas.filter(i => i.title.trim()),
      wizard_selected:     selectedIdea,
      wizard_experimental: experimental,
      wizard_validacio:    validacio,
      wizard_dissenyFinal: dissenyFinal,

      // Dictamen i puntuació de validació
      validation_score:   avgCritScore,
      dictamen:           validacio.dictamen,
      methodology:        experimental.methodology,
      validation_types:   experimental.validation_types,
    })
    setSaved(true)
    setTimeout(() => navigate(`/projects/${project.id}`), 1500)
  }

  return (
    <Layout title="Nova Innovació" subtitle="Procés guiat — 6 fases del Social Living Lab">
      <div className="max-w-3xl mx-auto">

        {/* Progress steps */}
        <div className="flex items-center mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const done = step > s.id
            const curr = step === s.id
            const Icon = s.icon
            return (
              <div key={s.id} className="flex items-center shrink-0">
                <button type="button" onClick={() => done && setStep(s.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all',
                    curr  ? 'bg-althaia-600 text-white shadow-md' :
                    done  ? 'bg-green-50 text-green-700 border border-green-200 cursor-pointer hover:bg-green-100' :
                            'bg-gray-50 text-gray-300 border border-gray-100'
                  )}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20">
                    {done ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={12} className={clsx('mx-1 shrink-0', done ? 'text-green-400' : 'text-gray-200')} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="card p-6 mb-5">
          {step === 1 && <StepActivacio data={activacio} onChange={setActivacio} />}
          {step === 2 && <StepIdees ideas={ideas} onChange={setIdeas} />}
          {step === 3 && <StepSeleccio ideas={ideas} selected={selected} onSelect={setSelected} />}
          {step === 4 && <StepExperimental data={experimental} onChange={setExperimental} selectedIdea={selectedIdea} />}
          {step === 5 && <StepValidacio data={validacio} onChange={setValidacio} />}
          {step === 6 && <StepDissenyFinal data={dissenyFinal} onChange={setDissenyFinal} selectedIdea={selectedIdea} experimental={experimental} />}
        </div>

        {/* Banner èxit */}
        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Check size={18} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Projecte creat i guardat correctament!</p>
              <p className="text-xs text-green-600">Redirigint al workspace del projecte...</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button type="button" disabled={saved}
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
            className="btn-secondary">
            <ChevronLeft size={15} />
            {step > 1 ? 'Anterior' : 'Cancel·lar'}
          </button>

          <span className="text-xs text-gray-400">Pas {step} de {STEPS.length}</span>

          {step < STEPS.length ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              Següent <ChevronRight size={15} />
            </button>
          ) : (
            <button type="button" onClick={handleFinish}
              disabled={saved}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              {saved ? <><Check size={15} /> Creat!</> : <><Check size={15} /> Crear projecte</>}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
