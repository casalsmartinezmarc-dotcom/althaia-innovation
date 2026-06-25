import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { PHASES, PHASE_COLORS } from '../../data/constants'
import { StatusBadge } from '../shared/Badge'
import { ArrowRight } from 'lucide-react'
import clsx from 'clsx'

export default function RecentProjects() {
  const { projects } = useApp()
  const navigate = useNavigate()
  const recent = [...projects].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6)

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Projectes recents</h3>
        <button onClick={() => navigate('/projects')} className="text-xs text-althaia-600 font-medium hover:underline flex items-center gap-1">
          Veure tots <ArrowRight size={12} />
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {recent.map(p => {
          const phase = PHASES[p.current_phase - 1]
          const pc = PHASE_COLORS[p.current_phase]
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <div className={clsx('w-2 h-2 rounded-full shrink-0', pc?.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.service} · {p.updated_at}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={clsx('badge text-xs', pc?.bg, pc?.text)}>
                  {phase?.icon} {phase?.name}
                </span>
                <StatusBadge status={p.status} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
