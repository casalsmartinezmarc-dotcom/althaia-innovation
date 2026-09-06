import { Bell, Search, Menu, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

function matches(project, q) {
  return (
    project.title.toLowerCase().includes(q) ||
    (project.service || '').toLowerCase().includes(q) ||
    (project.description || '').toLowerCase().includes(q) ||
    (project.tags || []).some(t => t.toLowerCase().includes(q))
  )
}

export default function Header({ title, subtitle, onMenuToggle }) {
  const { notifications, dismissAlert, projects } = useApp()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const navigate = useNavigate()

  const results = search.length > 1
    ? projects.filter(p => matches(p, search.toLowerCase())).slice(0, 5)
    : []

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
      {/* Hamburger – only on mobile */}
      <button onClick={onMenuToggle} className="sm:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        {title && (
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && <span className="hidden sm:inline text-sm text-gray-400 truncate">{subtitle}</span>}
          </div>
        )}
      </div>

      {/* Search – desktop only */}
      <div className="relative hidden sm:block">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-56">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
            placeholder="Cercar projectes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            onFocus={() => setShowSearch(true)}
          />
        </div>
        {showSearch && results.length > 0 && (
          <div className="absolute top-full mt-1 right-0 w-72 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
            {results.map(p => (
              <button key={p.id}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                onMouseDown={() => { navigate(`/projects/${p.id}`); setSearch('') }}
              >
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400">{p.service}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notificacions */}
      <div className="relative">
        <button
          onClick={() => setShowAlerts(v => !v)}
          onBlur={() => setTimeout(() => setShowAlerts(false), 150)}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell size={17} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {showAlerts && (
          <div className="absolute top-full mt-1 right-0 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Notificacions</p>
              {notifications.length > 0 && (
                <span className="badge bg-red-100 text-red-700 text-xs">{notifications.length}</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sense notificacions</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(alert => (
                  <div key={alert.id} className="flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50/60">
                    {alert.type === 'warning'
                      ? <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      : <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />}
                    <button
                      onMouseDown={() => { navigate(`/projects/${alert.project_id}`); setShowAlerts(false) }}
                      className="flex-1 text-left text-xs text-gray-700 leading-relaxed hover:underline"
                    >
                      {alert.message}
                    </button>
                    <button
                      onMouseDown={() => dismissAlert(alert.id)}
                      className="p-0.5 text-gray-300 hover:text-gray-600 shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
