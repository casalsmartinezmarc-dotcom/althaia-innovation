export const PHASES = [
  { id: 1, name: 'Detecció',       icon: '🔍', color: 'purple',  desc: 'Registre de necessitats clíniques' },
  { id: 2, name: 'Generació',      icon: '💡', color: 'pink',    desc: 'Idees i propostes de solució' },
  { id: 3, name: 'Selecció',       icon: '🎯', color: 'blue',    desc: 'Priorització i matriu de decisió' },
  { id: 4, name: 'Disseny',        icon: '📐', color: 'teal',    desc: 'Definició detallada del projecte' },
  { id: 5, name: 'Pilot',          icon: '🧪', color: 'orange',  desc: 'Prova pilot controlada' },
  { id: 6, name: 'Avaluació',      icon: '📊', color: 'violet',  desc: 'Anàlisi de resultats del pilot' },
  { id: 7, name: 'Implementació',  icon: '🚀', color: 'amber',   desc: 'Desplegament a l\'organització' },
  { id: 8, name: 'Seguiment',      icon: '📈', color: 'sky',     desc: 'Monitoratge continu' },
]

export const PHASE_COLORS = {
  1: { bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500'  },
  2: { bg: 'bg-pink-100',    text: 'text-pink-700',    border: 'border-pink-200',    dot: 'bg-pink-500'    },
  3: { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  4: { bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500'    },
  5: { bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  6: { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500'  },
  7: { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  8: { bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500'     },
}

export const STATUS_CONFIG = {
  active:    { label: 'Actiu',     bg: 'bg-green-100',  text: 'text-green-700'  },
  paused:    { label: 'Pausat',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
  rejected:  { label: 'Rebutjat', bg: 'bg-red-100',    text: 'text-red-700'    },
  completed: { label: 'Completat', bg: 'bg-blue-100',   text: 'text-blue-700'   },
}

export const SERVICES = [
  'Cardiologia', 'Neurologia', 'Oncologia', 'Urgències', 'UCI',
  'Pediatria', 'Traumatologia', 'Cirurgia', 'Medicina Interna',
  'Radiologia', 'Farmàcia', 'Infermeria', 'Geriatria', 'Salut Mental',
  'Gestió', 'Innovació', 'Tecnologia', 'Qualitat',
]

export const ROLES = [
  { value: 'admin',     label: 'Administrador' },
  { value: 'innovacio', label: 'Equip Innovació' },
  { value: 'clinic',    label: 'Professional Clínic' },
  { value: 'gestor',    label: 'Gestor' },
]

export const IMPACT_AREAS = [
  { key: 'clinical',      label: 'Impacte Clínic'           },
  { key: 'economic',      label: 'Impacte Econòmic'         },
  { key: 'organizational',label: 'Impacte Organitzatiu'     },
  { key: 'patient_exp',   label: 'Experiència del Pacient'  },
]

export const EVALUATION_CRITERIA = [
  { key: 'clinical_impact',  label: 'Impacte Clínic',     weight: 0.25 },
  { key: 'economic_impact',  label: 'Impacte Econòmic',   weight: 0.20 },
  { key: 'feasibility',      label: 'Viabilitat',         weight: 0.20 },
  { key: 'resources',        label: 'Recursos',           weight: 0.10 },
  { key: 'time',             label: 'Temps',              weight: 0.10 },
  { key: 'innovation',       label: 'Innovació',          weight: 0.10 },
  { key: 'strategy',         label: 'Estratègia',         weight: 0.05 },
]

export const AI_ACTIONS = [
  { id: 'generate_ideas',    icon: '💡', label: 'Generar idees',           desc: 'Propostes per al projecte seleccionat' },
  { id: 'risk_detect',       icon: '⚠️', label: 'Detectar riscos',         desc: 'Analitza projectes en risc de bloqueig' },
  { id: 'prioritize',        icon: '🎯', label: 'Recomanar priorització',  desc: 'Ordena projectes per impacte potencial' },
  { id: 'summarize',         icon: '📝', label: 'Resumir projecte',        desc: 'Resum executiu del projecte' },
  { id: 'analyze_pilot',     icon: '🧪', label: 'Analitzar pilot',         desc: 'Interpretació de resultats del pilot' },
  { id: 'bottleneck',        icon: '🔍', label: 'Detectar colls d\'ampolla', desc: 'Fases amb major temps de bloqueig' },
]
