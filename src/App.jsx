import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { getSession, clearSession } from './data/auth'
import LoginPage         from './pages/LoginPage'
import DashboardPage     from './pages/DashboardPage'
import PipelinePage      from './pages/PipelinePage'
import ProjectsPage      from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NewProjectPage        from './pages/NewProjectPage'
import InnovationWizardPage  from './pages/InnovationWizardPage'
import ImportProjectPage     from './pages/ImportProjectPage'
import AIPage                from './pages/AIPage'
import UsersPage             from './pages/UsersPage'
import SettingsPage          from './pages/SettingsPage'

function ProtectedRoutes({ currentUser, onLogout }) {
  return (
    <AppProvider currentUser={currentUser} onLogout={onLogout}>
      <Routes>
        <Route path="/"             element={<DashboardPage />}    />
        <Route path="/pipeline"     element={<PipelinePage />}     />
        <Route path="/projects"     element={<ProjectsPage />}     />
        <Route path="/projects/:id" element={<ProjectDetailPage />}/>
        <Route path="/new"          element={<NewProjectPage />}        />
        <Route path="/wizard"       element={<InnovationWizardPage />}  />
        <Route path="/import"       element={<ImportProjectPage />}     />
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
