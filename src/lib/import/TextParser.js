/**
 * TextParser — Única font de veritat per a l'estructura del document.
 *
 * Responsabilitat: convertir text pla en una representació estructurada
 * { text, sections, lines } que tots els FieldExtractors consumiran.
 *
 * Es crida UNA SOLA vegada per document; el resultat es comparteix.
 */

/**
 * Divideix el text en seccions { heading, headingRaw, content }.
 * Reconeix separadors: ⸻ ─ — --- *** i títols de secció implícits
 * (línies curtes soles seguides de contingut).
 */
export function parseSections(text) {
  const rawParts = text.split(/\n[⸻─—\-]{2,}\n/g)
  const sections = []

  rawParts.forEach(part => {
    const trimmed = part.trim()
    if (!trimmed) return

    const lines = trimmed.split('\n')
    let currentHeading = ''
    let currentContent = []

    lines.forEach((line, i) => {
      const t = line.trim()
      const isHeadingCandidate =
        t.length > 0 && t.length <= 70 &&
        !t.startsWith('*') && !t.startsWith('•') &&
        !t.startsWith('-') && !t.startsWith('↓') &&
        !/^\d+\s/.test(t)
      const nextHasContent = lines.slice(i + 1, i + 4).some(l => l.trim().length > 5)

      if (isHeadingCandidate && nextHasContent && i > 0) {
        if (currentContent.length > 0) {
          sections.push({
            heading:    currentHeading.toLowerCase().trim(),
            headingRaw: currentHeading.trim(),
            content:    currentContent.join('\n').trim(),
          })
        }
        currentHeading = t
        currentContent = []
      } else {
        currentContent.push(line)
      }
    })

    if (currentContent.join('').trim().length > 0) {
      sections.push({
        heading:    currentHeading.toLowerCase().trim(),
        headingRaw: currentHeading.trim(),
        content:    currentContent.join('\n').trim(),
      })
    }
  })

  return sections
}

/**
 * Retorna el contingut de la primera secció que coincideixi amb alguna keyword.
 */
export function findSection(sections, keywords) {
  for (const kw of keywords) {
    const kwl = kw.toLowerCase()
    const found = sections.find(s => s.heading.includes(kwl) || s.heading === kwl)
    if (found && found.content.trim().length > 5) return found.content.trim()
  }
  return ''
}

/**
 * Retorna el contingut de totes les seccions que coincideixin.
 */
export function findAllSections(sections, keywords) {
  const results = []
  for (const kw of keywords) {
    const kwl = kw.toLowerCase()
    sections
      .filter(s => s.heading.includes(kwl))
      .forEach(s => { if (s.content.trim()) results.push(s.content.trim()) })
  }
  return results.join('\n\n')
}

/**
 * Cerca un patró regex al text i retorna el primer grup de captura.
 */
export function matchText(text, pattern) {
  const m = text.match(new RegExp(pattern, 'i'))
  return m?.[1]?.trim() || ''
}

/**
 * Punt d'entrada principal: converteix text pla en la representació compartida.
 * Retorna { text, sections, lines } — s'ha de processar UNA VEGADA per document.
 */
export function parseText(rawText) {
  const text     = rawText || ''
  const sections = parseSections(text)
  const lines    = text.split('\n').map(l => l.trim()).filter(Boolean)
  return { text, sections, lines }
}
