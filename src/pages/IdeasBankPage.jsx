import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { SERVICES } from '../data/constants'
import { supabase, hasDB, ideaToRow, decryptIdea, encryptIdeaUpdates } from '../lib/supabase'
import { dbWrite } from '../lib/dbWrite'
import {
  Plus, Lightbulb, Check, X, ChevronRight, ChevronDown, ChevronUp,
  Search, Filter, ArrowRight, Trash2,
} from 'lucide-react'
import clsx from 'clsx'

const IDEAS_KEY = 'althaia_ideas_bank'

const ORIGINS = ['Professional sanitari', 'Ciutadà/Pacient', 'Empresa/Startup', 'Universitat/Recerca']

const STATUS_META = {
  pendent:     { label: 'Pendent',          color: 'bg-gray-100 text-gray-600'   },
  acceptada:   { label: 'Acceptada',        color: 'bg-blue-100 text-blue-700'   },
  descartada:  { label: 'Descartada',       color: 'bg-red-100 text-red-600'     },
  prioritzada: { label: 'Prioritzada',      color: 'bg-amber-100 text-amber-700' },
  projecte:    { label: 'Convertida →Projecte', color: 'bg-green-100 text-green-700' },
}

function loadIdeas() {
  try {
    const s = localStorage.getItem(IDEAS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function saveIdeas(ideas) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas))
}

const emptyForm = {
  title: '', description: '', origin: '', submitter: '', service: '',
}

