import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { PHASES, PHASE_COLORS, EVALUATION_CRITERIA } from '../data/constants'
import { PhaseBadge, StatusBadge, TaskStatusBadge, PriorityBadge } from '../components/shared/Badge'
import Modal from '../components/shared/Modal'
import {
  ArrowLeft, Users, Calendar, Euro,
  CheckSquare, MessageSquare, History,
  FlaskConical, BarChart2, TrendingUp,
  AlertCircle, Clock, Tag, ArrowRight, Trash2,
  Plus, Check, ShieldCheck, ChevronDown, ChevronUp,
  Flag, Milestone,
} from 'lucide-react'
import clsx from 'clsx'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   icon: BarChart2,   label: 'Visió general' },
  { id: 'tasks',      icon: CheckSquare, label: 'Tasques'       },
  { id: 'validation', icon: ShieldCheck, label: 'Validació SLL' },
  { id: 'pilot',      icon: FlaskConical,label: 'Pilot'         },
  { id: 'evaluation', icon: TrendingUp,  label: 'Avaluació'     },
  { id: 'ideas',      icon: AlertCircle, label: 'Idees'         },
  { id: 'feedback',   icon: MessageSquare,label: 'Feedback'     },
  { id: 'timeline',   icon: History,     label: 'Timeline'      },
]

