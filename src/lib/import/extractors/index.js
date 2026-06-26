/**
 * Registre d'extractors de fitxers.
 *
 * Per afegir suport per a un nou format (ex: .odt, .rtf, .xlsx):
 *   1. Crea un nou fitxer OdtExtractor.js seguint la mateixa interfície
 *      ({ supports(file): boolean, extract(file, onProgress): Promise<string> })
 *   2. Importa'l aquí i afegeix-lo a EXTRACTORS
 *   → Cap altre fitxer del sistema s'ha de modificar.
 */

import { WordExtractor } from './WordExtractor.js'
import { PDFExtractor  } from './PDFExtractor.js'
import { TxtExtractor  } from './TxtExtractor.js'

/** Llista ordenada d'extractors. S'usa el primer que accepti el fitxer. */
const EXTRACTORS = [
  WordExtractor,
  PDFExtractor,
  TxtExtractor,
]

/** Extensions acceptades (per a validació UI). */
export const ACCEPTED_EXTENSIONS = ['.docx', '.pdf', '.txt']

/**
 * Retorna l'extractor adequat per al fitxer donat.
 * @throws {Error} si cap extractor accepta el fitxer
 */
export function getExtractor(file) {
  const extractor = EXTRACTORS.find(e => e.supports(file))
  if (!extractor) {
    throw new Error(
      `Format no suportat: ${file.name}. Formats acceptats: ${ACCEPTED_EXTENSIONS.join(', ')}`
    )
  }
  return extractor
}

/**
 * Comprova si un fitxer té un format suportat (sense llançar error).
 */
export function isSupported(file) {
  return EXTRACTORS.some(e => e.supports(file))
}
