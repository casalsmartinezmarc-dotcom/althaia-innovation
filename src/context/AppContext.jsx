import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import {
  projects as initialProjects, users as mockUsers, globalKPIs,
  tasks as mockTasks, feedback, pilots, evaluations, phaseHistory, ideas,
} from '../data/mockData'
import {
  supabase, hasDB,
  projectToRow, decryptProject, encryptProjectUpdates,
  encryptTaskFields, encryptEventFields, encryptFeedbackFields,
  rowsToTaskMap, rowsToEventMap, rowsToFeedbackMap,
} from '../lib/supabase'
import { dbWrite } from '../lib/dbWrite'

const STORAGE_KEY  = 'althaia_projects'
const ALERTS_KEY   = 'althaia_alerts'
const TASKS_KEY    = 'althaia_project_tasks'
const TIMELINE_KEY = 'althaia_timeline_events'
const FEEDBACK_KEY = 'althaia_project_feedback'

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
  const [projectFeedback,setProjectFeedback]= useState({})
  const [notifications,  setNotifs]         = useState(() => loadLS(ALERTS_KEY, globalKPIs.alerts))
  const [loading,        setLoading]        = useState(true)
  const [dbWriteError,   setDbWriteError]   = useState(null)

  const isAdmin = currentUser?.role === 'admin'

  // ── Càrrega inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (hasDB) {
        try {
          const [{ data: pData, error: pErr }, { data: tData }, { data: eData }, { data: fData }] = await Promise.all([
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('project_tasks').select('*'),
            supabase.from('timeline_events').select('*'),
            supabase.from('project_feedback').select('*'),
          ])
          if (pErr) throw pErr

          // ── Migració automàtica localStorage → Supabase ───────────────────
          let projectsToUse = (pData || []).map(decryptProject)
          if (projectsToUse.length === 0) {
            const localProjects = loadLS(STORAGE_KEY, [])
            if (localProjects.length > 0) {
              console.info(`[AppContext] Migrant ${localProjects.length} projectes de localStorage → Supabase`)
              const results = await Promise.allSettled(
                localProjects.map(p => dbWrite('projects', 'insert', { data: projectToRow(p) }))
              )
              const failed = results.filter(r => r.status === 'rejected')
              if (failed.length === 0) {
                // Tots els inserts han anat bé → netejar localStorage
                localStorage.removeItem(STORAGE_KEY)
                localStorage.removeItem(TASKS_KEY)
                localStorage.removeItem(TIMELINE_KEY)
              } else {
                // Alguns inserts han fallat → NO esborrem localStorage
                console.error('[AppContext] Migració parcial, localStorage conservat:', failed[0]?.reason?.message)
              }
              projectsToUse = localProjects
            }
          }

          setProjects(projectsToUse)
          setProjectTasks(rowsToTaskMap(tData || []))
          setTimelineEvents(rowsToEventMap(eData || []))
          setProjectFeedback(rowsToFeedbackMap(fData || []))
        } catch (err) {
          console.error('Supabase error, usant localStorage:', err)
          setProjects(loadLS(STORAGE_KEY, initialProjects))
          setProjectTasks(loadLS(TASKS_KEY, {}))
          setTimelineEvents(loadLS(TIMELINE_KEY, {}))
          setProjectFeedback(loadLS(FEEDBACK_KEY, {}))
        }
      } else {
        // Sense Supabase → localStorage
        setProjects(loadLS(STORAGE_KEY, initialProjects))
        setProjectTasks(loadLS(TASKS_KEY, {}))
        setTimelineEvents(loadLS(TIMELINE_KEY, {}))
        setProjectFeedback(loadLS(FEEDBACK_KEY, {}))
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Persistència localStorage (només sense Supabase) ─────────────────────
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(STORAGE_KEY,  JSON.stringify(projects))       }, [projects, loading])
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(TASKS_KEY,    JSON.stringify(projectTasks))   }, [projectTasks, loading])
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(TIMELINE_KEY, JSON.stringify(timelineEvents)) }, [timelineEvents, loading])
  useEffect(() => { if (!hasDB && !loading) localStorage.setItem(FEEDBACK_KEY, JSON.stringify(projectFeedback))}, [projectFeedback, loading])
  useEffect(() => { localStorage.setItem(ALERTS_KEY, JSON.stringify(notifications)) }, [notifications])

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
    if (hasDB) {
      dbWrite('projects', 'insert', { data: projectToRow(newProject) })
        .then(() => setDbWriteError(null))
        .catch(err => {
          console.error('addProject:', err.message)
          setDbWriteError(`Error guardant projecte: ${err.message}`)
        })
    }
    return newProject
  }, [])

  const updateProject = useCallback((id, updates) => {
    const now = new Date().toISOString().split('T')[0]
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: now } : p))
    if (hasDB) {
      dbWrite('projects', 'update', { id, data: { ...encryptProjectUpdates(updates), updated_at: now } })
        .catch(err => console.error('updateProject:', err.message))
    }
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    if (hasDB) {
      dbWrite('projects', 'delete', { id }).catch(err => console.error('deleteProject:', err.message))
    }
  }, [])

  const advancePhase = useCallback((projectId) => {
    setProjects(prev => {
      const p = prev.find(x => x.id === projectId)
      if (!p || p.current_phase >= 8) return prev
      const newPhase = p.current_phase + 1
      if (hasDB) {
        dbWrite('projects', 'update', { id: projectId, data: { current_phase: newPhase } })
          .catch(err => console.error('advancePhase:', err.message))
      }
      return prev.map(x => x.id === projectId
        ? { ...x, current_phase: newPhase, updated_at: new Date().toISOString().split('T')[0] }
        : x
      )
    })
  }, [])

  const resetToDemo = useCallback(async () => {
    if (hasDB) {
      await dbWrite('projects', 'deleteAll').catch(err => console.error('resetToDemo:', err.message))
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ALERTS_KEY)
    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(TIMELINE_KEY)
    localStorage.removeItem(FEEDBACK_KEY)
    setProjects(hasDB ? [] : initialProjects)
    setNotifs(globalKPIs.alerts)
    setProjectTasks({})
    setTimelineEvents({})
    setProjectFeedback({})
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
    if (hasDB) {
      const encTask = encryptTaskFields({
        id:          task.id,
        project_id:  pid,
        title:       task.title,
        description: task.description  || null,
        status:      task.status,
        priority:    task.priority,
        due_date:    task.due_date     || null,
        assigned_to: task.assigned_to || null,
      })
      dbWrite('project_tasks', 'insert', { data: encTask }).catch(err => console.error('addTask:', err.message))
    }
    return task
  }, [])

  const updateTask = useCallback((projectId, taskId, updates) => {
    const pid = Number(projectId)
    setProjectTasks(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).map(t => t.id === taskId ? { ...t, ...updates } : t),
    }))
    if (hasDB) {
      dbWrite('project_tasks', 'update', { id: taskId, data: encryptTaskFields(updates) })
        .catch(err => console.error('updateTask:', err.message))
    }
  }, [])

  const deleteTask = useCallback((projectId, taskId) => {
    const pid = Number(projectId)
    setProjectTasks(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).filter(t => t.id !== taskId),
    }))
    if (hasDB) {
      dbWrite('project_tasks', 'delete', { id: taskId }).catch(err => console.error('deleteTask:', err.message))
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
    if (hasDB) {
      const encEvent = encryptEventFields({
        id:         event.id,
        project_id: pid,
        title:      event.title,
        date:       event.date,
        type:       event.type,
        notes:      event.notes || null,
      })
      dbWrite('timeline_events', 'insert', { data: encEvent }).catch(err => console.error('addTimelineEvent:', err.message))
    }
    return event
  }, [])

  const deleteTimelineEvent = useCallback((projectId, eventId) => {
    const pid = Number(projectId)
    setTimelineEvents(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).filter(e => e.id !== eventId),
    }))
    if (hasDB) {
      dbWrite('timeline_events', 'delete', { id: eventId }).catch(err => console.error('deleteTimelineEvent:', err.message))
    }
  }, [])

  // ── Feedback ────────────────────────────────────────────────────────────────
  const addFeedback = useCallback((projectId, feedbackData) => {
    const pid = Number(projectId)
    const fb = {
      id:         Date.now(),
      project_id: pid,
      type:       feedbackData.type    || 'clinical',
      message:    feedbackData.message || '',
      created_at: new Date().toISOString().split('T')[0],
      isCustom:   true,
    }
    setProjectFeedback(prev => ({ ...prev, [pid]: [...(prev[pid] || []), fb] }))
    if (hasDB) {
      const encFb = encryptFeedbackFields({ id: fb.id, project_id: pid, type: fb.type, message: fb.message, created_at: fb.created_at })
      dbWrite('project_feedback', 'insert', { data: encFb }).catch(err => console.error('addFeedback:', err.message))
    }
    return fb
  }, [])

  const deleteFeedback = useCallback((projectId, feedbackId) => {
    const pid = Number(projectId)
    setProjectFeedback(prev => ({
      ...prev,
      [pid]: (prev[pid] || []).filter(f => f.id !== feedbackId),
    }))
    if (hasDB) {
      dbWrite('project_feedback', 'delete', { id: feedbackId }).catch(err => console.error('deleteFeedback:', err.message))
    }
  }, [])

  // ── KPIs computats des de dades reals ───────────────────────────────────────
  const liveKPIs = useMemo(() => {
    const hadPilot    = projects.filter(p => p.current_phase >= 5).length
    const implemented = projects.filter(p => p.current_phase >= 7).length
    const pilotSuccessRate = hadPilot > 0 ? Math.round((implemented / hadPilot) * 100) : 0

    const projectsPerPhase = Array.from({ length: 8 }, (_, i) =>
      projects.filter(p => p.current_phase === i + 1).length
    )

    const currentYear  = new Date().getFullYear()
    const monthCounts  = Array(12).fill(0)
    projects.forEach(p => {
      if (p.created_at) {
        const d = new Date(p.created_at)
        if (d.getFullYear() === currentYear) monthCounts[d.getMonth()]++
      }
    })

    const serviceMap = {}
    projects.forEach(p => {
      const svc = p.service?.trim()
      if (svc) serviceMap[svc] = (serviceMap[svc] || 0) + 1
    })
    const projectsByService = Object.entries(serviceMap)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    return {
      active_projects:       projects.filter(p => p.status === 'active').length,
      paused_projects:       projects.filter(p => p.status === 'paused').length,
      ai_projects:           projects.filter(p => p.tags?.includes('IA')).length,
      pilot_success_rate:    pilotSuccessRate,
      pilot_count:           hadPilot,
      projects_per_phase:    projectsPerPhase,
      monthly_new_projects:  monthCounts,
      projects_by_service:   projectsByService,
    }
  }, [projects])

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

  const getFeedbackForProject = useCallback((id) => {
    const numId = Number(id)
    return [...(feedback[numId] || []), ...(projectFeedback[numId] || [])]
  }, [projectFeedback])
  const getPilotForProject    = useCallback((id) => {
    const p = getProjectById(id)
    return p?.pilot_data || pilots[Number(id)] || null
  }, [projects])
  const getEvalForProject     = useCallback((id) => {
    const p = getProjectById(id)
    return p?.evaluation_data || evaluations[Number(id)] || null
  }, [projects])

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
      projects, currentUser, isAdmin, notifications, globalKPIs: liveKPIs, hasDB,
      dbWriteError, clearDbWriteError: () => setDbWriteError(null),
      addProject, updateProject, deleteProject, advancePhase, resetToDemo, dismissAlert,
      onLogout,
      addTask, updateTask, deleteTask,
      addTimelineEvent, deleteTimelineEvent,
      addFeedback, deleteFeedback,
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
