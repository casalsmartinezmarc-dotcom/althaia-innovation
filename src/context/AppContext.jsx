import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { projects as initialProjects, users, globalKPIs, tasks, feedback, pilots, evaluations, phaseHistory, ideas } from '../data/mockData'

const STORAGE_KEY = 'althaia_projects'
const ALERTS_KEY  = 'althaia_alerts'

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialProjects
  } catch {
    return initialProjects
  }
}

function loadAlerts() {
  try {
    const saved = localStorage.getItem(ALERTS_KEY)
    return saved ? JSON.parse(saved) : globalKPIs.alerts
  } catch {
    return globalKPIs.alerts
  }
}

const AppContext = createContext(null)

export function AppProvider({ children, onLogout }) {
  const [projects, setProjects]     = useState(loadProjects)
  const [currentUser]               = useState(users[1]) // Jordi Puig – Innovació
  const [notifications, setNotifs]  = useState(loadAlerts)

  // Persistir projectes a localStorage cada vegada que canvien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  // Persistir alertes a localStorage cada vegada que canvien
  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(notifications))
  }, [notifications])

  const addProject = useCallback((data) => {
    const newProject = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      status: 'active',
      current_phase: data.current_phase || 1,
      team: [currentUser.id],
    }
    setProjects(prev => [newProject, ...prev])
    return newProject
  }, [currentUser])

  const updateProject = useCallback((id, updates) => {
    setProjects(prev =>
      prev.map(p => p.id === id
        ? { ...p, ...updates, updated_at: new Date().toISOString().split('T')[0] }
        : p
      )
    )
  }, [])

  const advancePhase = useCallback((projectId) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId && p.current_phase < 8
          ? { ...p, current_phase: p.current_phase + 1, updated_at: new Date().toISOString().split('T')[0] }
          : p
      )
    )
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const resetToDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ALERTS_KEY)
    setProjects(initialProjects)
    setNotifs(globalKPIs.alerts)
  }, [])

  const dismissAlert = useCallback((id) => {
    setNotifs(prev => prev.filter(a => a.id !== id))
  }, [])

  const getProjectById = useCallback((id) => projects.find(p => p.id === Number(id)), [projects])

  const getProjectsByPhase = useCallback((phase) =>
    projects.filter(p => p.current_phase === phase), [projects])

  const getUserById = useCallback((id) => users.find(u => u.id === id), [])
  const getTasksForProject  = useCallback((id) => tasks[id]  || [], [])
  const getFeedbackForProject = useCallback((id) => feedback[id] || [], [])
  const getPilotForProject  = useCallback((id) => pilots[id]  || null, [])
  const getEvalForProject   = useCallback((id) => evaluations[id] || null, [])
  const getHistoryForProject = useCallback((id) => phaseHistory[id] || [], [])
  const getIdeasForProject  = useCallback((id) => ideas.filter(i => i.project_id === id), [])

  return (
    <AppContext.Provider value={{
      projects, users, currentUser, notifications,
      globalKPIs,
      addProject, updateProject, advancePhase, deleteProject, resetToDemo, dismissAlert, onLogout,
      getProjectById, getProjectsByPhase, getUserById,
      getTasksForProject, getFeedbackForProject,
      getPilotForProject, getEvalForProject,
      getHistoryForProject, getIdeasForProject,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
