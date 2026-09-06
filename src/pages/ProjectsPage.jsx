import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { PHASES, PHASE_COLORS } from '../data/constants'
import { Search, Plus, ChevronRight, Calendar, User } from 'lucide-react'
import clsx from 'clsx'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))
  } catch { return dateStr }
}

export default function ProjectsPage() {
  const { projects } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return projects
    const q = search.toLowerCase()
    return projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.owner_name || '').toLowerCase().includes(q) ||
      (p.service || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    )
  }, [projects, search])

  return (
    <Layout title="Projectes" subtitle={`${filtered.length} de ${projects.length}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            className="text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 bg-transparent"
            placeholder="Cercar per títol, servei o responsable..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => navigate('/new')} className="btn-primary ml-auto">
          <Plus size={15} /> Nou projecte
        </button>
      </div>

      {/* List */}
      <div className="card divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="py-14 text-center text-gray-400 text-sm">
            Cap projecte trobat
          </div>
        )}

        {filtered.map(p => {
          const phase = PHASES[p.current_phase - 1]
          const pc    = PHASE_COLORS[p.current_phase]

          return (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-gray-50/80 transition-colors group"
            >
              {/* Phase icon */}
              <span className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                pc?.bg, pc?.text
              )}>
                {phase?.icon && <phase.icon size={18} />}
              </span>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
                  {p.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} className="shrink-0" />
                    {formatDate(p.created_at)}
                  </span>
                  {p.owner_name && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                      <User size={11} className="shrink-0" />
                      {p.owner_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={15}
                className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
              />
            </button>
          )
        })}
      </div>
    </Layout>
  )
}
