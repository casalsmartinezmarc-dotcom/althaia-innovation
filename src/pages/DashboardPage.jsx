import Layout from '../components/Layout/Layout'
import KPICard from '../components/Dashboard/KPICard'
import AlertsPanel from '../components/Dashboard/AlertsPanel'
import RecentProjects from '../components/Dashboard/RecentProjects'
import {
  ProjectsByPhaseChart, PhaseTimeChart,
  ROIByServiceChart, MonthlyProjectsChart,
} from '../components/Dashboard/PipelineChart'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, CheckCircle, Clock, TrendingUp,
  FlaskConical, Euro, AlertTriangle, Layers,
} from 'lucide-react'

export default function DashboardPage() {
  const { globalKPIs, projects } = useApp()
  const navigate = useNavigate()
  const roiM = (globalKPIs.total_estimated_roi / 1_000_000).toFixed(1)

  return (
    <Layout title="Centre de Comandament" subtitle="Innovació Althaia">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Projectes actius"
          value={projects.filter(p => p.status === 'active').length}
          sub={`de ${projects.length} totals`}
          icon={FolderOpen} color="blue"
          trend="up" trendVal="+2 vs trim."
          onClick={() => navigate('/projects')}
        />
        <KPICard
          label="Implementats any"
          value={globalKPIs.implemented_this_year}
          sub="en producció"
          icon={CheckCircle} color="green"
          trend="up" trendVal="+1 vs 2023"
        />
        <KPICard
          label="Temps mitjà / fase"
          value={globalKPIs.avg_time_per_phase_days}
          unit="dies"
          icon={Clock} color="purple"
          trend="down" trendVal="-8d vs trim."
        />
        <KPICard
          label="Èxit pilots"
          value={`${globalKPIs.pilot_success_rate}%`}
          sub="baserat en 11 pilots"
          icon={FlaskConical} color="teal"
          trend="up" trendVal="+5%"
        />
        <KPICard
          label="ROI estimat total"
          value={`€${roiM}M`}
          sub="projectes actius + completats"
          icon={Euro} color="green"
          trend="up" trendVal="+12%"
        />
        <KPICard
          label="Projectes bloquejats"
          value={globalKPIs.blocked_projects}
          sub="requereixen atenció"
          icon={AlertTriangle} color="red"
        />
        <KPICard
          label="Fases actives"
          value="8 / 8"
          sub="pipeline complet actiu"
          icon={Layers} color="blue"
        />
        <KPICard
          label="Projectes amb IA"
          value={projects.filter(p => p.tags?.includes('IA')).length}
          sub="incorporen intel·ligència artificial"
          icon={TrendingUp} color="purple"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ProjectsByPhaseChart />
        <PhaseTimeChart />
        <ROIByServiceChart />
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
