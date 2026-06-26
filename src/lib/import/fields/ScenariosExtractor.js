import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'simulation_scenarios'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    'escenaris', 'simulació', 'cas pràctic', 'sistema territorial',
    "nivell 5", "cas d'ús",
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const scenarioLines = lines
    .filter(l => /(?:arriba|suposem|imaginem|escenari|cas:|si una empresa|si un pacient)/i.test(l))
    .slice(0, 5).join('\n')
  return scenarioLines.slice(0, 500)
}
