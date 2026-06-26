import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'resources'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    'recursos', 'infraestructura', 'tecnologia', 'eines',
    'capacitats', 'equip necessari', 'material',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const resourceLines = lines
    .filter(l =>
      /(?:servidor|llicència|dispositiu|tablet|hardware|software|espai|sala|personal|tècnic|recurso)/i.test(l) &&
      l.length < 150
    )
    .slice(0, 6).join('\n')
  return resourceLines.slice(0, 400)
}
