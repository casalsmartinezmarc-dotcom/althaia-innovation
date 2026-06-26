import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'success_criteria'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, [
    "llindars d'èxit", "criteris d'èxit", "condicions d'èxit",
    'per què crec', 'alineat', 'criteris institucionals',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const tableMatch = text.match(/(Necessitat real[\s\S]{10,600}?Escalabilitat[^\n]*)/i)
  if (tableMatch) return tableMatch[1].trim().slice(0, 500)

  return ''
}
