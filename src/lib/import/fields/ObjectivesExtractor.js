import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'objectives'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, [
    'resultats', 'objectius', 'metes', 'el projecte permetria',
    'objectiu general', 'objectiu específic', 'finalitat',
  ])
  if (fromSec.length > 30) return fromSec.slice(0, 1000)

  const bMatch = text.match(
    /(?:el projecte permetria|resultats esperats?|objectius?)\s*[:\n]\s*((?:[*•\-]\s+[^\n]+\n?){2,})/i)
  return bMatch?.[1]?.trim().slice(0, 1000) || ''
}
