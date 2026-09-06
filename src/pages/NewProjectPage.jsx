import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { PHASES, SERVICES } from '../data/constants'
import {
  ChevronLeft, ChevronRight, Check, Save,
  Search, Lightbulb, FlaskConical, Wrench, BarChart2, Flag,
} from 'lucide-react'
import clsx from 'clsx'

const STEPS = [
  { id: 1, icon: Search,      label: 'Activació',    desc: 'Detecció de necessitat'      },
  { id: 2, icon: Lightbulb,   label: 'Objectius',    desc: 'Hipòtesis, indicadors i KPIs' },
  { id: 3, icon: FlaskConical, label: 'Protocol',    desc: 'Proves, simulació, pilot'     },
  { id: 4, icon: Wrench,      label: 'Recursos',     desc: 'Pressupost, riscos, partners' },
  { id: 5, icon: BarChart2,   label: 'Impacte',      desc: 'Matriu d\'impacte'            },
  { id: 6, icon: Flag,        label: 'Confirmar',    desc: 'Resum i crear'                },
]

const LIMITS = {
  title: 120, owner_name: 80, problem_description: 1000,
  beneficiary_profile: 500, recurrence: 300, existing_alternatives: 400, tags: 150,
  objectives: 1000, hypotheses: 500, indicators: 500, success_criteria: 400,
  kpis_finals: 500,
  test_protocol: 800, simulation_scenarios: 500,
  interoperability: 400, usability_plan: 400, digital_twin_desc: 300,
  budget: 20, partners: 300, resources: 500, risks: 500, timeline: 300,
  scalability_plan: 500,
}

const HELIX_ACTORS = ['Ciutadania/Pacients', 'Administracions', 'Universitats/Recerca', 'Empreses/Startups']
const BENEFICIARY_PROFILES = ['Autònom', 'Fràgil', 'Dependència moderada', 'Dependència severa', 'Discapacitat', 'Malaltia crònica', 'Cuidador/a', 'Professional sanitari']
const PILOT_ENVS = ['Domicili', 'Residència', 'Centre de dia', 'Comunitat', 'Hospital', 'Ambulatori']
const IDEA_ORIGINS = ['Professional sanitari', 'Ciutadà/Pacient', 'Empresa/Startup', 'Universitat/Recerca']

function CharCount({ value, max }) {
  const len = (value || '').length
  const pct = len / max
  if (!len) return null
  return (
    <span className={clsx('text-xs font-medium ml-auto', pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-orange-400' : 'text-gray-300')}>
      {len}/{max}
    </span>
  )
}

function LabelRow({ label, htmlFor, max, value }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="label mb-0" htmlFor={htmlFor}>{label}</label>
      {max && <CharCount value={value} max={max} />}
    </div>
  )
}

function CheckGroup({ label, options, values, onChange }) {
  const toggle = (opt) => {
    const next = values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]
    onChange(next)
  }
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2 mt-1.5">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
              values.includes(opt)
                ? 'bg-althaia-600 text-white border-althaia-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
            )}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepIcon({ step }) {
  const Icon = STEPS[step - 1]?.icon
  return Icon ? <Icon size={18} className="text-althaia-600" /> : null
}

function ScoreSlider({ label, value, onChange }) {
  const color = value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-althaia-500' : 'bg-orange-400'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full text-white', color)}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))} className="w-full accent-althaia-600" />
    </div>
  )
}

const initialForm = {
  // Step 1 – Activació
  title: '', service: '', owner_name: '',
  problem_description: '', beneficiary_profile: '',
  recurrence: '', existing_alternatives: '', tags: '',
  priority: 'mitja', current_phase: 1,
  idea_origin: '',
  helix_actors: [],
  beneficiary_social_profile: [],
  // Step 2 – Objectius
  objectives: '', hypotheses: '', indicators: '', success_criteria: '',
  kpis_finals: '',
  // Step 3 – Protocol
  test_protocol: '', simulation_scenarios: '',
  pilot_environments: [],
  interoperability: '',
  usability_plan: '',
  digital_twin: false,
  digital_twin_desc: '',
  // Step 4 – Recursos
  budget: '', partners: '', resources: '', risks: '', timeline: '',
  scalability_plan: '',
  // Step 5 – Impacte
  impact: { clinical: 5, economic: 5, organizational: 5, patient_exp: 5 },
  ai_related: false,
}

