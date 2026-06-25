import { PHASE_COLORS, STATUS_CONFIG } from '../../data/constants'
import clsx from 'clsx'

export function PhaseBadge({ phase, size = 'sm' }) {
  const c = PHASE_COLORS[phase]
  if (!c) return null
  return (
    <span className={clsx('badge', c.bg, c.text, size === 'xs' && 'text-xs px-2 py-0')}>
      Fase {phase}
    </span>
  )
}

export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status]
  if (!c) return null
  return <span className={clsx('badge', c.bg, c.text)}>{c.label}</span>
}

export function PriorityBadge({ priority }) {
  const map = {
    alta:  { bg: 'bg-red-100',    text: 'text-red-700'    },
    mitja: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    baixa: { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  }
  const c = map[priority]
  if (!c) return null
  return <span className={clsx('badge', c.bg, c.text)}>{priority}</span>
}

export function TaskStatusBadge({ status }) {
  const map = {
    completed:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completada' },
    in_progress: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'En curs'    },
    pending:     { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Pendent'    },
    blocked:     { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Bloquejada' },
  }
  const c = map[status]
  if (!c) return null
  return <span className={clsx('badge', c.bg, c.text)}>{c.label}</span>
}
