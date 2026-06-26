import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'test_protocol'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, [
    'cas pràctic', 'protocol', 'metodologia', 'procés',
    'fases', 'circuit', 'amb careverse', 'pas a pas',
  ])
  if (fromSec.length > 30) return fromSec.slice(0, 800)

  const stepsMatch = text.match(/((?:^\d+\s+[^\n]+\n?(?:↓\n?)?){2,})/m)
  if (stepsMatch) return stepsMatch[1].trim().slice(0, 800)

  return ''
}
