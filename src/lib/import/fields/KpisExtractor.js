import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'kpis'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    'kpi', 'mètriques', 'dashboard', 'indicadors clau',
    'motor avaluació', "motor d'avaluació",
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const kpiLines = lines
    .filter(l =>
      /(?:KPI|mètric|indicador|taxa|percentatge|%|throughput|latència|SUS|NPS|satisfacci|adopci)/i.test(l) &&
      l.length < 200
    )
    .slice(0, 8).join('\n')
  return kpiLines.slice(0, 400)
}
