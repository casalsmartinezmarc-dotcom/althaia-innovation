import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { PHASES } from '../../data/constants'

const COLORS = ['#7c3aed','#db2777','#2563eb','#0d9488','#ea580c','#7c3aed','#d97706','#0284c7']

export function ProjectsByPhaseChart() {
  const { globalKPIs } = useApp()
  const data = PHASES.map((ph, i) => ({
    name: ph.name.slice(0, 5) + '.',
    fullName: ph.name,
    projectes: globalKPIs.projects_per_phase[i],
    fill: COLORS[i],
  }))

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Projectes per fase</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
          <Tooltip
            formatter={(v, _, p) => [v, p.payload.fullName]}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Bar dataKey="projectes" radius={[5, 5, 0, 0]}>
            {data.map((entry, i) => (
              <rect key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PhaseTimeChart() {
  const { globalKPIs } = useApp()
  const data = globalKPIs.phase_time_avg.map(d => ({
    ...d,
    phase: d.phase.slice(0, 5) + '.',
    fullName: d.phase,
  }))

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Temps mitjà per fase (dies)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDies" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3366ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3366ff" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="phase" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            formatter={(v, _, p) => [`${v} dies`, p.payload.fullName]}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Area type="monotone" dataKey="days" stroke="#3366ff" strokeWidth={2} fill="url(#colorDies)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ROIByServiceChart() {
  const { globalKPIs } = useApp()
  const data = globalKPIs.roi_by_service.map(d => ({
    ...d,
    roi_k: Math.round(d.roi / 1000),
  }))

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">ROI estimat per servei (k€)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={16}>
          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="service" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
          <Tooltip
            formatter={(v) => [`${v}k€`, 'ROI Estimat']}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Bar dataKey="roi_k" fill="#3366ff" radius={[0, 5, 5, 0]} />
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
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Nous projectes per mes</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="nous" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
