import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'existing_alternatives'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    'per què és diferencial', 'alternatives', 'situació actual',
    'avui', 'context actual', 'per què', 'diferencial',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 400)

  const actLines = lines
    .filter(l => /^(?:actualment|avui|fins ara|la majoria|molts)/i.test(l))
    .slice(0, 5).join('\n')
  return actLines.slice(0, 400)
}
