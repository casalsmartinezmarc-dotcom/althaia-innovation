import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { PHASES } from '../../data/constants'

const PHASE_COLORS = ['#7c3aed','#db2777','#2563eb','#0d9488','#ea580c','#7c3aed','#d97706','#0284c7']

export function ProjectsByPhaseChart() {
  const { globalKPIs } = useApp()
  const data = PHASES.map((ph, i) => ({
    name: ph.name.slice(0, 5) + '.',
    fullName: ph.name,
    projectes: globalKPIs.projects_per_phase[i],
    color: PHASE_COLORS[i],
  }))

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Projectes per fase</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
          <Tooltip
            cursor={false}
            formatter={(v, _, p) => [v, p.payload.fullName]}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Bar dataKey="projectes" radius={[5, 5, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ServiceChart() {
  const { globalKPIs } = useApp()
  const data = globalKPIs.projects_by_service

  if (!data?.length) return (
    <div className="card p-5 flex items-center justify-center h-[272px]">
      <p className="text-sm text-gray-400">Sense dades de servei</p>
    </div>
  )

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Projectes per servei</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={16}>
          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="service" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            cursor={false}
            formatter={(v) => [v, 'Projectes']}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#3366ff" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyProjectsChart() {
  const { globalKPIs } = useApp()
  const months = ['Gen','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Oct','Nov','Des']
  const data = months.map((m, i) => ({ mes: m, nous: globalKPIs.monthly_new_projects[i] }))

  return (
    <div className="card p-5 lg:col-span-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Nous projectes per mes ({new Date().getFullYear()})
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
          <Tooltip
            cursor={false}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="nous" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
