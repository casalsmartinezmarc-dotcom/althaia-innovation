import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { ShieldCheck, User, ToggleLeft, ToggleRight, Trash2, ChevronRight, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../components/shared/Modal'

const ROLE_OPTIONS = ['professional', 'admin']

const roleStyle = {
  admin:        { bg: 'bg-althaia-100', text: 'text-althaia-700', icon: ShieldCheck },
  professional: { bg: 'bg-teal-100',    text: 'text-teal-700',    icon: User        },
}

export default function UsersPage() {
  const navigate = useNavigate()
  const { isAdmin, getAllRegisteredUsers, toggleUserActive, changeUserRole, deleteUser, projects } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(null) // {id, name}

  if (!isAdmin) {
    return (
      <Layout title="Accés restringit">
        <div className="max-w-sm mx-auto card p-10 text-center text-gray-400 mt-10">
          <ShieldCheck size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="font-semibold text-gray-600">Necessites permisos d'administrador</p>
          <p className="text-sm mt-2">Contacta l'admin per accedir a aquesta secció.</p>
          <button onClick={() => navigate('/')} className="btn-secondary mt-5 mx-auto">Tornar al Dashboard</button>
        </div>
      </Layout>
    )
  }

  const users = getAllRegisteredUsers()

  const projectCount = (userId) =>
    projects.filter(p => p.owner_name && p.owner_id === userId).length

  const handleDelete = () => {
    if (confirmDelete) {
      deleteUser(confirmDelete.id)
      setConfirmDelete(null)
    }
  }

  return (
    <Layout title="Gestió d'usuaris" subtitle={`${users.length} comptes registrades`}>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total usuaris',    value: users.length,                                        color: 'text-althaia-600' },
          { label: 'Professionals',    value: users.filter(u => u.role === 'professional').length,  color: 'text-teal-600'    },
          { label: 'Administradors',   value: users.filter(u => u.role === 'admin').length,         color: 'text-violet-600'  },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Comptes registrades</h3>
          <span className="badge bg-gray-100 text-gray-500 text-xs">
            L'administrador no pot eliminar-se a si mateix
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {users.map(u => {
            const rs = roleStyle[u.role] || roleStyle.professional
            const Icon = rs.icon
            const isFixedAdmin = u.id === 'admin'

            return (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">

                {/* Avatar */}
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                  rs.bg, rs.text
                )}>
                  {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    {isFixedAdmin && (
                      <span className="badge bg-althaia-100 text-althaia-600 text-xs">Fix</span>
                    )}
                    {!u.active && (
                      <span className="badge bg-red-100 text-red-600 text-xs">Desactivat</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email} · {u.service}</p>
                  <p className="text-xs text-gray-400">{u.created_at}</p>
                </div>

                {/* Rol selector */}
                {!isFixedAdmin ? (
                  <select
                    value={u.role}
                    onChange={e => changeUserRole(u.id, e.target.value)}
                    className={clsx('text-xs font-semibold border rounded-lg px-2 py-1.5 cursor-pointer', rs.bg, rs.text, 'border-transparent')}
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r} value={r}>{r === 'admin' ? '🛡 Admin' : '👤 Professional'}</option>
                    ))}
                  </select>
                ) : (
                  <span className={clsx('badge text-xs', rs.bg, rs.text)}>
                    <Icon size={11} className="mr-1" />Admin
                  </span>
                )}

                {/* Actions */}
                {!isFixedAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle actiu */}
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className={clsx('p-1.5 rounded-lg transition-colors', u.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100')}
                      title={u.active ? 'Desactivar compte' : 'Activar compte'}
                    >
                      {u.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => setConfirmDelete({ id: u.id, name: u.name })}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar compte"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {users.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Cap usuari registrat encara
            </div>
          )}
        </div>
      </div>

      {/* Llegenda */}
      <div className="mt-4 card p-4 flex flex-wrap gap-5 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ToggleRight size={18} className="text-green-500" />
          <span>Activa / desactiva l'accés sense eliminar el compte</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight size={14} className="text-gray-400" />
          <span>Canvia el rol al desplegable directament</span>
        </div>
        <div className="flex items-center gap-2">
          <Trash2 size={14} className="text-red-400" />
          <span>Elimina permanentment el compte</span>
        </div>
      </div>

      {/* Modal confirmació eliminació */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirmar eliminació"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Eliminar compte de <strong>{confirmDelete?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Aquesta acció és irreversible. El compte es eliminarà permanentment.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">
              Cancel·lar
            </button>
            <button onClick={handleDelete} className="flex-1 justify-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
