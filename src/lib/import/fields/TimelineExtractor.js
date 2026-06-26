import { findSection } from '../TextParser.js'

export const FIELD_KEY = 'timeline'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, [
    'cronograma', 'calendari', 'fases', 'timeline',
    'planificació', 'temporalització', 'roadmap',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 600)

  // Match lines with month names or "setmana/mes N" patterns
  const dateLines = (
    text.match(
      /^[^\n]*(?:gener|febrer|març|abril|maig|juny|juliol|agost|setembre|octubre|novembre|desembre|Q[1-4]|T[1-4]|mes \d|setmana \d|semana \d)[^\n]*/gmi
    ) || []
  ).slice(0, 8).join('\n')

  return dateLines.slice(0, 500)
}
