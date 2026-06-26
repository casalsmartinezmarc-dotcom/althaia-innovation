import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  projects as initialProjects, users as mockUsers, globalKPIs,
  tasks as mockTasks, feedback, pilots, evaluations, phaseHistory, ideas,
} from '../data/mockData'
import { loadUsers, saveUsers, getAllUsers } from '../data/auth'
import { supabase, hasDB, projectToRow, rowsToTaskMap, rowsToEventMap } from '../lib/supabase'

const STORAGE_KEY  = 'althaia_projects'
const ALERTS_KEY   = 'althaia_alerts'
const TASKS_KEY    = 'althaia_project_tasks'
const TIMELINE_KEY = 'althaia_timeline_events'

function loadLS(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}

const AppContext = createContext(null)

export function AppProvider({ children, currentUser, onLogout }) {
  const [projects,       setProjects]       = useState([])
  const [projectTasks,   setProjectTasks]   = useState({})
  const [timelineEvents, setTimelineEvents] = useState({})
  const [notifications,  setNotifs]         = useState(() => loadLS(ALERTS_KEY, globalKPIs.alerts))
  const [regUsers,       setRegUsers]       = useState(loadUsers)
  const [loading,        setLoading]        = useState(true)

  const isAdmin = currentUser?.role === 'admin'

  // ── Càrrega inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (hasDB) {
        try {
          const [{ data: pData, error: pErr }, { data: tData }, { data: eData }] = await Promise.all([
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('project_tasks').select('*'),
            supabase.from('timeline_events').select('*'),
          ])
          if (pErr) throw pErr
          setProjects(pData || [])
          setProjectTasks(rowsToTaskMap(tData || []))
          setTimelineEvents(rowsToEventMap(eData || []))
        } catch (err) {
          console.error('Supabase error, usant localStorage:', err)
          setProjects(loadLS(STORAGE_KEY, initialProjects))
          setProjectTasks(loadLS(TASKS_KEY, {}))
          setTimelineEvents(loadLS(TIMELINE_KEY, {}))
        }
      } else {
        // Sense Supabase → localStorage
        setProjects(loadLS(STORAGE_KEY, initialProjects))
        setProjectTasks(loadLS(TASKS_KEY, {}))
        setTimelineEvents(loadLS(TIMELINE_KEY, {}))
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Persistència localStorage (només sense Supabase) ─────────────────────
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(STORAGE_KEY,  JSON.stringify(projects))       }, [projects, loading])
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(TASKS_KEY,    JSON.stringify(projectTasks))   }, [projectTasks, loading])
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(TIMELINE_KEY, JSON.stringify(timelineEvents)) }, [timelineEvents, loading])
  useEffect(() => { localStorage.setItem(ALERTS_KEY, JSON.stringify(notifications)) }, [notifications])
  useEffect(() => { saveUsers(regUsers) }, [regUsers])

  // ── Projectes ───────────────────────────────────────────────────────────────
  const addProject = useCallback((data) => {
    const now = new Date().toISOString().split('T')[0]
    const newProject = {
      id:            Date.now(),
      created_at:    now,
      updated_at:    now,
      status:        'active',
      current_phase: data.current_phase || 1,
      ...data,
    }
    setProjects(prev => [newProject, ...prev])
    if (supabase) {
      supabase.from('projects').insert(projectToRow(newProject))
        .then(({ error }) => { if (error) console.error('addProject:', error.message) })
    }
    return newProject
  }, [])

  const updateProject = useCallback((id, updates) => {
    const now = new Date().toISOString().split('T')[0]
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: now } : p))
    if (supabase) {
      supabase.from('projects').update({ ...updates, updated_at: now }).eq('id', id)
        .then(({ error }) => { if (error) console.error('updateProject:', error.message) })
    }
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    if (supabase) {
      supabase.from('projects').delete().eq('id', id)
        .then(({ error }) => { if (error) console.error('deleteProject:', error.message) })
    }
  }, [])

  const advancePhase = useCallback((projectId) => {
    setProjects(prev => {
      const p = prev.find(x => x.id === projectId)
      if (!p || p.current_phase >= 8) return prev
      const newPhase = p.current_phase + 1
      if (supabase) {
        supabase.from('projects').update({ current_phase: newPhase }).eq('id', projectId)
          .then(({ error }) => { if (error) console.error('advancePhase:', error.message) })
      }
      return prev.map(x => x.id === projectId
        ? { ...x, current_phase: newPhase, updated_at: new Date().toISOString().split('T')[0] }
        : x
      )
    })
  }, [])

  const resetToDemo = useCallback(async () => {
    if (supabase) {
      await supabase.from('projects').delete().gt('id', 0)
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ALERTS_KEY)
    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(TIMELINE_KEY)
    setProjects(hasDB ? [] : initialProjects)
    setNotifs(globalKPIs.alerts)
    setProjectTasks({})
    setTimelineEvents({})
  }, [])

  const dismissAlert = useCallback((id) => {
    setNotifs(prev => prev.filter(a => a.id !== id))
  }, [])

  // ── Tasques ─────────────────────────────────────────────────────────────────
  const addTask = useCallback((projectId, taskData) => {
    const pid = Number(projectId)
    const task = {
      id:          Date.now(),
      project_id:  pid,
      title:       taskData.title       || '',
      description: taskData.description || '',
      status:      taskData.status      || 'pending',
      priority:    taskData.priority    || 'mitja',
      due_date:    taskData.due_date    || '',
      assigned_to: taskData.assigned_to || '',
      created_at:  new Date().toISOString().split('T')[0],
      isCustom:    true,
    }
    setProjectTasks(prev => ({ ...prev, [pid]: [...(prev[pid] || []), task] }))
    if (supabase) {
      supabase.from('project_tasks').insert({
        id:          task.id,
        project_id:  pid,
        title:       task.title,
        description: task.description   || null,
        status:      task.status,
        priority:    task.priority,
        due_date:    task.due_date      || null,
        assigned_to: task.assigned_to  || null,
      }).then(({ error }) => { if (error) console.error('addTask:', error.message) })
    }
    return task
  }, [])

  const updateTask = useCallback((projectId, taskId, updates) => {
    const pid = Number(projectId)
    setProjectTasks(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).map(t => t.id === taskId ? { ...t, ...updates } : t),
    }))
    if (supabase) {
      supabase.from('project_tasks').update(updates).eq('id', taskId)
        .then(({ error }) => { if (error) console.error('updateTask:', error.message) })
    }
  }, [])

  const deleteTask = useCallback((projectId, taskId) => {
    const pid = Number(projectId)
    setProjectTasks(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).filter(t => t.id !== taskId),
    }))
    if (supabase) {
      supabase.from('project_tasks').delete().eq('id', taskId)
        .then(({ error }) => { if (error) console.error('deleteTask:', error.message) })
    }
  }, [])

  // ── Timeline ────────────────────────────────────────────────────────────────
  const addTimelineEvent = useCallback((projectId, eventData) => {
    const pid = Number(projectId)
    const event = {
      id:         Date.now(),
      project_id: pid,
      title:      eventData.title || '',
      date:       eventData.date  || new Date().toISOString().split('T')[0],
      type:       eventData.type  || 'milestone',
      notes:      eventData.notes || '',
      isCustom:   true,
    }
    setTimelineEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), event] }))
    if (supabase) {
      supabase.from('timeline_events').insert({
        id:         event.id,
        project_id: pid,
        title:      event.title,
        date:       event.date,
        type:       event.type,
        notes:      event.notes || null,
      }).then(({ error }) => { if (error) console.error('addTimelineEvent:', error.message) })
    }
    return event
  }, [])

  const deleteTimelineEvent = useCallback((projectId, eventId) => {
    const pid = Number(projectId)
    setTimelineEvents(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).filter(e => e.id !== eventId),
    }))
    if (supabase) {
      supabase.from('timeline_events').delete().eq('id', eventId)
        .then(({ error }) => { if (error) console.error('deleteTimelineEvent:', error.message) })
    }
  }, [])

  // ── Usuaris ─────────────────────────────────────────────────────────────────
  const getAllRegisteredUsers = useCallback(() => getAllUsers(), [regUsers])

  const toggleUserActive = useCallback((userId) => {
    setRegUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u))
  }, [])

  const changeUserRole = useCallback((userId, newRole) => {
    setRegUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }, [])

  const deleteUser = useCallback((userId) => {
    setRegUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  // ── Lookups ──────────────────────────────────────────────────────────────────
  const getProjectById     = useCallback((id) => projects.find(p => p.id === Number(id)), [projects])
  const getProjectsByPhase = useCallback((phase) => projects.filter(p => p.current_phase === phase), [projects])
  const getUserById        = useCallback((id) => mockUsers.find(u => u.id === id), [])

  const getTasksForProject = useCallback((id) => {
    const numId = Number(id)
    const base   = mockTasks[numId] || []
    const custom = projectTasks[numId] || []
    return [...base, ...custom]
  }, [projectTasks])

  const getFeedbackForProject = useCallback((id) => feedback[Number(id)]     || [],   [])
  const getPilotForProject    = useCallback((id) => pilots[Number(id)]        || null, [])
  const getEvalForProject     = useCallback((id) => evaluations[Number(id)]   || null, [])

  const getHistoryForProject = useCallback((id) => {
    const numId  = Number(id)
    const base   = phaseHistory[numId] || []
    const custom = (timelineEvents[numId] || []).map(e => ({
      phase_id:   null,
      entered_at: e.date,
      exited_at:  null,
      notes:      e.title + (e.notes ? ' — ' + e.notes : ''),
      isCustom:   true,
      customType: e.type,
      customId:   e.id,
    }))
    return [...base, ...custom].sort((a, b) => (a.entered_at || '').localeCompare(b.entered_at || ''))
  }, [timelineEvents])

  const getIdeasForProject = useCallback((id) => ideas.filter(i => i.project_id === Number(id)), [])

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-althaia-200 border-t-althaia-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">
            {hasDB ? 'Connectant a la base de dades...' : 'Carregant projectes...'}
          </p>
          {hasDB && <p className="text-xs text-gray-400 mt-1">Supabase</p>}
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      projects, currentUser, isAdmin, notifications, globalKPIs, hasDB,
      addProject, updateProject, deleteProject, advancePhase, resetToDemo, dismissAlert,
      onLogout,
      addTask, updateTask, deleteTask,
      addTimelineEvent, deleteTimelineEvent,
      getAllRegisteredUsers, toggleUserActive, changeUserRole, deleteUser,
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
