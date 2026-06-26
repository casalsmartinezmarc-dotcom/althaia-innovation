import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'hypotheses'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, ['hipòtesi', 'hipòtesis', 'premissa', 'assumpcions', 'lema'])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const quoteMatch = text.match(/["«"]([^"»"\n]{20,300})["»"]/i)
  if (quoteMatch) return `"${quoteMatch[1].trim()}"`

  const ifMatch = text.match(/(?:si |before |abans de )[^\n.]{20,200}/i)
  return ifMatch?.[0]?.trim().slice(0, 500) || ''
}
