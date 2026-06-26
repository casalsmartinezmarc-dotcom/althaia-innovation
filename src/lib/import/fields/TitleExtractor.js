import { matchText } from '../TextParser.js'

export const FIELD_KEY = 'title'

export function extract({ text, lines }) {
  // 1. Etiqueta explícita
  const labeled = matchText(text,
    '(?:títol del repte|títol de la innovació|títol del projecte|nom del projecte|títol)[:\\s]+([^\\n]{3,100})')
  if (labeled) return labeled

  // 2. Línia en MAJÚSCULES (nom propi, ex: CAREVERSE)
  const upperLine = lines.find(l =>
    l.length >= 3 && l.length <= 60 &&
    l === l.toUpperCase() &&
    /[A-Z]/.test(l) &&
    !/^[0-9\s\-*•⸻─—↓✔]+$/.test(l)
  )
  if (upperLine) {
    // Afegeix subtítol si existeix just a sota
    const idx  = lines.indexOf(upperLine)
    const next = lines[idx + 1]
    if (next && next.length > 10 && next.length <= 120 && next !== next.toUpperCase()) {
      return `${upperLine} — ${next}`
    }
    return upperLine
  }

  // 3. Primera línia substancial
  return lines.find(l => l.length >= 8 && l.length <= 100 && !/^[#\-*•⸻]/.test(l)) || ''
}
