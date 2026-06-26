import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'recurrence'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, [
    'intensitat', 'recurrència', 'freqüència', 'volum', 'abast',
    'sistema territorial', 'nivell 5',
  ])
  if (fromSec.length > 5) return fromSec.slice(0, 300)

  const scaleMatch = text.match(/([\d.,]+ (?:habitatges?|pacients?|persones?|usuaris?)[^\n.]*)/gi)
  if (scaleMatch) return scaleMatch.slice(0, 5).join(' · ').slice(0, 300)

  return ''
}