export default function IdeasBankPage() {
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('tots')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [expanded, setExpanded] = useState(null)
  const [screening, setScreening] = useState({})  // { [id]: { result, notes } }

  // ── Càrrega inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (hasDB) {
        const { data, error } = await supabase.from('ideas_bank').select('*').order('created_at', { ascending: false })
        if (!error) { setIdeas((data || []).map(decryptIdea)); return }
        console.error('IdeasBankPage load:', error.message)
      }
      setIdeas(loadIdeas())
    }
    load()
  }, [])

  const addIdea = (idea) => {
    setIdeas(prev => [idea, ...prev])
    if (hasDB) dbWrite('ideas_bank', 'insert', { data: ideaToRow(idea) }).catch(err => console.error('addIdea:', err.message))
    else saveIdeas([idea, ...ideas])
  }

  const updateIdea = (id, updates) => {
    const next = ideas.map(i => i.id === id ? { ...i, ...updates } : i)
    setIdeas(next)
    if (hasDB) dbWrite('ideas_bank', 'update', { id, data: encryptIdeaUpdates(updates) }).catch(err => console.error('updateIdea:', err.message))
    else saveIdeas(next)
  }

  const removeIdea = (id) => {
    const next = ideas.filter(i => i.id !== id)
    setIdeas(next)
    if (hasDB) dbWrite('ideas_bank', 'delete', { id }).catch(err => console.error('removeIdea:', err.message))
    else saveIdeas(next)
  }

  const handleAdd = () => {
    if (!form.title.trim()) return
    const idea = {
      id: Date.now(),
      ...form,
      status: 'pendent',
      screening_result: '',
      screening_notes: '',
      screening_date: '',
      priority_level: '',
      priority_notes: '',
      priority_date: '',
      created_at: new Date().toISOString().split('T')[0],
    }
    addIdea(idea)
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleScreen = (id) => {
    const s = screening[id] || {}
    if (!s.result) return
    updateIdea(id, {
      status:           s.result,
      screening_result: s.result,
      screening_notes:  s.notes || '',
      screening_date:   new Date().toISOString().split('T')[0],
    })
    setScreening(prev => { const n = { ...prev }; delete n[id]; return n })
    setExpanded(null)
  }

  const handlePrioritize = (id, level) => {
    updateIdea(id, {
      status:         'prioritzada',
      priority_level: level,
      priority_date:  new Date().toISOString().split('T')[0],
    })
  }

  const handleDelete = (id) => {
    removeIdea(id)
    if (expanded === id) setExpanded(null)
  }

  const filtered = useMemo(() => {
    let list = ideas
    if (filterStatus !== 'tots') list = list.filter(i => i.status === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.submitter || '').toLowerCase().includes(q) ||
        (i.service || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [ideas, filterStatus, search])

  const counts = useMemo(() => {
    const c = { tots: ideas.length }
    ideas.forEach(i => { c[i.status] = (c[i.status] || 0) + 1 })
    return c
  }, [ideas])

  return (
    <Layout title="Banc d'Idees" subtitle="Captació, cribratge i priorització de propostes d'innovació">

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          ['Totes',        'tots',        ideas.length,                    'bg-gray-50 border-gray-200'],
          ['Pendents',     'pendent',     counts.pendent     || 0,         'bg-gray-50 border-gray-200'],
          ['Acceptades',   'acceptada',   counts.acceptada   || 0,         'bg-blue-50 border-blue-200'],
          ['Prioritzades', 'prioritzada', counts.prioritzada || 0,         'bg-amber-50 border-amber-200'],
          ['Projectes',    'projecte',    counts.projecte    || 0,         'bg-green-50 border-green-200'],
        ].map(([label, key, count, cls]) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={clsx('rounded-xl border p-3 text-left transition-all', cls,
              filterStatus === key ? 'ring-2 ring-althaia-400' : 'hover:opacity-80'
            )}>
            <p className="text-xl font-bold text-gray-900">{count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input className="text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 bg-transparent"
            placeholder="Cercar idea, proposant o servei..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary ml-auto">
          <Plus size={15} /> Nova idea
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5 mb-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb size={15} className="text-althaia-600" /> Registrar nova idea
          </h3>
          <div>
            <label className="label">Títol de la idea *</label>
            <input className="input" placeholder="Breu descripció de la proposta"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Descripció / problema detectat</label>
            <textarea className="input h-20 resize-none"
              placeholder="Quin problema o oportunitat identifica? Quin context?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Proposant / autor</label>
              <input className="input" placeholder="Nom o col·lectiu"
                value={form.submitter} onChange={e => setForm(f => ({ ...f, submitter: e.target.value }))} />
            </div>
            <div>
              <label className="label">Servei relacionat</label>
              <select className="input" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}>
                <option value="">Selecciona...</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Origen (Quàdruple Hèlix)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ORIGINS.map(o => (
                <button key={o} type="button"
                  onClick={() => setForm(f => ({ ...f, origin: f.origin === o ? '' : o }))}
                  className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                    form.origin === o ? 'bg-althaia-600 text-white border-althaia-600' : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                  )}>{o}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="btn-secondary">Cancel·lar</button>
            <button onClick={handleAdd} disabled={!form.title.trim()} className="btn-primary disabled:opacity-40">
              <Check size={14} /> Registrar idea
            </button>
          </div>
        </div>
      )}

      {/* Ideas list */}
      <div className="card divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <Lightbulb size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {ideas.length === 0 ? 'No hi ha idees registrades. Afegeix la primera!' : 'Cap idea coincideix amb la cerca.'}
            </p>
          </div>
        )}

        {filtered.map(idea => {
          const meta = STATUS_META[idea.status] || STATUS_META.pendent
          const isOpen = expanded === idea.id
          const sc = screening[idea.id] || {}

          return (
            <div key={idea.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-althaia-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb size={15} className="text-althaia-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{idea.title}</p>
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', meta.color)}>
                      {meta.label}
                    </span>
                    {idea.priority_level && (
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full',
                        idea.priority_level === 'alta' ? 'bg-red-100 text-red-600' :
                        idea.priority_level === 'mitja' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-500'
                      )}>
                        Prioritat {idea.priority_level}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-400">
                    {idea.submitter && <span>{idea.submitter}</span>}
                    {idea.service && <span>{idea.service}</span>}
                    {idea.origin && <span>{idea.origin}</span>}
                    <span>{idea.created_at}</span>
                  </div>
                  {idea.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{idea.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {idea.status === 'acceptada' && (
                    <button onClick={() => navigate(`/new?fromIdea=${idea.id}`)}
                      title="Convertir en projecte"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all">
                      <ArrowRight size={12} /> Projecte
                    </button>
                  )}
                  <button onClick={() => setExpanded(isOpen ? null : idea.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => handleDelete(idea.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded: actions */}
              {isOpen && (
                <div className="mt-4 ml-11 space-y-4">
                  {/* Cribratge */}
                  {(idea.status === 'pendent') && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-700">Cribratge inicial</p>
                      <div className="flex gap-2">
                        {['acceptada', 'descartada'].map(r => (
                          <button key={r} type="button"
                            onClick={() => setScreening(prev => ({ ...prev, [idea.id]: { ...prev[idea.id], result: r } }))}
                            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                              sc.result === r
                                ? r === 'acceptada' ? 'bg-blue-600 text-white border-blue-600' : 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            )}>
                            {r === 'acceptada' ? <><Check size={13} className="inline mr-1" />Acceptar</> : <><X size={13} className="inline mr-1" />Descartar</>}
                          </button>
                        ))}
                      </div>
                      <textarea className="input h-16 resize-none text-xs"
                        placeholder="Notes del cribratge (opcional)..."
                        value={sc.notes || ''}
                        onChange={e => setScreening(prev => ({ ...prev, [idea.id]: { ...prev[idea.id], notes: e.target.value } }))} />
                      <button onClick={() => handleScreen(idea.id)}
                        disabled={!sc.result}
                        className="btn-primary text-xs py-1.5 disabled:opacity-40">
                        <Check size={13} /> Confirmar cribratge
                      </button>
                    </div>
                  )}

                  {/* Priorització */}
                  {idea.status === 'acceptada' && (
                    <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-700">Priorització de comitè</p>
                      <div className="flex gap-2">
                        {['alta','mitja','baixa'].map(lvl => (
                          <button key={lvl} type="button"
                            onClick={() => handlePrioritize(idea.id, lvl)}
                            className={clsx('flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                              idea.priority_level === lvl
                                ? 'bg-althaia-600 text-white border-althaia-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-althaia-300'
                            )}>{lvl}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resultat cribratge ja fet */}
                  {['acceptada','descartada','prioritzada','projecte'].includes(idea.status) && idea.screening_date && (
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p><span className="font-medium text-gray-700">Cribratge:</span> {idea.screening_date} — {idea.screening_result}</p>
                      {idea.screening_notes && <p className="italic">"{idea.screening_notes}"</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