function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
      {TABS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={clsx('tab flex items-center gap-1.5 shrink-0', active === t.id ? 'tab-active' : 'tab-inactive')}>
          <t.icon size={14} />
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Impact Radar ─────────────────────────────────────────────────────────────
function ImpactRadar({ impact }) {
  const data = [
    { subject: 'Clínic',       A: impact.clinical },
    { subject: 'Econòmic',     A: impact.economic },
    { subject: 'Organitzatiu', A: impact.organizational },
    { subject: 'Pac. Exp.',    A: impact.patient_exp },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
        <Radar dataKey="A" stroke="#3366ff" fill="#3366ff" fillOpacity={0.2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ─── ENoLL Criteria (collapsible) ─────────────────────────────────────────────
const ENOLL_CRITERIA = [
  { key: 'cocreacio',               label: 'Cocreació'                    },
  { key: 'quadruple_helix',         label: 'Quàdruple Hèlix'              },
  { key: 'living_lab_fisic',        label: 'Living Lab físic'             },
  { key: 'pilotatge_domiciliari',   label: 'Pilotatge domiciliari'        },
  { key: 'innovacio_oberta',        label: 'Innovació oberta'             },
  { key: 'ia_tecnologies',          label: 'IA i tecnologies emergents'   },
  { key: 'mesura_impacte',          label: 'Mesura d\'impacte'            },
  { key: 'escalabilitat_territorial',label: 'Escalabilitat territorial'  },
  { key: 'governanca_multiactor',   label: 'Governança multiactor'        },
  { key: 'experimentacio_real',     label: 'Experimentació en entorn real'},
]

function ENoLLSection({ project, onUpdate }) {
  const [open, setOpen] = useState(false)
  const criteria = project.enoll_criteria || {}

  const toggle = (key, val) => {
    const current = criteria[key]
    const next = current === val ? null : val
    onUpdate({ enoll_criteria: { ...criteria, [key]: next } })
  }

  const trueCount = ENOLL_CRITERIA.filter(c => criteria[c.key] === true).length
  const pct = Math.round((trueCount / ENOLL_CRITERIA.length) * 100)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
            ENoLL
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Criteris ENoLL</p>
            <p className="text-xs text-gray-400">{trueCount}/{ENOLL_CRITERIA.length} criteris complerts ({pct}%)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-2">
            {ENOLL_CRITERIA.map(c => {
              const val = criteria[c.key]
              return (
                <div key={c.key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-700">{c.label}</span>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => toggle(c.key, true)}
                      className={clsx('px-3 py-1 rounded-lg text-xs font-semibold border transition-all',
                        val === true
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'
                      )}>Sí</button>
                    <button type="button" onClick={() => toggle(c.key, false)}
                      className={clsx('px-3 py-1 rounded-lg text-xs font-semibold border transition-all',
                        val === false
                          ? 'bg-red-400 text-white border-red-400'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500'
                      )}>No</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={clsx('mt-4 rounded-xl p-3 text-center text-sm font-semibold',
            pct === 100 ? 'bg-green-50 text-green-700' :
            pct >= 70 ? 'bg-blue-50 text-blue-700' :
            pct >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
          )}>
            {pct === 100 ? '✅ Compliment total ENoLL' :
             pct >= 70 ? `✓ Bon nivell ENoLL (${pct}%)` :
             pct >= 40 ? `⚠ Compliment parcial ENoLL (${pct}%)` :
             `❌ Compliment baix ENoLL (${pct}%)`}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────
const STATUS_CYCLE = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' }
const STATUS_STYLE = {
  pending:     'bg-gray-300',
  in_progress: 'bg-blue-400',
  completed:   'bg-green-500',
}
const STATUS_LABEL = { pending: 'Pendent', in_progress: 'En curs', completed: 'Completat' }

function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div className={clsx('flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors',
      task.status === 'completed' && 'opacity-70'
    )}>
      <button type="button" onClick={onToggle} title={`Estat: ${STATUS_LABEL[task.status]}`}
        className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          task.status === 'completed'
            ? 'bg-green-500 border-green-500'
            : task.status === 'in_progress'
            ? 'bg-blue-400 border-blue-400'
            : 'border-gray-300 hover:border-althaia-400'
        )}>
        {task.status === 'completed' && <Check size={11} className="text-white" />}
        {task.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-white" />}
      </button>

      <p className={clsx('flex-1 text-sm', task.status === 'completed' && 'line-through text-gray-400')}>
        {task.title}
      </p>

      <div className="flex items-center gap-2 shrink-0">
        {task.assigned_to && (
          <div className="w-6 h-6 rounded-full bg-althaia-100 flex items-center justify-center text-xs font-bold text-althaia-700 shrink-0"
            title={task.assigned_to}>
            {String(task.assigned_to).slice(0, 2).toUpperCase()}
          </div>
        )}
        {task.due_date && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={10} /> {task.due_date}
          </span>
        )}
        <PriorityBadge priority={task.priority} />
        {task.isCustom && onDelete && (
          <button type="button" onClick={onDelete}
            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

function TasksTab({ project, tasks, onAdd, onToggle, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title: '', priority: 'mitja', due_date: '', assigned_to: '' })

  const handleAdd = () => {
    if (!form.title.trim()) return
    onAdd(project.id, form)
    setForm({ title: '', priority: 'mitja', due_date: '', assigned_to: '' })
    setShowForm(false)
  }

  const pending   = tasks.filter(t => t.status !== 'completed').length
  const completed = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-gray-700">Tasques del projecte</h4>
          <div className="flex gap-1.5 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{pending} pendents</span>
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{completed} fetes</span>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm(s => !s)}
          className="btn-primary text-xs py-1.5 px-3">
          <Plus size={13} /> Nova tasca
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border-2 border-dashed border-althaia-200 rounded-xl p-4 space-y-3 bg-althaia-50/30">
          <input className="input text-sm" placeholder="Títol de la tasca *"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prioritat</label>
              <select className="input text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="alta">Alta</option>
                <option value="mitja">Mitja</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Data límit</label>
              <input type="date" className="input text-sm"
                value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Assignat a</label>
              <input className="input text-sm" placeholder="Nom..."
                value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAdd} disabled={!form.title.trim()}
              className="btn-primary flex-1 justify-center disabled:opacity-40">
              <Check size={14} /> Afegir tasca
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel·lar
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-400">
          <CheckSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sense tasques. Crea la primera!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* In progress first, then pending, then completed */}
          {['in_progress', 'pending', 'completed'].flatMap(status =>
            tasks.filter(t => t.status === status).map(t => (
              <TaskCard key={t.id} task={t}
                onToggle={() => onToggle(project.id, t.id, { status: STATUS_CYCLE[t.status] })}
                onDelete={t.isCustom ? () => onDelete(project.id, t.id) : null} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Validation SLL Tab ──────────────────────────────────────────────────────
const SLL_CRITERIA = [
  {
    key: 'necessitat',
    label: '1. Necessitat real',
    icon: '🎯',
    color: 'blue',
    description: 'Verifica que la proposta respon a problemàtiques objectives. Inclou: problema concret que es pretén resoldre, rellevància social o assistencial del repte, perfil real de persones beneficiàries, intensitat i recurrència de la necessitat, inexistència o insuficiència de solucions alternatives.',
    questions: ['Quins usuaris finals s\'han implicat?', 'Quin % de professionals confirma la necessitat?', 'Existeixen alternatives suficients?'],
  },
  {
    key: 'usabilitat',
    label: '2. Usabilitat',
    icon: '👤',
    color: 'green',
    description: 'Avalua si la solució pot ser utilitzada de manera efectiva, comprensible i autònoma. Inclou: facilitat d\'aprenentatge, claredat de funcionament, comprensibilitat de la interfície, accessibilitat física i cognitiva, càrrega d\'esforç requerida, nivell d\'acceptació percebuda.',
    questions: ['Quant temps requereix la formació inicial?', 'La interfície és accessible per a persones grans o amb diversitat funcional?', 'Quin és el nivell d\'acceptació percebuda?'],
  },
  {
    key: 'seguretat',
    label: '3. Seguretat',
    icon: '🛡️',
    color: 'red',
    description: 'Garanteix que no s\'introdueixen riscos físics, funcionals, digitals o organitzatius. Inclou: absència de risc d\'ús, comportament estable davant incidències, tolerància a errors, capacitat de resposta davant fallades, protecció de la informació, compliment RGPD i privacitat.',
    questions: ['Quins riscos d\'ús s\'han identificat i mitigat?', 'Compleix RGPD i normativa clínica?', 'Com respon el sistema davant fallades?'],
  },
  {
    key: 'interop',
    label: '4. Interoperabilitat',
    icon: '🔗',
    color: 'orange',
    description: 'Verifica que la solució pot integrar-se dins l\'ecosistema tecnològic i operatiu existent. Inclou: capacitat d\'intercanvi de dades, compatibilitat amb protocols estàndard (HL7 FHIR, DICOM), possibilitat d\'integració via API, connectivitat amb plataformes externes.',
    questions: ['Quins protocols estàndard utilitza?', 'Com s\'integra amb el sistema d\'informació clínic?', 'Genera dependències tecnològiques tancades?'],
  },
  {
    key: 'impacte',
    label: '5. Impacte',
    icon: '📈',
    color: 'purple',
    description: 'Verifica que la solució produeix millores objectives i mesurables. Inclou: millora de l\'autonomia personal, reducció de càrrega assistencial, increment de seguretat percebuda, optimització de processos, millora de qualitat de vida, eficiència operativa.',
    questions: ['Quines millores concretes i mesurables genera?', 'L\'impacte està sustentat en evidència?', 'Quin és el retorn econòmic i social estimat?'],
  },
  {
    key: 'escalabilitat',
    label: '6. Escalabilitat',
    icon: '🚀',
    color: 'teal',
    description: 'Determina si la solució pot transcendir l\'àmbit experimental i desplegar-se de forma estructural. Inclou: viabilitat econòmica, sostenibilitat operativa, adaptabilitat territorial, requeriments de manteniment, capacitat de transferència al sistema públic.',
    questions: ['Quin és el cost de manteniment anual?', 'Es pot replicar a altres centres sense perdre eficàcia?', 'Té potencial d\'incorporació al sistema públic?'],
  },
]

const DICTAMENS = [
  { value: 'favorable',    label: '✅ Favorable',    color: 'border-green-400 bg-green-50 text-green-800'  },
  { value: 'condicionada', label: '⚠️ Condicionada', color: 'border-yellow-400 bg-yellow-50 text-yellow-800' },
  { value: 'reformulacio', label: '🔄 Reformulació', color: 'border-orange-400 bg-orange-50 text-orange-800' },
  { value: 'no_validacio', label: '❌ No validació', color: 'border-red-400 bg-red-50 text-red-800'          },
]

function ValidationTab({ project, onSave }) {
  const initData = project.wizard_validacio || {
    necessitat_score: 5, necessitat_text: '',
    usabilitat_score: 5, usabilitat_text: '',
    seguretat_score:  5, seguretat_text:  '',
    interop_score:    5, interop_text:    '',
    impacte_score:    5, impacte_text:    '',
    escalabilitat_score: 5, escalabilitat_text: '',
    dictamen: 'favorable',
  }

  const [data, setData]       = useState(initData)
  const [expanded, setExpanded] = useState(null)
  const [saved, setSaved]     = useState(false)

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const avgScore = Math.round(
    (data.necessitat_score + data.usabilitat_score + data.seguretat_score +
     data.interop_score + data.impacte_score + data.escalabilitat_score) / 6
  )

  const handleSave = () => {
    onSave({ wizard_validacio: data })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Score global */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div className={clsx('w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white shrink-0',
          avgScore >= 7 ? 'bg-green-500' : avgScore >= 5 ? 'bg-althaia-500' : 'bg-orange-400'
        )}>{avgScore}/10</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Puntuació global de validació</p>
          <p className="text-xs text-gray-400 mt-0.5">Mitjana dels 6 criteris institucionals del Social Living Lab. Expandeix cada criteri per avaluar-lo.</p>
        </div>
        <button type="button" onClick={handleSave}
          className={clsx('btn-primary text-xs py-1.5 shrink-0', saved && 'bg-green-500')}>
          {saved ? <><Check size={13} /> Guardat!</> : <><Check size={13} /> Guardar</>}
        </button>
      </div>

      {/* 6 criteria accordion */}
      {SLL_CRITERIA.map(c => {
        const score = data[`${c.key}_score`] ?? 5
        const text  = data[`${c.key}_text`]  ?? ''
        const isOpen = expanded === c.key
        const color = score >= 7 ? 'text-green-600' : score >= 5 ? 'text-althaia-600' : 'text-orange-500'

        return (
          <div key={c.key} className="border border-gray-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setExpanded(isOpen ? null : c.key)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                  {!isOpen && text && <p className="text-xs text-gray-400 truncate max-w-xs">{text}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={clsx('text-sm font-bold', color)}>{score}/10</span>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">{c.description}</p>

                {/* Score slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Puntuació</label>
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full text-white',
                      score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-althaia-500' : 'bg-orange-400'
                    )}>{score}/10</span>
                  </div>
                  <input type="range" min={1} max={10} value={score}
                    onChange={e => set(`${c.key}_score`, Number(e.target.value))}
                    className="w-full accent-althaia-600" />
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>No compleix (1)</span><span>Acceptable (5)</span><span>Excel·lent (10)</span>
                  </div>
                </div>

                {/* Questions */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Preguntes guia</p>
                  {c.questions.map((q, i) => (
                    <p key={i} className="text-xs text-blue-600">• {q}</p>
                  ))}
                </div>

                {/* Observations */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Observacions i evidències
                  </label>
                  <textarea className="input resize-none h-20 text-sm"
                    placeholder="Descriu les evidències recollides, incidències, resultats del pilot..."
                    value={text} onChange={e => set(`${c.key}_text`, e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Dictamen */}
      <div>
        <label className="label mb-2">Dictamen institucional</label>
        <div className="grid grid-cols-2 gap-2">
          {DICTAMENS.map(d => (
            <button key={d.value} type="button" onClick={() => set('dictamen', d.value)}
              className={clsx('p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left',
                data.dictamen === d.value ? d.color : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save button bottom */}
      <button type="button" onClick={handleSave}
        className={clsx('w-full btn-primary justify-center', saved && 'bg-green-500')}>
        {saved ? <><Check size={15} /> Avaluació guardada!</> : <><Check size={15} /> Guardar avaluació</>}
      </button>
    </div>
  )
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
const EVENT_ICONS = {
  milestone:   { icon: '🏁', label: 'Fita',        color: 'bg-purple-100 text-purple-700' },
  meeting:     { icon: '📅', label: 'Reunió',       color: 'bg-blue-100 text-blue-700'   },
  deliverable: { icon: '📦', label: 'Lliurable',    color: 'bg-teal-100 text-teal-700'   },
  note:        { icon: '📝', label: 'Nota',          color: 'bg-gray-100 text-gray-600'   },
}

function TimelineTab({ project, history, onAddEvent, onDeleteEvent }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], type: 'milestone', notes: '' })

  const handleAdd = () => {
    if (!form.title.trim()) return
    onAddEvent(project.id, form)
    setForm({ title: '', date: new Date().toISOString().split('T')[0], type: 'milestone', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Historial i fites del projecte</h4>
        <button type="button" onClick={() => setShowForm(s => !s)} className="btn-primary text-xs py-1.5 px-3">
          <Plus size={13} /> Afegir fita
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-dashed border-althaia-200 rounded-xl p-4 space-y-3 bg-althaia-50/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Títol *</label>
              <input className="input text-sm" placeholder="Nom de la fita o event..."
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Data</label>
              <input type="date" className="input text-sm"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipus</label>
            <div className="flex gap-2">
              {Object.entries(EVENT_ICONS).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type: key }))}
                  className={clsx('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    form.type === key ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                  )}>{cfg.icon} {cfg.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea className="input resize-none h-16 text-sm" placeholder="Descripció opcional..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAdd} disabled={!form.title.trim()}
              className="btn-primary flex-1 justify-center disabled:opacity-40">
              <Check size={14} /> Afegir
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel·lar
            </button>
          </div>
        </div>
      )}

      {history.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-400">
          <History size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sense historial. Afegeix la primera fita!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {history.map((h, i) => {
            const isLast  = i === history.length - 1
            const isPhase = !h.isCustom
            const ph      = isPhase && h.phase_id ? PHASES[h.phase_id - 1] : null
            const phc     = isPhase && h.phase_id ? PHASE_COLORS[h.phase_id] : null
            const evCfg   = !isPhase ? EVENT_ICONS[h.customType] || EVENT_ICONS.note : null

            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0',
                    isPhase ? (phc?.bg || 'bg-gray-100') : (evCfg?.color || 'bg-gray-100')
                  )}>
                    {isPhase ? (ph?.icon || '📍') : (evCfg?.icon || '📍')}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                </div>
                <div className={clsx('pb-5 flex-1', !isLast && 'border-b border-gray-50')}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={clsx('text-sm font-semibold',
                      isPhase ? (phc?.text || 'text-gray-700') : 'text-gray-700'
                    )}>
                      {isPhase ? (ph?.name || 'Fase') : h.notes?.split(' — ')[0] || 'Event'}
                    </p>
                    {isPhase && !h.exited_at && (
                      <span className="badge bg-green-100 text-green-700 text-xs animate-pulse-dot">● En curs</span>
                    )}
                    {!isPhase && evCfg && (
                      <span className={clsx('badge text-xs', evCfg.color)}>{evCfg.label}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {isPhase
                      ? `${h.entered_at} → ${h.exited_at || 'actualitat'}`
                      : h.entered_at}
                  </p>
                  {isPhase && h.notes && <p className="text-xs text-gray-500 mt-1">{h.notes}</p>}
                  {!isPhase && h.notes?.split(' — ')[1] && (
                    <p className="text-xs text-gray-500 mt-1">{h.notes.split(' — ')[1]}</p>
                  )}
                  {!isPhase && h.customId && (
                    <button type="button" onClick={() => onDeleteEvent(project.id, h.customId)}
                      className="mt-1 text-xs text-gray-300 hover:text-red-500 flex items-center gap-1 transition-colors">
                      <Trash2 size={11} /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getProjectById, advancePhase, deleteProject, updateProject, isAdmin,
    getTasksForProject, getFeedbackForProject,
    getPilotForProject, getEvalForProject,
    getHistoryForProject, getIdeasForProject,
    addTask, updateTask, deleteTask,
    addTimelineEvent, deleteTimelineEvent,
  } = useApp()

  const project = getProjectById(id)
  const [tab, setTab]               = useState('overview')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    deleteProject(project.id)
    navigate('/projects')
  }

  if (!project) return (
    <Layout title="Projecte no trobat">
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">Projecte #{id} no trobat</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary mt-4">
          <ArrowLeft size={15} /> Tornar
        </button>
      </div>
    </Layout>
  )

  const phase    = PHASES[project.current_phase - 1]
  const pc       = PHASE_COLORS[project.current_phase]
  const tasks    = getTasksForProject(project.id)
  const fb       = getFeedbackForProject(project.id)
  const pilot    = getPilotForProject(project.id)
  const evalRes  = getEvalForProject(project.id)
  const history  = getHistoryForProject(project.id)
  const ideas    = getIdeasForProject(project.id)

  return (
    <Layout title={project.title} subtitle={project.service}>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/projects')} className="btn-ghost">
          <ArrowLeft size={15} /> Projectes
        </button>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          {project.current_phase < 8 && project.status === 'active' && (
            <button onClick={() => advancePhase(project.id)} className="btn-primary">
              Avançar a {PHASES[project.current_phase]?.name}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Modal eliminar */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar projecte" size="sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={26} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Eliminar «{project.title}»?</p>
            <p className="text-sm text-gray-500 mt-1">Aquesta acció és irreversible.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1 justify-center">Cancel·lar</button>
            <button onClick={handleDelete}
              className="flex-1 justify-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Project header */}
      <div className="card p-5 mb-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0', pc?.bg)}>
            {phase?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">{project.title}</h2>
              {project.tags?.map(t => (
                <span key={t} className="badge bg-gray-100 text-gray-500 text-xs"><Tag size={10} className="mr-1" />{t}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-3 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={clsx('badge', pc?.bg, pc?.text)}>{phase?.icon} {phase?.name}</span>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
              {project.dictamen && (
                <span className={clsx('badge text-xs',
                  project.dictamen === 'favorable' ? 'bg-green-100 text-green-700' :
                  project.dictamen === 'condicionada' ? 'bg-yellow-100 text-yellow-700' :
                  project.dictamen === 'reformulacio' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                )}>
                  {project.dictamen === 'favorable' ? '✅' : project.dictamen === 'condicionada' ? '⚠️' : project.dictamen === 'reformulacio' ? '🔄' : '❌'} {project.dictamen}
                </span>
              )}
              {project.tags?.includes('IA') && <span className="badge bg-violet-100 text-violet-700">🤖 IA</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={14} className="text-gray-400" />
              <span>{project.owner_name || 'No assignat'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={14} className="text-gray-400" />
              <span>{project.created_at}</span>
            </div>
            {project.budget > 0 && (
              <div className="flex items-center gap-2 text-gray-500">
                <Euro size={14} className="text-gray-400" />
                <span>€{project.budget.toLocaleString()}</span>
              </div>
            )}
            {project.validation_score > 0 && (
              <div className="flex items-center gap-2 text-althaia-600 font-medium">
                <ShieldCheck size={14} />
                <span>{project.validation_score}/10 validació</span>
              </div>
            )}
          </div>
        </div>

        {/* Phase progress */}
        <div className="mt-5">
          <div className="flex items-center gap-1">
            {PHASES.map((ph, i) => {
              const done = ph.id < project.current_phase
              const curr = ph.id === project.current_phase
              const phc  = PHASE_COLORS[ph.id]
              return (
                <div key={ph.id} className="flex items-center flex-1">
                  <div className={clsx(
                    'flex-1 flex flex-col items-center py-1.5 rounded-lg text-center transition-all',
                    curr ? `${phc.bg} ring-2 ring-offset-1 ring-althaia-400` :
                    done ? 'bg-green-50' : 'bg-gray-50'
                  )}>
                    <span className="text-sm">{done ? '✓' : ph.icon}</span>
                    <span className={clsx('text-xs font-medium', curr ? phc.text : done ? 'text-green-600' : 'text-gray-300')}>
                      {ph.name.slice(0, 4)}.
                    </span>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div className={clsx('h-0.5 w-3 shrink-0', done ? 'bg-green-300' : 'bg-gray-100')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-1">
          <TabBar active={tab} onChange={setTab} />
        </div>

        <div className="p-5">
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Matriu d'impacte</h4>
                  <ImpactRadar impact={project.impact || { clinical: 5, economic: 5, organizational: 5, patient_exp: 5 }} />
                </div>
                <div className="space-y-4">
                  {/* Tasques ràpides */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tasques pendents</h4>
                    <div className="space-y-1.5">
                      {tasks.filter(t => t.status !== 'completed').slice(0, 4).map(t => (
                        <div key={t.id} className="flex items-center gap-2">
                          <div className={clsx('w-2 h-2 rounded-full shrink-0', STATUS_STYLE[t.status])} />
                          <p className="text-xs text-gray-600 flex-1 truncate">{t.title}</p>
                          <PriorityBadge priority={t.priority} />
                        </div>
                      ))}
                      {tasks.filter(t => t.status !== 'completed').length === 0 && (
                        <p className="text-xs text-gray-400">Totes les tasques completades ✓</p>
                      )}
                    </div>
                  </div>

                  {/* Wizard data */}
                  {project.wizard_experimental?.objectives && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Objectius</h4>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{project.wizard_experimental.objectives}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ENoLL criteria */}
              <ENoLLSection project={project} onUpdate={(updates) => updateProject(project.id, updates)} />
            </div>
          )}

          {/* ── Tasks ── */}
          {tab === 'tasks' && (
            <TasksTab
              project={project} tasks={tasks}
              onAdd={addTask} onToggle={updateTask} onDelete={deleteTask}
            />
          )}

          {/* ── Validation SLL ── */}
          {tab === 'validation' && (
            <ValidationTab
              project={project}
              onSave={(updates) => updateProject(project.id, updates)}
            />
          )}

          {/* ── Pilot ── */}
          {tab === 'pilot' && (
            pilot ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Professionals', value: pilot.professionals_involved, color: 'text-althaia-600' },
                    { label: 'Pacients',      value: pilot.patients_involved,      color: 'text-teal-600'    },
                    { label: 'Adopció',       value: `${pilot.adoption_rate}%`,    color: pilot.adoption_rate >= 70 ? 'text-green-600' : 'text-orange-600' },
                    { label: 'Satisfacció',   value: `${pilot.satisfaction_score}/10`, color: 'text-purple-600' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className={clsx('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="label">Progrés del pilot</p>
                  <div className="score-bar mt-2">
                    <div className="score-bar-fill bg-althaia-500" style={{ width: `${pilot.progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pilot.progress}% completat · {pilot.start_date} → {pilot.end_date || 'en curs'}</p>
                </div>
                <div>
                  <p className="label">Resultats preliminars</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{pilot.preliminary_results}</p>
                </div>
                {pilot.incidents > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{pilot.incidents} incidències registrades</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <FlaskConical size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sense dades de pilot. El projecte ha d'arribar a la fase 5 (Pilot).</p>
              </div>
            )
          )}

          {/* ── Evaluation ── */}
          {tab === 'evaluation' && (
            evalRes ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="label text-green-700">Resultats Clínics</p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{evalRes.clinical_outcome}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="label text-blue-700">Resultats Econòmics</p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{evalRes.economic_outcome}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Exp. Pacient',   value: evalRes.patient_experience },
                    { label: 'Satisf. Prof.',  value: evalRes.professional_satisfaction },
                    { label: 'Sostenibilitat', value: evalRes.sustainability_score },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-althaia-600">{m.value}/10</p>
                      <p className="text-xs text-gray-500 mt-1">{m.label}</p>
                    </div>
                  ))}
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-purple-700">{evalRes.social_return}</p>
                    <p className="text-xs text-gray-500 mt-1">SROI</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <TrendingUp size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sense avaluació. El projecte ha de completar la fase Pilot.</p>
              </div>
            )
          )}

          {/* ── Ideas ── */}
          {tab === 'ideas' && (
            <div className="space-y-4">
              {/* Wizard ideas */}
              {project.wizard_ideas && project.wizard_ideas.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Idees del wizard</p>
                  {project.wizard_ideas.map((idea, i) => (
                    <div key={i} className={clsx('border rounded-xl p-4',
                      project.wizard_selected?.id === idea.id
                        ? 'border-althaia-400 bg-althaia-50'
                        : 'border-gray-200 bg-white'
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {project.wizard_selected?.id === idea.id && '⭐ '}
                          {idea.title}
                        </h4>
                        {idea.ai_related && <span className="badge bg-violet-100 text-violet-700 text-xs">🤖 IA</span>}
                      </div>
                      {idea.description && <p className="text-xs text-gray-500 mb-3">{idea.description}</p>}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {idea.pros && <div className="bg-green-50 rounded-lg p-2 text-green-700">✅ {idea.pros.slice(0, 80)}</div>}
                        {idea.cons && <div className="bg-red-50 rounded-lg p-2 text-red-600">❌ {idea.cons.slice(0, 80)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* mockData ideas */}
              {ideas.length > 0 && (
                ideas.map(idea => (
                  <div key={idea.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{idea.title}</h4>
                      {idea.ai_related && <span className="badge bg-violet-100 text-violet-700 text-xs">🤖 IA</span>}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{idea.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="font-semibold text-green-700 mb-1">Avantatges</p>
                        <p className="text-gray-600">{idea.pros}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="font-semibold text-red-700 mb-1">Inconvenients</p>
                        <p className="text-gray-600">{idea.cons}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {project.wizard_ideas?.length === 0 && ideas.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sense idees registrades</p>
              )}
            </div>
          )}

          {/* ── Feedback ── */}
          {tab === 'feedback' && (
            <div className="space-y-3">
              {fb.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Sense feedback registrat</p>}
              {fb.map(f => {
                const typeColor = f.type === 'clinical' ? 'bg-blue-50 border-blue-200' : f.type === 'patient' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                const typeBadge = f.type === 'clinical' ? 'bg-blue-100 text-blue-700' : f.type === 'patient' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                return (
                  <div key={f.id} className={clsx('border rounded-xl p-4', typeColor)}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold border">👤</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{f.user_id ? `Usuari #${f.user_id}` : 'Pacient anònim'}</p>
                        <p className="text-xs text-gray-400">{f.created_at}</p>
                      </div>
                      <span className={clsx('badge ml-auto text-xs', typeBadge)}>{f.type}</span>
                    </div>
                    <p className="text-sm text-gray-700">"{f.message}"</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Timeline ── */}
          {tab === 'timeline' && (
            <TimelineTab
              project={project} history={history}
              onAddEvent={addTimelineEvent} onDeleteEvent={deleteTimelineEvent}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
