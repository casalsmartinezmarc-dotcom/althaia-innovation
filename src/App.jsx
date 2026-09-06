import { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { getSession, clearSession } from './data/auth'
import LoginPage from './pages/LoginPage'

// Cada pàgina es carrega en el seu propi chunk — les llibreries pesades
// (pdfjs, tesseract, jszip a /import; recharts a Dashboard/Detall) només
// es descarreguen quan es visita la pàgina que les necessita.
const DashboardPage     = lazy(() => import('./pages/DashboardPage'))
const PipelinePage      = lazy(() => import('./pages/PipelinePage'))
const ProjectsPage      = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const NewProjectPage    = lazy(() => import('./pages/NewProjectPage'))
const ImportProjectPage = lazy(() => import('./pages/ImportProjectPage'))
const IdeasBankPage     = lazy(() => import('./pages/IdeasBankPage'))
const UsersPage         = lazy(() => import('./pages/UsersPage'))
const SettingsPage      = lazy(() => import('./pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-althaia-200 border-t-althaia-600 animate-spin" />
    </div>
  )
}

function ProtectedRoutes({ currentUser, onLogout }) {
  return (
    <AppProvider currentUser={currentUser} onLogout={onLogout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"             element={<DashboardPage />}    />
          <Route path="/pipeline"     element={<PipelinePage />}     />
          <Route path="/projects"     element={<ProjectsPage />}     />
          <Route path="/projects/:id" element={<ProjectDetailPage />}/>
          <Route path="/ideas"        element={<IdeasBankPage />}         />
          <Route path="/new"          element={<NewProjectPage />}        />
          <Route path="/import"       element={<ImportProjectPage />}     />
          <Route path="/users"        element={<UsersPage />}        />
          <Route path="/settings"     element={<SettingsPage />}     />
          <Route path="*"             element={<Navigate to="/" />}  />
        </Routes>
      </Suspense>
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
