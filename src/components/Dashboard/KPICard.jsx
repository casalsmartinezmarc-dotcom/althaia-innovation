import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPICard({ label, value, unit, sub, trend, trendVal, icon: Icon, color = 'blue', onClick }) {
  const colorMap = {
    blue:   { bg: 'bg-althaia-50',  text: 'text-althaia-600',  icon: 'bg-althaia-100'  },
    green:  { bg: 'bg-green-50',    text: 'text-green-600',    icon: 'bg-green-100'    },
    orange: { bg: 'bg-orange-50',   text: 'text-orange-600',   icon: 'bg-orange-100'   },
    purple: { bg: 'bg-purple-50',   text: 'text-purple-600',   icon: 'bg-purple-100'   },
    red:    { bg: 'bg-red-50',      text: 'text-red-600',      icon: 'bg-red-100'      },
    teal:   { bg: 'bg-teal-50',     text: 'text-teal-600',     icon: 'bg-teal-100'     },
  }
  const c = colorMap[color] || colorMap.blue
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <div
      className={clsx('kpi-card', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', c.icon)}>
          {Icon && <Icon size={20} className={c.text} />}
        </div>
        {trendVal && (
          <div className={clsx('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon size={13} />
            {trendVal}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
