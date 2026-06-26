/**
 * Pipeline — punt d'entrada únic del flux d'importació.
 *
 * Estratègia en dos nivells:
 *   1. Gemini AI  → /api/analyze-document  (necessita GEMINI_API_KEY al backend)
 *   2. FieldExtractors (regex/patrons)      (fallback offline sempre disponible)
 *
 *   file | rawText
 *       ↓
 *   Extractor.extract()      (WordExtractor / PDFExtractor / TxtExtractor)
 *       ↓
 *   parseText()              (TextParser — { text, sections, lines })
 *       ↓
 *   [Gemini API] o [runFieldExtractors()]
 *       ↓
 *   mapToForm() + autoFill()
 *       ↓
 *   { newForm, flags, rawText, usedAI }
 */

import { getExtractor }        from './extractors/index.js'
import { parseText }           from './TextParser.js'
import { runFieldExtractors }  from './fields/index.js'
import { mapToForm }           from './MappingEngine.js'
import { autoFill }            from './FormAutoFill.js'

const MIN_TEXT_LENGTH    = 20
const ANALYZE_API        = '/api/analyze-document'

// ─── Nivell 1: extracció via Gemini AI ────────────────────────────────────────
async function analyzeWithGemini(text, onProgress) {
  onProgress('Intel·ligència artificial analitzant el document...')
  const res = await fetch(ANALYZE_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text }),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}))
    throw new Error(error || `HTTP ${res.status}`)
  }

  const { fields } = await res.json()
  if (!fields || typeof fields !== 'object') {
    throw new Error('Resposta inesperada de la IA')
  }
  return fields
}

// ─── Nivell 2: extracció local (regex / patrons) ──────────────────────────────
function analyzeWithExtractors(parsed, onProgress) {
  onProgress('Detectant camps amb el motor local...')
  return runFieldExtractors(parsed)
}

// ─── Entrada pública ──────────────────────────────────────────────────────────
/**
 * @param {File|string}   input      - Fitxer o text enganxat manualment
 * @param {object}        emptyForm  - Plantilla de formulari en blanc
 * @param {Function}      onProgress - Callback de progrés: (msg: string) => void
 * @returns {Promise<{ newForm, flags, rawText, usedAI: boolean }>}
 */
export async function runPipeline(input, emptyForm, onProgress = () => {}) {
  let rawText = ''

  // ── 1. Extraure text del fitxer ─────────────────────────────────────────────
  if (typeof input === 'string') {
    rawText = input
  } else {
    onProgress('Llegint el document...')
    const extractor = getExtractor(input)
    const extracted = await extractor.extract(input, msg => onProgress(msg))

    if (!extracted || extracted.trim().length < MIN_TEXT_LENGTH) {
      throw new Error(
        "No s'ha pogut extreure text del fitxer. " +
        "Prova d'enganxar el text manualment."
      )
    }
    rawText = extracted
  }

  if (rawText.trim().length < MIN_TEXT_LENGTH) {
    throw new Error('El text és massa curt. Enganxa el contingut complet del document.')
  }

  // ── 2. Parse compartit (una sola passada) ───────────────────────────────────
  onProgress("Processant l'estructura del document...")
  const parsed = parseText(rawText)

  // ── 3. Extracció de camps: Gemini primer, FieldExtractors de fallback ────────
  let rawFields
  let usedAI = false

  try {
    rawFields = await analyzeWithGemini(rawText, onProgress)
    usedAI    = true
  } catch (err) {
    console.warn('[Pipeline] Gemini no disponible, usant extractor local:', err.message)
    onProgress('Analitzant amb el motor local...')
    rawFields = analyzeWithExtractors(parsed, onProgress)
  }

  // ── 4. Mapatge i fusió amb formulari ────────────────────────────────────────
  const { formValues, detected } = mapToForm(rawFields)
  const { newForm, flags }       = autoFill(formValues, emptyForm)

  return { newForm, flags, rawText, usedAI }
}
