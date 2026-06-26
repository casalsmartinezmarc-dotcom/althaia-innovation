import { matchText } from '../TextParser.js'

export const FIELD_KEY = 'priority'

const MAP = { alta: 'alta', high: 'alta', mitja: 'mitja', mitjana: 'mitja', medium: 'mitja', baixa: 'baixa', low: 'baixa' }

export function extract({ text }) {
  const explicit = matchText(text, '(?:prioritat|priority)[:\\s]*(alta|mitja|mitjana|baixa|high|medium|low)')
  if (explicit) return MAP[explicit.toLowerCase()] || 'mitja'
  if (/projecte tractor|tractor|insígnia|referent europeu/i.test(text)) return 'alta'
  return 'mitja'
}
