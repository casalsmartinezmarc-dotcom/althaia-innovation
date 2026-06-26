import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'partners'

export function extract({ text, sections, lines }) {
  const fromSec = findSection(sections, [
    'actors', 'partners', 'col·laboradors', 'stakeholders',
    'aliats', 'entitats', 'participants', 'involucrats',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  // Lines that look like org/institution names (contains capital first word + common suffixes)
  const orgLines = lines
    .filter(l =>
      /(?:Hospital|Ajuntament|Universitat|Institut|Consorci|Associació|Fundació|Empresa|SL|SA|S\.L\.|S\.A\.)/i.test(l) &&
      l.length < 120
    )
    .slice(0, 8).join('\n')
  if (orgLines.length > 5) return orgLines

  // Table-like rows: Name | Role
  const tableRows = (text.match(/^[A-ZÁÀÉÈÍÏÓÒÚÜ][^\n|]{5,80}\s*\|[^\n]{5,80}$/gm) || [])
    .slice(0, 5).join('\n')
  return tableRows.slice(0, 400)
}
