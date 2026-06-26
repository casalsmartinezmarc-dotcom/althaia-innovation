import { findSection, matchText } from '../TextParser.js'

export const FIELD_KEY = 'budget'

export function extract({ text, sections }) {
  const fromSec = findSection(sections, [
    'pressupost', 'cost', 'inversió', 'finançament',
    'recursos econòmics', 'econòmic',
  ])
  if (fromSec.length > 5) return fromSec.slice(0, 300)

  const labeled = matchText(text,
    /(?:pressupost|cost estimat|inversió total|budget)[:\s]+([^\n]{3,200})/i)
  if (labeled) return labeled

  // Grab any currency or number with € or k€
  const moneyLines = text
    .split('\n')
    .filter(l => /(?:\d[\d.,]* *[k€]|€ *\d|k€)/i.test(l))
    .slice(0, 3).join('\n')
  return moneyLines.slice(0, 200)
}