function stepErrors(form, step) {
  const e = []
  if (step === 1) {
    if (!form.title.trim())               e.push('El títol és obligatori')
    if (!form.service)                    e.push('Cal seleccionar el servei')
    if (!form.problem_description.trim()) e.push('Cal descriure el problema')
  }
  return e
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

  const set       = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setImpact = (key, val) => setForm(f => ({ ...f, impact: { ...f.impact, [key]: val } }))

  const errors  = stepErrors(form, step)
  const canNext = errors.length === 0

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const project = addProject({
      title:         form.title.trim(),
      description:   form.problem_description.trim(),
      service:       form.service,
      owner_name:    form.owner_name.trim() || 'Responsable',
      priority:      form.priority,
      current_phase: form.current_phase,
      status:        'active',
      tags:          form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      budget:        Number(form.budget) || 0,
      estimated_roi: 0,
      ai_related:    form.ai_related,
      impact: {
        clinical:       form.impact.clinical,
        economic:       form.impact.economic,
        organizational: form.impact.organizational,
        patient_exp:    form.impact.patient_exp,
      },
      wizard_activacio: {
        title:                    form.title,
        service:                  form.service,
        owner_name:               form.owner_name,
        problem_description:      form.problem_description,
        beneficiary_profile:      form.beneficiary_profile,
        recurrence:               form.recurrence,
        existing_alternatives:    form.existing_alternatives,
        priority:                 form.priority,
        tags:                     form.tags,
        idea_origin:              form.idea_origin,
        helix_actors:             form.helix_actors,
        beneficiary_social_profile: form.beneficiary_social_profile,
      },
      wizard_experimental: {
        objectives:           form.objectives,
        hypotheses:           form.hypotheses,
        indicators:           form.indicators,
        success_criteria:     form.success_criteria,
        kpis_finals:          form.kpis_finals,
        test_protocol:        form.test_protocol,
        simulation_scenarios: form.simulation_scenarios,
        pilot_environments:   form.pilot_environments,
        interoperability:     form.interoperability,
        usability_plan:       form.usability_plan,
        digital_twin:         form.digital_twin,
        digital_twin_desc:    form.digital_twin_desc,
      },
      wizard_dissenyFinal: {
        budget:          form.budget,
        partners:        form.partners,
        resources:       form.resources,
        risks:           form.risks,
        timeline:        form.timeline,
        scalability_plan: form.scalability_plan,
      },
    })
    setSaved(true)
    setTimeout(() => navigate(`/projects/${project.id}`), 1200)
  }

  const total = STEPS.length

  return (
    <Layout title="Afegir Projecte" subtitle="Formulari complet — Tots els requisits del Social Living Lab (SISCU)">
      <div className="max-w-2xl mx-auto">

        {/* Step pills */}
        <div className="flex items-center gap-1 mb-7 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const done = step > s.id
            const curr = step === s.id
            return (
              <div key={s.id} className="flex items-center shrink-0">
                <button type="button" onClick={() => done && setStep(s.id)}
                  className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    curr ? 'bg-althaia-600 text-white shadow-sm' :
                    done ? 'bg-green-50 text-green-700 border border-green-200 cursor-pointer hover:bg-green-100' :
                           'bg-gray-50 text-gray-400 border border-gray-200'
                  )}>
                  {done ? <Check size={11} /> : <s.icon size={11} />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < total - 1 && <ChevronRight size={12} className="text-gray-300 mx-0.5 shrink-0" />}
              </div>
            )
          })}
        </div>

        <div className="card p-6 space-y-5 animate-slide-in">
          <div className="flex items-center gap-2 mb-1">
            <StepIcon step={step} />
            <div>
              <h2 className="text-base font-bold text-gray-900">{STEPS[step - 1].label}</h2>
              <p className="text-xs text-gray-400">{STEPS[step - 1].desc}</p>
            </div>
          </div>

          {/* ── Step 1: Activació ───────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div>
                <LabelRow label="Títol del projecte *" max={LIMITS.title} value={form.title} />
                <input className="input" placeholder="Ex: Sistema de detecció precoç de sèpsia per IA"
                  maxLength={LIMITS.title}
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Servei afectat *</label>
                  <select className="input" value={form.service} onChange={e => set('service', e.target.value)}>
                    <option value="">Selecciona...</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <LabelRow label="Responsable" max={LIMITS.owner_name} value={form.owner_name} />
                  <input className="input" placeholder="Nom del responsable"
                    maxLength={LIMITS.owner_name}
                    value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
                </div>
              </div>

              <div>
                <LabelRow label="Descripció del problema / oportunitat *" max={LIMITS.problem_description} value={form.problem_description} />
                <textarea className="input h-24 resize-none"
                  placeholder="Quin problema clínic o assistencial es vol resoldre? Quin és el context? Quina és la rellevància social?"
                  maxLength={LIMITS.problem_description}
                  value={form.problem_description} onChange={e => set('problem_description', e.target.value)} />
              </div>

              {/* SISCU: Origen de la idea */}
              <div>
                <label className="label">Origen de la idea <span className="text-xs font-normal text-gray-400">(Quàdruple Hèlix)</span></label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {IDEA_ORIGINS.map(origin => (
                    <button key={origin} type="button" onClick={() => set('idea_origin', form.idea_origin === origin ? '' : origin)}
                      className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                        form.idea_origin === origin
                          ? 'bg-althaia-600 text-white border-althaia-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}>
                      {origin}
                    </button>
                  ))}
                </div>
              </div>

              {/* SISCU: Actors Quàdruple Hèlix participants */}
              <CheckGroup
                label="Actors de la Quàdruple Hèlix participants"
                options={HELIX_ACTORS}
                values={form.helix_actors}
                onChange={v => set('helix_actors', v)}
              />

              <div>
                <LabelRow label="Perfil de beneficiaris (descripció lliure)" max={LIMITS.beneficiary_profile} value={form.beneficiary_profile} />
                <textarea className="input h-16 resize-none"
                  placeholder="Qui es beneficia? Pacients crònics, professionals d'infermeria...  Quants aproximadament?"
                  maxLength={LIMITS.beneficiary_profile}
                  value={form.beneficiary_profile} onChange={e => set('beneficiary_profile', e.target.value)} />
              </div>

              {/* SISCU: Perfil social dels beneficiaris */}
              <CheckGroup
                label="Perfil social dels beneficiaris"
                options={BENEFICIARY_PROFILES}
                values={form.beneficiary_social_profile}
                onChange={v => set('beneficiary_social_profile', v)}
              />

              <div>
                <LabelRow label="Intensitat i recurrència de la necessitat" max={LIMITS.recurrence} value={form.recurrence} />
                <input className="input"
                  placeholder="Ex: Diàriament, afecta ~40 pacients/dia a UCI i Urgències"
                  maxLength={LIMITS.recurrence}
                  value={form.recurrence} onChange={e => set('recurrence', e.target.value)} />
              </div>

              <div>
                <LabelRow label="Alternatives ja existents" max={LIMITS.existing_alternatives} value={form.existing_alternatives} />
                <textarea className="input h-16 resize-none"
                  placeholder="Quines solucions actuals hi ha? Per què no son suficients?"
                  maxLength={LIMITS.existing_alternatives}
                  value={form.existing_alternatives} onChange={e => set('existing_alternatives', e.target.value)} />
              </div>

              <div>
                <LabelRow label="Etiquetes (separades per comes)" max={LIMITS.tags} value={form.tags} />
                <input className="input" placeholder="Ex: IA, Cardiologia, Wearables, Prevenció"
                  maxLength={LIMITS.tags}
                  value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>

              <div>
                <label className="label">Prioritat</label>
                <div className="flex gap-3">
                  {['alta','mitja','baixa'].map(p => (
                    <button key={p} type="button" onClick={() => set('priority', p)}
                      className={clsx('flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                        form.priority === p ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}>{p}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Objectius ───────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div>
                <LabelRow label="Objectius específics" max={LIMITS.objectives} value={form.objectives} />
                <textarea className="input h-24 resize-none"
                  placeholder="Quins resultats concrets i mesurables s'esperen assolir? Usa verbals d'acció: millorar, reduir, augmentar..."
                  maxLength={LIMITS.objectives}
                  value={form.objectives} onChange={e => set('objectives', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Hipòtesi de partida" max={LIMITS.hypotheses} value={form.hypotheses} />
                <textarea className="input h-20 resize-none"
                  placeholder="Si [acció] aleshores [resultat esperat] perquè [raonament]..."
                  maxLength={LIMITS.hypotheses}
                  value={form.hypotheses} onChange={e => set('hypotheses', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Indicadors de mesura (KPIs de seguiment)" max={LIMITS.indicators} value={form.indicators} />
                <textarea className="input h-20 resize-none"
                  placeholder="Ex: Temps detecció sèpsia (min), Mortalitat UCI (%), Satisfacció professional (1-10)..."
                  maxLength={LIMITS.indicators}
                  value={form.indicators} onChange={e => set('indicators', e.target.value)} />
              </div>

              {/* SISCU: KPIs finals amb target quantitatiu */}
              <div>
                <LabelRow label="KPIs finals amb target quantitatiu" max={LIMITS.kpis_finals} value={form.kpis_finals} />
                <textarea className="input h-20 resize-none"
                  placeholder="Ex: Temps de detecció: de 45 min → 20 min (-55%). Taxa d'èxit del pilot: ≥80%. Satisfacció SUS: ≥70 punts."
                  maxLength={LIMITS.kpis_finals}
                  value={form.kpis_finals} onChange={e => set('kpis_finals', e.target.value)} />
              </div>

              <div>
                <LabelRow label="Llindar d'èxit" max={LIMITS.success_criteria} value={form.success_criteria} />
                <textarea className="input h-16 resize-none"
                  placeholder="Quins valors mínims han d'assolir els indicadors per considerar el pilot exitós?"
                  maxLength={LIMITS.success_criteria}
                  value={form.success_criteria} onChange={e => set('success_criteria', e.target.value)} />
              </div>
            </>
          )}

          {/* ── Step 3: Protocol ────────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <div>
                <LabelRow label="Protocol de proves" max={LIMITS.test_protocol} value={form.test_protocol} />
                <textarea className="input h-24 resize-none"
                  placeholder="Descriu els passos per dur a terme la prova pilot. Qui participa? Quin procés se segueix? Com es recullen les dades?"
                  maxLength={LIMITS.test_protocol}
                  value={form.test_protocol} onChange={e => set('test_protocol', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Escenaris de simulació" max={LIMITS.simulation_scenarios} value={form.simulation_scenarios} />
                <textarea className="input h-20 resize-none"
                  placeholder="Quins casos d'ús o situacions concretes s'han de provar?"
                  maxLength={LIMITS.simulation_scenarios}
                  value={form.simulation_scenarios} onChange={e => set('simulation_scenarios', e.target.value)} />
              </div>

              {/* SISCU: Entorn de pilotatge */}
              <CheckGroup
                label="Entorn de pilotatge"
                options={PILOT_ENVS}
                values={form.pilot_environments}
                onChange={v => set('pilot_environments', v)}
              />

              {/* SISCU: Bessó Digital */}
              <div>
                <label className="label">Bessó Digital (Digital Twin)</label>
                <div className="flex gap-3 mb-2">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button" onClick={() => set('digital_twin', v)}
                      className={clsx('px-5 py-2 rounded-lg text-sm font-medium border transition-all',
                        form.digital_twin === v ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}>{v ? '✅ Sí' : '❌ No'}</button>
                  ))}
                </div>
                {form.digital_twin && (
                  <div>
                    <LabelRow label="Descripció del Bessó Digital" max={LIMITS.digital_twin_desc} value={form.digital_twin_desc} />
                    <textarea className="input h-16 resize-none"
                      placeholder="Com s'usarà el bessó digital? Quin entorn o plataforma?"
                      maxLength={LIMITS.digital_twin_desc}
                      value={form.digital_twin_desc} onChange={e => set('digital_twin_desc', e.target.value)} />
                  </div>
                )}
              </div>

              {/* SISCU: Interoperabilitat */}
              <div>
                <LabelRow label="Interoperabilitat (requisits tècnics)" max={LIMITS.interoperability} value={form.interoperability} />
                <textarea className="input h-20 resize-none"
                  placeholder="Quins sistemes cal integrar? (HIS, SAP, HL7, FHIR...) Quins estàndards es requereixen?"
                  maxLength={LIMITS.interoperability}
                  value={form.interoperability} onChange={e => set('interoperability', e.target.value)} />
              </div>

              {/* SISCU: Usabilitat */}
              <div>
                <LabelRow label="Pla d'avaluació d'usabilitat (SUS)" max={LIMITS.usability_plan} value={form.usability_plan} />
                <textarea className="input h-20 resize-none"
                  placeholder="Com s'avaluarà la usabilitat? Qüestionari SUS? Quin perfil d'usuaris? Quant és el target SUS (p.ex. ≥70)?"
                  maxLength={LIMITS.usability_plan}
                  value={form.usability_plan} onChange={e => set('usability_plan', e.target.value)} />
              </div>

              <div>
                <label className="label">Fase d'entrada al pipeline</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PHASES.map(ph => (
                    <button key={ph.id} type="button" onClick={() => set('current_phase', ph.id)}
                      className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all text-left',
                        form.current_phase === ph.id
                          ? 'bg-althaia-600 text-white border-althaia-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-althaia-300'
                      )}>
                      <span>{ph.icon}</span>
                      <span className="font-medium text-xs">{ph.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 4: Recursos ────────────────────────────────────────────── */}
          {step === 4 && (
            <>
              <div>
                <label className="label">Pressupost estimat (€)</label>
                <input className="input" type="number" placeholder="Ex: 85000"
                  value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Partners i proveïdors" max={LIMITS.partners} value={form.partners} />
                <textarea className="input h-20 resize-none"
                  placeholder="Empreses tecnològiques, universitats, altres hospitals, fundacions..."
                  maxLength={LIMITS.partners}
                  value={form.partners} onChange={e => set('partners', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Recursos necessaris" max={LIMITS.resources} value={form.resources} />
                <textarea className="input h-20 resize-none"
                  placeholder="Equip humà (perfils, dedicació), infraestructura TI, accés a dades clíniques, maquinari específic, llicències..."
                  maxLength={LIMITS.resources}
                  value={form.resources} onChange={e => set('resources', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Riscos identificats i pla de mitigació" max={LIMITS.risks} value={form.risks} />
                <textarea className="input h-20 resize-none"
                  placeholder="Riscos tècnics, clínics, legals, de privacitat, d'adopció... Com es mitiguen?"
                  maxLength={LIMITS.risks}
                  value={form.risks} onChange={e => set('risks', e.target.value)} />
              </div>
              <div>
                <LabelRow label="Cronograma / fites clau" max={LIMITS.timeline} value={form.timeline} />
                <textarea className="input h-16 resize-none"
                  placeholder="Ex: Mes 1: kick-off. Mes 3: pilot inicial. Mes 6: avaluació. Mes 12: implementació."
                  maxLength={LIMITS.timeline}
                  value={form.timeline} onChange={e => set('timeline', e.target.value)} />
              </div>

              {/* SISCU: Escalabilitat */}
              <div>
                <LabelRow label="Escalabilitat i transferència al SISCU" max={LIMITS.scalability_plan} value={form.scalability_plan} />
                <textarea className="input h-20 resize-none"
                  placeholder="Com es replicarà la solució a altres centres o territoris? Quins requisits de transferència al sistema públic (SISCU)?"
                  maxLength={LIMITS.scalability_plan}
                  value={form.scalability_plan} onChange={e => set('scalability_plan', e.target.value)} />
              </div>
            </>
          )}

          {/* ── Step 5: Impacte ─────────────────────────────────────────────── */}
          {step === 5 && (
            <>
              <p className="text-sm text-gray-500">Valora l'impacte esperat de 1 (mínim) a 10 (màxim).</p>
              <div className="space-y-4">
                <ScoreSlider label="🏥 Impacte Clínic"        value={form.impact.clinical}       onChange={v => setImpact('clinical', v)} />
                <ScoreSlider label="💶 Impacte Econòmic"       value={form.impact.economic}       onChange={v => setImpact('economic', v)} />
                <ScoreSlider label="🏢 Impacte Organitzatiu"   value={form.impact.organizational}  onChange={v => setImpact('organizational', v)} />
                <ScoreSlider label="😊 Experiència Pacient"    value={form.impact.patient_exp}    onChange={v => setImpact('patient_exp', v)} />
              </div>
              <div>
                <label className="label">Projecte relacionat amb IA</label>
                <div className="flex gap-3 mt-1">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button" onClick={() => set('ai_related', v)}
                      className={clsx('px-6 py-2 rounded-lg text-sm font-medium border transition-all',
                        form.ai_related === v ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                      )}>{v ? '✅ Sí' : '❌ No'}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 6: Confirmar ───────────────────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-althaia-50 border border-althaia-100 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-althaia-900">Resum del projecte</h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block">Títol</span><span className="font-semibold text-gray-900">{form.title || '—'}</span></div>
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block">Servei</span><span className="font-semibold text-gray-900">{form.service || '—'}</span></div>
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block">Responsable</span><span className="text-gray-700">{form.owner_name || '—'}</span></div>
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block">Prioritat</span><span className="capitalize text-gray-700">{form.priority}</span></div>
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block">Fase entrada</span><span className="text-gray-700">{PHASES[form.current_phase - 1]?.icon} {PHASES[form.current_phase - 1]?.name}</span></div>
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block">Pressupost</span><span className="text-gray-700">{form.budget ? `€${Number(form.budget).toLocaleString()}` : '—'}</span></div>
                </div>

                {form.idea_origin && (
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Origen</span>
                    <p className="text-xs text-gray-700">{form.idea_origin}</p>
                  </div>
                )}

                {form.helix_actors.length > 0 && (
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Actors Hèlix</span>
                    <p className="text-xs text-gray-700">{form.helix_actors.join(', ')}</p>
                  </div>
                )}

                {form.problem_description && (
                  <div><span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Problema</span>
                    <p className="text-xs text-gray-700 line-clamp-3">{form.problem_description}</p>
                  </div>
                )}

                {/* Completitud */}
                <div className="mt-2 border-t border-althaia-100 pt-3">
                  <p className="text-xs font-semibold text-althaia-700 mb-1.5">Requisits SISCU completats:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {[
                      ['Títol',                   form.title],
                      ['Servei',                  form.service],
                      ['Responsable',             form.owner_name],
                      ['Descripció problema',     form.problem_description],
                      ['Origen idea (Hèlix)',     form.idea_origin],
                      ['Actors Quàdruple Hèlix',  form.helix_actors.length > 0],
                      ['Perfil social beneficiaris', form.beneficiary_social_profile.length > 0],
                      ['Beneficiaris (desc.)',    form.beneficiary_profile],
                      ['Recurrència',             form.recurrence],
                      ['Alternatives',            form.existing_alternatives],
                      ['Objectius',               form.objectives],
                      ['Hipòtesi',                form.hypotheses],
                      ['KPIs seguiment',          form.indicators],
                      ['KPIs finals amb target',  form.kpis_finals],
                      ['Llindar d\'èxit',         form.success_criteria],
                      ['Protocol de proves',      form.test_protocol],
                      ['Escenaris simulació',     form.simulation_scenarios],
                      ['Entorn pilotatge',        form.pilot_environments.length > 0],
                      ['Interoperabilitat',       form.interoperability],
                      ['Pla usabilitat (SUS)',    form.usability_plan],
                      ['Pressupost',              form.budget],
                      ['Partners',                form.partners],
                      ['Recursos',                form.resources],
                      ['Riscos',                  form.risks],
                      ['Cronograma',              form.timeline],
                      ['Escalabilitat SISCU',     form.scalability_plan],
                    ].map(([label, val]) => (
                      <div key={label} className={clsx('flex items-center gap-1.5', val ? 'text-green-600' : 'text-gray-300')}>
                        <span>{val ? '✓' : '○'}</span><span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {saved && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
                  <Check size={18} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Projecte creat correctament!</p>
                    <p className="text-xs text-green-600">Redirigint al workspace...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button type="button" disabled={saved}
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/projects')}
            className="btn-secondary">
            <ChevronLeft size={15} /> {step > 1 ? 'Anterior' : 'Cancel·lar'}
          </button>

          {step < total
            ? <button type="button" onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
                className="btn-primary disabled:opacity-40">
                Següent <ChevronRight size={15} />
              </button>
            : <button type="button" onClick={handleSubmit}
                disabled={saved || !form.title.trim()}
                className={clsx('btn-primary disabled:opacity-40', saved && 'bg-green-500')}>
                {saved ? <><Check size={15} /> Creat!</> : <><Save size={15} /> Crear projecte</>}
              </button>
          }
        </div>
      </div>
    </Layout>
  )
}
