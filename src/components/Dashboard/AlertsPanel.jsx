import { AlertTriangle, Info, X, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function AlertsPanel() {
  const { notifications, dismissAlert } = useApp()
  const navigate = useNavigate()

  if (notifications.length === 0) return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Alertes</h3>
      <p className="text-sm text-gray-400 text-center py-4">Sense alertes actives</p>
    </div>
  )

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Alertes actives</h3>
        <span className="badge bg-red-100 text-red-700">{notifications.length}</span>
      </div>
      <div className="space-y-2">
        {notifications.map(alert => (
          <div key={alert.id}
            className={clsx(
              'flex items-start gap-3 p-3 rounded-lg border',
              alert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
            )}
          >
            {alert.type === 'warning'
              ? <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              : <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
            }
            <p className="text-xs text-gray-700 flex-1 leading-relaxed">{alert.message}</p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => navigate(`/projects/${alert.project_id}`)}
                className="p-1 hover:bg-white/60 rounded transition-colors"
              >
                <ExternalLink size={12} className="text-gray-400" />
              </button>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 hover:bg-white/60 rounded transition-colors"
              >
                <X size={12} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
