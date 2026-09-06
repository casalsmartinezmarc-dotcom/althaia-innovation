import Layout from '../components/Layout/Layout'
import KPICard from '../components/Dashboard/KPICard'
import AlertsPanel from '../components/Dashboard/AlertsPanel'
import RecentProjects from '../components/Dashboard/RecentProjects'
import {
  ProjectsByPhaseChart, ServiceChart, MonthlyProjectsChart,
} from '../components/Dashboard/PipelineChart'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, FlaskConical, AlertTriangle, TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const { globalKPIs, projects } = useApp()
  const navigate = useNavigate()

  return (
    <Layout title="Centre de Comandament" subtitle="Innovació Althaia">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Projectes actius"
          value={globalKPIs.active_projects}
          sub={`de ${projects.length} totals`}
          icon={FolderOpen} color="blue"
          onClick={() => navigate('/projects')}
        />
        <KPICard
          label="Èxit pilots"
          value={globalKPIs.pilot_count > 0 ? `${globalKPIs.pilot_success_rate}%` : '—'}
          sub={globalKPIs.pilot_count > 0 ? `basat en ${globalKPIs.pilot_count} pilots` : 'sense pilots encara'}
          icon={FlaskConical} color="teal"
        />
        <KPICard
          label="Projectes pausats"
          value={globalKPIs.paused_projects}
          sub="requereixen atenció"
          icon={AlertTriangle} color="red"
        />
        <KPICard
          label="Projectes amb IA"
          value={globalKPIs.ai_projects}
          sub="incorporen intel·ligència artificial"
          icon={TrendingUp} color="purple"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ProjectsByPhaseChart />
        <ServiceChart />
        <MonthlyProjectsChart />
      </div>

      {/* Bottom: recent + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentProjects />
        </div>
        <AlertsPanel />
      </div>
    </Layout>
  )
}
