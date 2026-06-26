import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'risks'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    'riscos', 'riscs', 'barriers', 'barreres', 'limitacions',
    'desafiaments', 'obstacles', 'reptes', 'dificultats',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const riskLines = lines
    .filter(l =>
      /(?:risc|barrera|limitació|obstacle|dificultat|desafiament|poc adoptat|resistència|privacitat|RGPD|seguretat)/i.test(l) &&
      l.length < 200
    )
    .slice(0, 6).join('\n')
  return riskLines.slice(0, 400)
}
