import { Bell, Search, HelpCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header({ title, subtitle }) {
  const { notifications, projects } = useApp()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()

  const results = search.length > 1
    ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : []

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        {title && (
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold text-gray-900">{title}</h1>
            {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
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

      <button className="relative btn-ghost p-2">
        <Bell size={17} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <button className="btn-ghost p-2">
        <HelpCircle size={17} />
      </button>
    </header>
  )
}
