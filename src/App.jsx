import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { getSession, clearSession } from './data/auth'
import LoginPage         from './pages/LoginPage'
import DashboardPage     from './pages/DashboardPage'
import PipelinePage      from './pages/PipelinePage'
import ProjectsPage      from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NewProjectPage    from './pages/NewProjectPage'
import AIPage            from './pages/AIPage'
import UsersPage         from './pages/UsersPage'
import Layout            from './components/Layout/Layout'

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

function ProtectedRoutes({ currentUser, onLogout }) {
  return (
    <AppProvider currentUser={currentUser} onLogout={onLogout}>
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
  const [currentUser, setCurrentUser] = useState(() => getSession())

  const handleLogin = (user) => setCurrentUser(user)

  const handleLogout = () => {
    clearSession()
    setCurrentUser(null)
  }

  return (
    <BrowserRouter>
      {currentUser
        ? <ProtectedRoutes currentUser={currentUser} onLogout={handleLogout} />
        : <Routes>
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
          </Routes>
      }
    </BrowserRouter>
  )
}
