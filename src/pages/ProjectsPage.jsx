import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { PHASES, PHASE_COLORS, STATUS_CONFIG } from '../data/constants'
import { PhaseBadge, StatusBadge, PriorityBadge } from '../components/shared/Badge'
import { Search, Filter, Plus, Users, Euro, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const SORT_OPTIONS = [
  { value: 'updated_at', label: 'Darrera actualització' },
  { value: 'title',      label: 'Títol'                 },
  { value: 'current_phase', label: 'Fase'               },
  { value: 'status',     label: 'Estat'                 },
]

export default function ProjectsPage() {
  const { projects, getUserById } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterPhase, setFilterPhase] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')

  const filtered = useMemo(() => {
    let list = [...projects]
    if (search) list = list.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.service.toLowerCase().includes(search.toLowerCase())
    )
    if (filterPhase) list = list.filter(p => p.current_phase === Number(filterPhase))
    if (filterStatus) list = list.filter(p => p.status === filterStatus)
    list.sort((a, b) => {
      if (sortBy === 'current_phase') return a.current_phase - b.current_phase
      return String(b[sortBy]).localeCompare(String(a[sortBy]))
    })
    return list
  }, [projects, search, filterPhase, filterStatus, sortBy])

  return (
    <Layout title="Projectes" subtitle={`${filtered.length} de ${projects.length}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            className="text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 bg-transparent"
            placeholder="Cercar per títol o servei..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterPhase}
          onChange={e => setFilterPhase(e.target.value)}
          className="input py-2 w-auto text-sm"
        >
          <option value="">Totes les fases</option>
          {PHASES.map(ph => (
            <option key={ph.id} value={ph.id}>{ph.icon} {ph.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input py-2 w-auto text-sm"
        >
          <option value="">Tots els estats</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="input py-2 w-auto text-sm"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => navigate('/new')} className="btn-primary">
          <Plus size={15} /> Nou projecte
        </button>
      </div>

      {/* Project list */}
      <div className="card divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            Cap projecte trobat
          </div>
        )}
        {filtered.map(p => {
          const phase = PHASES[p.current_phase - 1]
          const pc = PHASE_COLORS[p.current_phase]
          const owner = getUserById(p.owner_id)
          const roiK = p.estimated_roi ? `€${Math.round(p.estimated_roi / 1000)}k` : '-'

          return (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="w-full text-left px-5 py-4 hover:bg-gray-50/80 transition-colors flex items-center gap-4 group"
            >
              {/* Phase indicator */}
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl', pc?.bg)}>
                {phase?.icon}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                  {p.tags?.includes('IA') && (
                    <span className="badge bg-violet-100 text-violet-700 text-xs">IA</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{p.service} · {owner?.name}</p>
              </div>

              {/* Meta */}
              <div className="hidden md:flex items-center gap-4 shrink-0 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{p.team?.length || 1}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <Euro size={12} />
                  <span>{roiK}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={clsx('badge text-xs hidden sm:inline-flex', pc?.bg, pc?.text)}>
                  {phase?.name}
                </span>
                <PriorityBadge priority={p.priority} />
                <StatusBadge status={p.status} />
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </button>
          )
        })}
      </div>
    </Layout>
  )
}
