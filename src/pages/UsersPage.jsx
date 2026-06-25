import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/constants'
import { Mail, Briefcase } from 'lucide-react'
import clsx from 'clsx'

const roleColors = {
  admin:     'bg-red-100 text-red-700',
  innovacio: 'bg-violet-100 text-violet-700',
  clinic:    'bg-blue-100 text-blue-700',
  gestor:    'bg-amber-100 text-amber-700',
}

export default function UsersPage() {
  const { users, projects } = useApp()

  return (
    <Layout title="Usuaris" subtitle={`${users.length} membres de l'equip`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => {
          const userProjects = projects.filter(p => p.team?.includes(u.id) || p.owner_id === u.id)
          const role = ROLES.find(r => r.value === u.role)
          return (
            <div key={u.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-althaia-100 flex items-center justify-center text-althaia-700 font-bold text-lg">
                  {u.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                  <span className={clsx('badge text-xs mt-1', roleColors[u.role])}>
                    {role?.label || u.role}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-gray-300 shrink-0" />
                  <span>{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={12} className="text-gray-300 shrink-0" />
                  <span>{u.service}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Projectes:</span>
                <span className="text-xs font-semibold text-althaia-600">{userProjects.length}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
