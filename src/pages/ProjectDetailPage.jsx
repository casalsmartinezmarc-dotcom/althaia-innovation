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
} from 'lucide-react'
import clsx from 'clsx'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'

const TABS = [
  { id: 'overview',    icon: BarChart2,    label: 'Visió general'   },
  { id: 'tasks',       icon: CheckSquare,  label: 'Tasques'         },
  { id: 'pilot',       icon: FlaskConical, label: 'Pilot'           },
  { id: 'evaluation',  icon: TrendingUp,   label: 'Avaluació'       },
  { id: 'ideas',       icon: AlertCircle,  label: 'Idees'           },
  { id: 'feedback',    icon: MessageSquare,label: 'Feedback'        },
  { id: 'timeline',    icon: History,      label: 'Timeline'        },
]

function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
      {TABS.map(t => (
        <button key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx('tab flex items-center gap-1.5 shrink-0', active === t.id ? 'tab-active' : 'tab-inactive')}
        >
          <t.icon size={14} />
          {t.label}
        </button>
      ))}
    </div>
  )
}

function ImpactRadar({ impact }) {
  const data = [
    { subject: 'Clínic',        A: impact.clinical },
    { subject: 'Econòmic',      A: impact.economic },
    { subject: 'Organitzatiu',  A: impact.organizational },
    { subject: 'Pac. Exp.',     A: impact.patient_exp },
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

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getProjectById, advancePhase, deleteProject, isAdmin,
    getTasksForProject, getFeedbackForProject,
    getPilotForProject, getEvalForProject,
    getHistoryForProject, getIdeasForProject,
  } = useApp()

  const handleDelete = () => {
    deleteProject(project.id)
    navigate('/projects')
  }
  const project = getProjectById(id)
  const [tab, setTab] = useState('overview')
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const phase     = PHASES[project.current_phase - 1]
  const pc        = PHASE_COLORS[project.current_phase]
  const tasks     = getTasksForProject(project.id)
  const fb        = getFeedbackForProject(project.id)
  const pilot     = getPilotForProject(project.id)
  const evalRes   = getEvalForProject(project.id)
  const history   = getHistoryForProject(project.id)
  const ideas     = getIdeasForProject(project.id)
  const teamUsers = []

  return (
    <Layout title={project.title} subtitle={project.service}>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/projects')} className="btn-ghost">
          <ArrowLeft size={15} /> Projectes
        </button>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
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

      {/* Modal eliminar projecte */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar projecte" size="sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={26} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Eliminar «{project.title}»?</p>
            <p className="text-sm text-gray-500 mt-1">Aquesta acció és irreversible. Totes les dades del projecte es perdran.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1 justify-center">Cancel·lar</button>
            <button onClick={handleDelete} className="flex-1 justify-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Project header card */}
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
              {project.tags?.includes('IA') && (
                <span className="badge bg-violet-100 text-violet-700">🤖 IA</span>
              )}
            </div>
          </div>
          {/* Meta */}
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
            {project.estimated_roi > 0 && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <TrendingUp size={14} />
                <span>€{Math.round(project.estimated_roi / 1000)}k ROI</span>
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
                      {ph.name.slice(0,4)}.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Matriu d'impacte</h4>
                <ImpactRadar impact={project.impact || { clinical: 5, economic: 5, organizational: 5, patient_exp: 5 }} />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Equip</h4>
                  <div className="space-y-2">
                    {teamUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-althaia-100 flex items-center justify-center text-xs font-bold text-althaia-700">
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.service} · {u.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tasques pendents</h4>
                  <div className="space-y-1.5">
                    {tasks.filter(t => t.status !== 'completed').slice(0,3).map(t => (
                      <div key={t.id} className="flex items-center gap-2">
                        <Clock size={13} className="text-gray-300 shrink-0" />
                        <p className="text-xs text-gray-600 flex-1 truncate">{t.title}</p>
                        <TaskStatusBadge status={t.status} />
                      </div>
                    ))}
                    {tasks.filter(t => t.status !== 'completed').length === 0 && (
                      <p className="text-xs text-gray-400">Totes les tasques completades</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tasks ── */}
          {tab === 'tasks' && (
            <div className="space-y-3">
              {tasks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sense tasques assignades</p>
              )}
              {tasks.map(t => {
                return (
                  <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={clsx(
                      'w-2 h-2 rounded-full shrink-0',
                      t.status === 'completed' ? 'bg-green-400' :
                      t.status === 'in_progress' ? 'bg-blue-400' : 'bg-gray-300'
                    )} />
                    <p className={clsx('flex-1 text-sm', t.status === 'completed' && 'line-through text-gray-400')}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      {t.assigned_to && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="w-5 h-5 rounded-full bg-althaia-100 flex items-center justify-center text-althaia-700 text-xs font-bold">
                            {String(t.assigned_to).slice(0,2).toUpperCase()}
                          </div>
                          <span className="hidden sm:inline">{String(t.assigned_to)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} /> {t.deadline}
                      </div>
                      <TaskStatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                )
              })}
            </div>
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
                  <p className="label">Ubicació</p>
                  <p className="text-sm text-gray-700">{pilot.location}</p>
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
                    <div>
                      <p className="text-sm font-semibold text-amber-800">{pilot.incidents} incidències registrades</p>
                      <p className="text-xs text-amber-600 mt-1">Revisar informe d'incidències per al detall</p>
                    </div>
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
                    <p className="text-xs text-gray-500 mt-1">Retorn Social (SROI)</p>
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
              {ideas.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sense idees registrades per a aquest projecte</p>
              )}
              {ideas.map(idea => {
                const totalScore = EVALUATION_CRITERIA.reduce((acc, c) => {
                  return acc + (idea.evaluation?.[c.key] || 0) * c.weight
                }, 0)
                return (
                  <div key={idea.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{idea.title}</h4>
                      {idea.ai_related && <span className="badge bg-violet-100 text-violet-700 text-xs">🤖 IA</span>}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{idea.description}</p>
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
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>💰 €{idea.estimated_cost?.toLocaleString()}</span>
                      <span>🛠 {idea.required_tech}</span>
                      {idea.evaluation && (
                        <span className="ml-auto font-semibold text-althaia-600">
                          Puntuació: {totalScore.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Feedback ── */}
          {tab === 'feedback' && (
            <div className="space-y-3">
              {fb.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sense feedback registrat</p>
              )}
              {fb.map(f => {
                const typeColor = f.type === 'clinical' ? 'bg-blue-50 border-blue-200' :
                                  f.type === 'patient'  ? 'bg-green-50 border-green-200' :
                                                          'bg-gray-50 border-gray-200'
                const typeBadge = f.type === 'clinical' ? 'bg-blue-100 text-blue-700' :
                                  f.type === 'patient'  ? 'bg-green-100 text-green-700' :
                                                          'bg-gray-100 text-gray-600'
                return (
                  <div key={f.id} className={clsx('border rounded-xl p-4', typeColor)}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-600 border">
                        {f.user_id ? '👤' : '?'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{f.user_id ? `Usuari #${f.user_id}` : 'Pacient anònim'}</p>
                        <p className="text-xs text-gray-400">{f.created_at}</p>
                      </div>
                      <span className={clsx('badge ml-auto text-xs', typeBadge)}>{f.type}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">"{f.message}"</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Timeline ── */}
          {tab === 'timeline' && (
            <div className="space-y-0">
              {history.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sense historial de fases</p>
              )}
              {history.map((h, i) => {
                const ph  = PHASES[h.phase_id - 1]
                const phc = PHASE_COLORS[h.phase_id]
                const isLast = i === history.length - 1
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0', phc?.bg)}>
                        {ph?.icon}
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                    </div>
                    <div className={clsx('pb-5 flex-1', !isLast && 'border-b border-gray-50')}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={clsx('text-sm font-semibold', phc?.text)}>{ph?.name}</p>
                        {!h.exited_at && (
                          <span className="badge bg-green-100 text-green-700 text-xs animate-pulse-dot">● En curs</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {h.entered_at} → {h.exited_at || 'actualitat'}
                      </p>
                      {h.notes && <p className="text-xs text-gray-500 mt-1">{h.notes}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
