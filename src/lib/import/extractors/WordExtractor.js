/**
 * WordExtractor — Extreu text d'un fitxer .docx (Word).
 *
 * Usa JSZip per descomprimir el .docx i llegir word/document.xml.
 * Extensible: es pot afegir suport per .odt, .rtf, etc. afegint nous extractors
 * i registrant-los a extractors/index.js sense modificar aquest fitxer.
 */

import JSZip from 'jszip'

export const WordExtractor = {
  /** Formats suportats per aquest extractor */
  supports: file => file.name.toLowerCase().endsWith('.docx'),

  /**
   * @param {File} file
   * @param {Function} [onProgress]
   * @returns {Promise<string>}
   */
  async extract(file, onProgress) {
    onProgress?.(`Llegint document Word: ${file.name}...`)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip         = await JSZip.loadAsync(arrayBuffer)
      const docXml      = zip.file('word/document.xml')
      if (!docXml) return null

      const xml = await docXml.async('string')
      return xml
        .replace(/<w:br[^>]*\/>/g, '\n')
        .replace(/<\/w:p>/g, '\n\n')
        .replace(/<\/w:tr>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    } catch (err) {
      console.error('[WordExtractor]', err)
      return null
    }
  },
}
