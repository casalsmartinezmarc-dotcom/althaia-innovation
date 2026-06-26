import { findSection, matchText } from '../TextParser.js'

export const FIELD_KEY = 'problem_description'

export function extract({ text, sections }) {
  // 1. Seccions semàntiques de "la idea" o "context"
  const fromSec = findSection(sections, [
    'la idea', 'el problema', 'problema', 'context', 'introducció',
    'motivació', 'resum executiu', 'antecedents', 'justificació',
  ])
  if (fromSec.length > 40) return fromSec.slice(0, 1000)

  // 2. Etiqueta explícita multi-línia
  const labeled = matchText(text,
    '(?:descripció del problema|descripció de la necessitat|problema detectat|necessitat detectada)[:\\s]*\\n?([\\s\\S]{30,1000}?)(?=\\n\\n)')
  if (labeled.length > 40) return labeled.slice(0, 1000)

  // 3. Primer paràgraf llarg (>80 chars)
  const para = text.split(/\n{2,}/).find(p => p.trim().length > 80)
  return para?.trim().slice(0, 1000) || ''
}
