import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { PHASES, PHASE_COLORS } from '../data/constants'
import { StatusBadge } from '../components/shared/Badge'
import { Users, ArrowRight, Plus } from 'lucide-react'
import clsx from 'clsx'

function ProjectCard({ project }) {
  const navigate = useNavigate()
  const { getUserById } = useApp()
  const owner = getUserById(project.owner_id)

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="project-card-pipeline"
    >
      <p className="text-xs font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">{project.title}</p>
      <p className="text-xs text-gray-400 mb-3">{project.service}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users size={11} />
          <span>{project.team?.length || 1}</span>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {project.priority === 'alta' && (
        <div className="mt-2 w-full h-0.5 rounded-full bg-red-200">
          <div className="h-full w-full bg-red-400 rounded-full" />
        </div>
      )}
    </div>
  )
}

function PhaseColumn({ phase }) {
  const { getProjectsByPhase } = useApp()
  const navigate = useNavigate()
  const phaseProjects = getProjectsByPhase(phase.id)
  const pc = PHASE_COLORS[phase.id]

  return (
    <div className="pipeline-col">
      {/* Phase header */}
      <div className={clsx('rounded-xl p-3 mb-1', pc.bg)}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg">{phase.icon}</span>
          <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', pc.bg, pc.text, 'border', pc.border)}>
            {phaseProjects.length}
          </span>
        </div>
        <p className={clsx('text-xs font-bold', pc.text)}>{phase.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{phase.desc}</p>
      </div>

      {/* Projects */}
      <div className="space-y-2">
        {phaseProjects.map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {phaseProjects.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-300">Sense projectes</p>
          </div>
        )}
        <button
          onClick={() => navigate(`/new?phase=${phase.id}`)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400 hover:text-althaia-600 hover:bg-althaia-50 rounded-lg border border-dashed border-gray-200 hover:border-althaia-300 transition-colors"
        >
          <Plus size={12} /> Nou
        </button>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { projects } = useApp()

  return (
    <Layout title="Pipeline d'Innovació" subtitle={`${projects.length} projectes`}>
      {/* Pipeline overview bar */}
      <div className="card px-5 py-4 mb-6">
        <div className="flex items-center gap-1">
          {PHASES.map((ph, i) => {
            const pc = PHASE_COLORS[ph.id]
            return (
              <div key={ph.id} className="flex items-center flex-1">
                <div className={clsx('flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg', pc.bg)}>
                  <span className="text-base">{ph.icon}</span>
                  <span className={clsx('text-xs font-bold', pc.text)}>{ph.name.slice(0,4)}.</span>
                </div>
                {i < PHASES.length - 1 && <ArrowRight size={14} className="text-gray-300 shrink-0 mx-0.5" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-3 min-w-max">
          {PHASES.map(phase => (
            <PhaseColumn key={phase.id} phase={phase} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
