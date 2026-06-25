import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout/Layout'
import { useApp } from '../context/AppContext'
import { AI_ACTIONS } from '../data/constants'
import { Bot, Send, Sparkles, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const AI_RESPONSES = {
  generate_ideas: (project) => `**Idees generades per "${project?.title || 'el projecte seleccionat'}":**

1. **Integració amb portals de pacient** – Connexió amb app mòbil per alertes en temps real. Impacte: alt. Cost: baix.
2. **Model d'aprenentatge federat** – Entrenar el model IA entre hospitals sense compartir dades. Impacte: molt alt. Cost: mig.
3. **Dashboard per cap d'infermeria** – Visualització en temps real del risc de deteriorament. Impacte: alt. Cost: baix.
4. **Integrat amb HCE (SISAP/SAP)** – Activació automàtica de protocols d'alerta. Impacte: molt alt. Cost: alt.

_Recomanació principal: opció 4 per màxim impacte clínic._`,

  risk_detect: () => `**Projectes en risc detectats (anàlisi IA):**

⚠️ **Projecte #9 – App oncologia** (Risc CRÍTIC)
• Adopció 45% vs objectiu 70% → Pilot en risc de fracàs
• Acció recomanada: redisseny UX urgent + co-disseny amb pacients

⚠️ **Projecte #6 – Robot rehabilitació** (Risc ALT)
• Pressupost al 89% en fase Selecció → Risc de desviació
• Acció recomanada: revisió de l'abast i negociació proveïdor

ℹ️ **Projecte #3 – Chatbot urgències** (Risc MEDI)
• 18 dies sense actualitzar → Cal validar estat
• Acció recomanada: reunió d'equip de seguiment`,

  prioritize: (_, projects) => {
    const top = projects?.slice(0,4).map((p, i) =>
      `${i+1}. **${p.title}** – Score: ${(8.5 - i * 0.8).toFixed(1)}/10`
    ).join('\n') || ''
    return `**Priorització recomanada per ROI i impacte clínic:**

${top}

_Metodologia: combinació de puntuació MCDA (impacte clínic 25%, econòmic 20%, viabilitat 20%, innovació 15%, estratègia 20%)._`
  },

  summarize: (project) => `**Resum executiu – ${project?.title || 'Projecte'}**

**Objectiu:** ${project?.description?.slice(0, 100) || '...'}

**Fase actual:** ${project?.current_phase || 'N/A'}/8

**Estat:** ${project?.status || 'N/A'}

**Impacte estimat:**
- Clínic: ${project?.impact?.clinical || '?'}/10
- Econòmic: ${project?.impact?.economic || '?'}/10
- Exp. Pacient: ${project?.impact?.patient_exp || '?'}/10

**ROI projectat:** €${project?.estimated_roi ? Math.round(project.estimated_roi/1000)+'k' : 'pendent'}

**Recomanació:** Continuar el projecte i accelerar la fase de pilot per validar resultats clínics.`,

  analyze_pilot: (project) => `**Anàlisi de pilot – ${project?.title || 'Projecte'}:**

📊 **Resultats clau:**
• Taxa d'adopció: analitzant patrons vs benchmark de 72% (referència del sector)
• Detecció de desviació: si adopció < 60%, risc de fracàs del pilot

🔍 **Factors d'èxit identificats:**
1. Implicació del cap de servei (factor crític x3)
2. Formació prèvia adequada
3. Suport IT en temps real

⚡ **Accions recomanades:**
- Enquesta ràpida als usuaris de baixa adopció
- Sessió de co-disseny per identificar friccions
- Revisió del protocol de formació`,

  bottleneck: (_, __, kpis) => `**Colls d'ampolla identificats en el pipeline:**

🔴 **Fase 5 (Pilot)** – Temps mitjà: 180 dies
• Causa principal: manca de recursos d'infermeria per supervisió
• Solució: protocol de pilot lleuger per a tecnologies baix risc

🟡 **Fase 4 (Disseny)** – Temps mitjà: 75 dies
• Causa: múltiples iteracions de validació jurídica
• Solució: checklist pre-disseny per detectar barreres legals aviat

🟡 **Fase 7 (Implementació)** – Temps mitjà: 120 dies
• Causa: formació per a tots els professionals afectats
• Solució: e-learning asíncron + pilots de formació entre iguals`,
}

function Message({ msg }) {
  return (
    <div className={clsx('flex gap-3 animate-slide-in', msg.role === 'user' && 'flex-row-reverse')}>
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0',
        msg.role === 'user' ? 'bg-althaia-600 text-white' : 'bg-violet-100 text-violet-600'
      )}>
        {msg.role === 'user' ? 'JP' : <Bot size={16} />}
      </div>
      <div className={clsx(
        'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
        msg.role === 'user'
          ? 'bg-althaia-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
      )}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIPage() {
  const { projects, globalKPIs } = useApp()
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: '👋 Hola! Soc l\'assistent IA d\'Althaia Innovació.\n\nPuc ajudar-te a generar idees, detectar projectes en risc, recomanar prioritzacions, resumir projectes i analitzar resultats de pilots.\n\nSelecciona una acció ràpida o escriu el teu missatge.',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text) => {
    if (!text.trim() || loading) return
    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const project = projects.find(p => p.id === selectedProject) || projects[0]
      let response = `Entès! Estic processant la teva sol·licitud: "${text}"\n\nPer a una resposta més precisa, selecciona una acció específica al panell d'accions ràpides o especifica el projecte d'interès.`

      const lower = text.toLowerCase()
      if (lower.includes('risc') || lower.includes('bloquejat')) response = AI_RESPONSES.risk_detect()
      else if (lower.includes('idea') || lower.includes('proposta')) response = AI_RESPONSES.generate_ideas(project)
      else if (lower.includes('prio')) response = AI_RESPONSES.prioritize(project, projects)
      else if (lower.includes('resum')) response = AI_RESPONSES.summarize(project)
      else if (lower.includes('pilot')) response = AI_RESPONSES.analyze_pilot(project)
      else if (lower.includes('coll') || lower.includes('bottleneck')) response = AI_RESPONSES.bottleneck(project, projects, globalKPIs)

      setMessages(m => [...m, { id: Date.now(), role: 'assistant', content: response }])
      setLoading(false)
    }, 1200)
  }

  const quickAction = (action) => {
    const project = projects.find(p => p.id === selectedProject) || projects[0]
    const userContent = `${action.icon} ${action.label} ${project ? `– ${project.title}` : ''}`
    const userMsg = { id: Date.now(), role: 'user', content: userContent }
    setMessages(m => [...m, userMsg])
    setLoading(true)

    setTimeout(() => {
      const fn = AI_RESPONSES[action.id]
      const response = fn ? fn(project, projects, globalKPIs) : 'Processant...'
      setMessages(m => [...m, { id: Date.now(), role: 'assistant', content: response }])
      setLoading(false)
    }, 1400)
  }

  return (
    <Layout title="Assistent IA" subtitle="Anàlisi intel·ligent del pipeline">
      <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>

        {/* Project selector + quick actions */}
        <div className="card p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Sparkles size={15} className="text-violet-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Context del projecte</span>
            <select
              className="input py-1.5 text-xs w-auto flex-1 min-w-48"
              value={selectedProject || ''}
              onChange={e => setSelectedProject(Number(e.target.value) || null)}
            >
              <option value="">Tots els projectes</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {AI_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => quickAction(action)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 card overflow-y-auto p-5 space-y-4 mb-4">
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-violet-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="card p-3">
          <div className="flex items-center gap-3">
            <input
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              placeholder="Pregunta sobre projectes, idees, riscos..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="btn-primary py-2 disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
