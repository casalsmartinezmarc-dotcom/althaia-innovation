import { matchText } from '../TextParser.js'

export const FIELD_KEY = 'service'

export function extract({ text }) {
  return matchText(text,
    '(?:servei afectat|servei clínic|servei|departament|unitat clínica|àrea)[:\\s]+([^\\n]{2,80})')
}
