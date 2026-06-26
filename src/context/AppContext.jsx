import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { projects as initialProjects, users as mockUsers, globalKPIs, tasks as mockTasks, feedback, pilots, evaluations, phaseHistory, ideas } from '../data/mockData'
import { loadUsers, saveUsers, getAllUsers } from '../data/auth'

const STORAGE_KEY   = 'althaia_projects'
const ALERTS_KEY    = 'althaia_alerts'
const TASKS_KEY     = 'althaia_project_tasks'
const TIMELINE_KEY  = 'althaia_timeline_events'

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialProjects
  } catch { return initialProjects }
}

function loadAlerts() {
  try {
    const saved = localStorage.getItem(ALERTS_KEY)
    return saved ? JSON.parse(saved) : globalKPIs.alerts
  } catch { return globalKPIs.alerts }
}

function loadProjectTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch { return {} }
}

function loadTimelineEvents() {
  try {
    const saved = localStorage.getItem(TIMELINE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch { return {} }
}

const AppContext = createContext(null)

export function AppProvider({ children, currentUser, onLogout }) {
  const [projects,        setProjects]        = useState(loadProjects)
  const [notifications,   setNotifs]          = useState(loadAlerts)
  const [regUsers,        setRegUsers]        = useState(loadUsers)
  const [projectTasks,    setProjectTasks]    = useState(loadProjectTasks)
  const [timelineEvents,  setTimelineEvents]  = useState(loadTimelineEvents)

  const isAdmin = currentUser?.role === 'admin'

  // Persistir a localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEY,  JSON.stringify(projects))       }, [projects])
  useEffect(() => { localStorage.setItem(ALERTS_KEY,   JSON.stringify(notifications))  }, [notifications])
  useEffect(() => { localStorage.setItem(TASKS_KEY,    JSON.stringify(projectTasks))   }, [projectTasks])
  useEffect(() => { localStorage.setItem(TIMELINE_KEY, JSON.stringify(timelineEvents)) }, [timelineEvents])
  useEffect(() => { saveUsers(regUsers) }, [regUsers])

  // ── Projectes ────────────────────────────────────────────────────────────────
  const addProject = useCallback((data) => {
    const newProject = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      status: 'active',
      current_phase: data.current_phase || 1,
    }
    setProjects(prev => [newProject, ...prev])
    return newProject
  }, [])

  const updateProject = useCallback((id, updates) => {
    setProjects(prev =>
      prev.map(p => p.id === id
        ? { ...p, ...updates, updated_at: new Date().toISOString().split('T')[0] }
        : p
      )
    )
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
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

  const resetToDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ALERTS_KEY)
    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(TIMELINE_KEY)
    setProjects(initialProjects)
    setNotifs(globalKPIs.alerts)
    setProjectTasks({})
    setTimelineEvents({})
  }, [])

  const dismissAlert = useCallback((id) => {
    setNotifs(prev => prev.filter(a => a.id !== id))
  }, [])

  // ── Gestió de tasques ────────────────────────────────────────────────────────
  const addTask = useCallback((projectId, taskData) => {
    const task = {
      title:       taskData.title || '',
      description: taskData.description || '',
      status:      taskData.status || 'pending',
      priority:    taskData.priority || 'mitja',
      due_date:    taskData.due_date || '',
      assigned_to: taskData.assigned_to || '',
      created_at:  new Date().toISOString().split('T')[0],
      id:          Date.now(),
      isCustom:    true,
    }
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), task],
    }))
    return task
  }, [])

  const updateTask = useCallback((projectId, taskId, updates) => {
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    }))
  }, [])

  const deleteTask = useCallback((projectId, taskId) => {
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(t => t.id !== taskId),
    }))
  }, [])

  // ── Gestió d'events de timeline ──────────────────────────────────────────────
  const addTimelineEvent = useCallback((projectId, eventData) => {
    const event = {
      id:       Date.now(),
      title:    eventData.title || '',
      date:     eventData.date  || new Date().toISOString().split('T')[0],
      type:     eventData.type  || 'milestone',
      notes:    eventData.notes || '',
      isCustom: true,
    }
    setTimelineEvents(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), event],
    }))
    return event
  }, [])

  const deleteTimelineEvent = useCallback((projectId, eventId) => {
    setTimelineEvents(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(e => e.id !== eventId),
    }))
  }, [])

  // ── Gestió d'usuaris (només admin) ───────────────────────────────────────────
  const getAllRegisteredUsers = useCallback(() => getAllUsers(), [regUsers])

  const toggleUserActive = useCallback((userId) => {
    setRegUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, active: !u.active } : u)
    )
  }, [])

  const changeUserRole = useCallback((userId, newRole) => {
    setRegUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
    )
  }, [])

  const deleteUser = useCallback((userId) => {
    setRegUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  // ── Lookups ───────────────────────────────────────────────────────────────────
  const getProjectById     = useCallback((id) => projects.find(p => p.id === Number(id)), [projects])
  const getProjectsByPhase = useCallback((phase) => projects.filter(p => p.current_phase === phase), [projects])
  const getUserById        = useCallback((id) => mockUsers.find(u => u.id === id), [])

  // Combines mockData tasks + custom tasks
  const getTasksForProject = useCallback((id) => {
    const numId  = Number(id)
    const base   = mockTasks[numId] || []
    const custom = projectTasks[numId] || []
    return [...base, ...custom]
  }, [projectTasks])

  // Combines mockData feedback
  const getFeedbackForProject = useCallback((id) => feedback[Number(id)] || [], [])
  const getPilotForProject    = useCallback((id) => pilots[Number(id)]   || null, [])
  const getEvalForProject     = useCallback((id) => evaluations[Number(id)] || null, [])

  // Combines mockData phase history + custom timeline events
  const getHistoryForProject = useCallback((id) => {
    const numId  = Number(id)
    const base   = phaseHistory[numId] || []
    const custom = (timelineEvents[numId] || []).map(e => ({
      phase_id:    null,
      entered_at:  e.date,
      exited_at:   null,
      notes:       e.title + (e.notes ? ' — ' + e.notes : ''),
      isCustom:    true,
      customType:  e.type,
      customId:    e.id,
    }))
    // Merge and sort by date
    return [...base, ...custom].sort((a, b) =>
      (a.entered_at || '').localeCompare(b.entered_at || '')
    )
  }, [timelineEvents])

  const getIdeasForProject = useCallback((id) => ideas.filter(i => i.project_id === Number(id)), [])

  return (
    <AppContext.Provider value={{
      projects, currentUser, isAdmin, notifications, globalKPIs,
      addProject, updateProject, deleteProject, advancePhase, resetToDemo, dismissAlert,
      onLogout,
      // Tasques
      addTask, updateTask, deleteTask,
      // Timeline
      addTimelineEvent, deleteTimelineEvent,
      // Gestió usuaris
      getAllRegisteredUsers, toggleUserActive, changeUserRole, deleteUser,
      // Lookups
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
