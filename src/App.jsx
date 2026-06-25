import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import PipelinePage     from './pages/PipelinePage'
import ProjectsPage     from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NewProjectPage   from './pages/NewProjectPage'
import AIPage           from './pages/AIPage'
import UsersPage        from './pages/UsersPage'
import Layout           from './components/Layout/Layout'

function SettingsPage() {
  return (
    <Layout title="Configuració">
      <div className="max-w-lg mx-auto card p-8 text-center text-gray-400">
        <p className="text-4xl mb-4">⚙️</p>
        <p className="text-sm">Mòdul de configuració en construcció</p>
      </div>
    </Layout>
  )
}

function ProtectedRoutes({ onLogout }) {
  return (
    <AppProvider onLogout={onLogout}>
      <Routes>
        <Route path="/"             element={<DashboardPage />}    />
        <Route path="/pipeline"     element={<PipelinePage />}     />
        <Route path="/projects"     element={<ProjectsPage />}     />
        <Route path="/projects/:id" element={<ProjectDetailPage />}/>
        <Route path="/new"          element={<NewProjectPage />}   />
        <Route path="/ai"           element={<AIPage />}           />
        <Route path="/users"        element={<UsersPage />}        />
        <Route path="/settings"     element={<SettingsPage />}     />
        <Route path="*"             element={<Navigate to="/" />}  />
      </Routes>
    </AppProvider>
  )
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('althaia_auth') === '1'
  )

  const handleLogin = () => {
    sessionStorage.setItem('althaia_auth', '1')
    setLoggedIn(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('althaia_auth')
    setLoggedIn(false)
  }

  return (
    <BrowserRouter>
      {loggedIn
        ? <ProtectedRoutes onLogout={handleLogout} />
        : <Routes>
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
          </Routes>
      }
    </BrowserRouter>
  )
}
