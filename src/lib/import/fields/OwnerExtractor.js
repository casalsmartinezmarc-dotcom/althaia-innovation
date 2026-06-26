import { matchText } from '../TextParser.js'

export const FIELD_KEY = 'owner_name'

export function extract({ text }) {
  return matchText(text,
    '(?:responsable del projecte|responsable|referent clínic|referent|autor principal|investigador principal)[:\\s]+([^\\n]{2,80})')
}
