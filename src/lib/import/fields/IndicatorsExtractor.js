import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'indicators'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    "motor d'avaluació", 'dashboard executiu', 'indicadors', 'kpi',
    'mètriques', 'motor avaluació', 'dashboard',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const dashLines = lines
    .filter(l => /(?:KPI|indicador|mètric|disponibilitat|latència|SUS|NPS|satisfacci)/i.test(l))
    .slice(0, 10).join('\n')
  return dashLines.slice(0, 500)
}
