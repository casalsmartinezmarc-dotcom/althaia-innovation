/**
 * Pipeline
 * Single entry-point for the document import flow.
 *
 *   file | rawText
 *       ↓
 *   Extractor.extract()   (WordExtractor / PDFExtractor / TxtExtractor)
 *       ↓
 *   parseText()           (TextParser — builds { text, sections, lines })
 *       ↓
 *   runFieldExtractors()  (all FieldExtractors on the shared parsed object)
 *       ↓
 *   mapToForm()           (MappingEngine — aligns to form shape)
 *       ↓
 *   autoFill()            (FormAutoFill — merges with emptyForm)
 *       ↓
 *   { newForm, flags, rawText }
 */

import { getExtractor }        from './extractors/index.js'
import { parseText }           from './TextParser.js'
import { runFieldExtractors }  from './fields/index.js'
import { mapToForm }           from './MappingEngine.js'
import { autoFill }            from './FormAutoFill.js'

const MIN_TEXT_LENGTH = 20

/**
 * Run the full import pipeline on a File or a raw text string.
 *
 * @param {File|string}   input       - A File object or a pasted text string.
 * @param {object}        emptyForm   - The blank form template from ImportProjectPage.
 * @param {Function}      onProgress  - Optional progress callback: (message: string) => void
 * @returns {Promise<{ newForm, flags, rawText }>}
 * @throws {Error} with a user-readable Catalan message on failure.
 */
export async function runPipeline(input, emptyForm, onProgress = () => {}) {
  let rawText = ''

  // ── 1. Extract text ───────────────────────────────────────────────────────
  if (typeof input === 'string') {
    rawText = input
  } else {
    onProgress('Llegint el document...')
    const extractor = getExtractor(input)   // throws if unsupported
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
    throw new Error(
      "El text és massa curt. Enganxa el contingut complet del document."
    )
  }

  // ── 2. Parse (shared object — single pass) ───────────────────────────────
  onProgress('Analitzant l\'estructura del document...')
  const parsed = parseText(rawText)

  // ── 3. Run all field extractors ───────────────────────────────────────────
  onProgress('Detectant camps automàticament...')
  const rawFields = runFieldExtractors(parsed)

  // ── 4. Map to form shape ──────────────────────────────────────────────────
  const { formValues, detected } = mapToForm(rawFields)

  // ── 5. Merge with empty form ──────────────────────────────────────────────
  const { newForm, flags } = autoFill(formValues, emptyForm)

  return { newForm, flags, rawText }
}
