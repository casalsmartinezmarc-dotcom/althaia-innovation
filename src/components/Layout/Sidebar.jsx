import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, FolderOpen, Plus,
  Bot, Users, Settings, Activity, LogOut, ShieldCheck, User, FlaskConical, Upload,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import clsx from 'clsx'

const nav = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/pipeline', icon: GitBranch,       label: 'Pipeline'              },
  { to: '/projects', icon: FolderOpen,      label: 'Projectes'             },
  { to: '/ai',       icon: Bot,             label: 'Assistent IA'          },
]

export default function Sidebar() {
  const { currentUser, isAdmin, projects, notifications, onLogout } = useApp()
  const active = projects.filter(p => p.status === 'active').length

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</p>
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}

        {/* Crear innovació (wizard guiat) */}
        <div className="pt-4">
          <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Crear</p>
          <NavLink to="/wizard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <FlaskConical size={17} />
            <span className="flex-1">Nova Innovació</span>
            <span className="text-xs bg-althaia-100 text-althaia-700 font-bold px-1.5 py-0.5 rounded-full leading-none">6P</span>
          </NavLink>
          <NavLink to="/import"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Upload size={17} />
            <span className="flex-1">Importar document</span>
          </NavLink>
          <NavLink to="/new"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Plus size={17} />
            <span className="flex-1">Afegir projecte</span>
          </NavLink>
        </div>

        {/* Secció admin */}
        {isAdmin && (
          <div className="pt-4">
            <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administració</p>
            <NavLink to="/users"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Users size={17} />
              <span className="flex-1">Gestió d'usuaris</span>
              <ShieldCheck size={13} className="text-althaia-400" />
            </NavLink>
            <NavLink to="/settings"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Settings size={17} />
              <span>Configuració</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Usuari actual + logout */}
      <div className="border-t border-gray-100 px-4 py-4 space-y-1">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
            isAdmin ? 'bg-althaia-600' : 'bg-teal-500'
          )}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{currentUser?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {isAdmin
                ? <><ShieldCheck size={10} className="text-althaia-500" /><span className="text-xs text-althaia-500">Administrador</span></>
                : <><User size={10} className="text-teal-500" /><span className="text-xs text-teal-500">Professional</span></>
              }
            </div>
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
