import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import DashboardPage    from './pages/DashboardPage'
import PipelinePage     from './pages/PipelinePage'
import ProjectsPage     from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NewProjectPage   from './pages/NewProjectPage'
import AIPage           from './pages/AIPage'
import UsersPage        from './pages/UsersPage'

function SettingsPage() {
  const Layout = require('./components/Layout/Layout').default
  return (
    <Layout title="Configuració">
      <div className="max-w-lg mx-auto card p-8 text-center text-gray-400">
        <p className="text-4xl mb-4">⚙️</p>
        <p className="text-sm">Mòdul de configuració en construcció</p>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/"              element={<DashboardPage />}    />
          <Route path="/pipeline"      element={<PipelinePage />}     />
          <Route path="/projects"      element={<ProjectsPage />}     />
          <Route path="/projects/:id"  element={<ProjectDetailPage />}/>
          <Route path="/new"           element={<NewProjectPage />}   />
          <Route path="/ai"            element={<AIPage />}           />
          <Route path="/users"         element={<UsersPage />}        />
          <Route path="/settings"      element={<SettingsPage />}     />
          <Route path="*"              element={<Navigate to="/" />}  />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
