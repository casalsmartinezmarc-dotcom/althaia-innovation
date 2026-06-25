import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GitBranch, FolderOpen, Plus, Bot, Users, Settings, Activity, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const nav = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/pipeline',   icon: GitBranch,       label: 'Pipeline',     badge: null },
  { to: '/projects',   icon: FolderOpen,      label: 'Projectes'    },
  { to: '/new',        icon: Plus,            label: 'Nou Projecte' },
  { to: '/ai',         icon: Bot,             label: 'Assistent IA'  },
]

const secondary = [
  { to: '/users',    icon: Users,    label: 'Usuaris'      },
  { to: '/settings', icon: Settings, label: 'Configuració' },
]

export default function Sidebar() {
  const { currentUser, projects, notifications, onLogout } = useApp()
  const active = projects.filter(p => p.status === 'active').length

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-althaia-600 flex items-center justify-center shadow-sm">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Althaia</p>
            <p className="text-xs text-gray-400">Innovació</p>
          </div>
        </div>
      </div>

      {/* Overview chip */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="bg-althaia-50 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-althaia-700 font-medium">{active} projectes actius</span>
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {notifications.length}
            </span>
          )}
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</p>
        {nav.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge !== null && (
              <span className="bg-althaia-100 text-althaia-700 text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>
            )}
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administració</p>
          {secondary.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 px-4 py-4 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-althaia-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">Administrador</p>
            <p className="text-xs text-gray-400">admin@althaia.cat</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="sidebar-link sidebar-link-inactive w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          <span>Tancar sessió</span>
        </button>
      </div>
    </aside>
  )
}
