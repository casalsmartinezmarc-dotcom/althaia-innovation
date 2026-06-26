/**
 * PDFExtractor — Extreu text d'un fitxer .pdf.
 *
 * Estratègia en dos nivells:
 *   1. pdfjs-dist → extreu text de PDFs nadius (text seleccionable)
 *   2. OCRService (Tesseract.js) → fallback per PDFs escanejats/imatge
 *
 * Extensible: es pot substituir qualsevol dels dos nivells sense modificar
 * el Pipeline ni cap altre extractor.
 */

const PDFJS_WORKER_CDN =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs'

export const PDFExtractor = {
  supports: file => file.name.toLowerCase().endsWith('.pdf'),

  /**
   * @param {File} file
   * @param {Function} [onProgress]
   * @returns {Promise<string>}
   */
  async extract(file, onProgress) {
    onProgress?.(`Llegint PDF: ${file.name}...`)

    try {
      // ── Nivell 1: extracció de text via pdfjs-dist ───────────────────────
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN

      const arrayBuffer = await file.arrayBuffer()
      const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ''
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        onProgress?.(`Llegint pàgina ${pageNum} de ${pdf.numPages}...`)
        const page        = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText    = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + '\n'
      }

      fullText = fullText.trim()

      // Si s'ha extret text suficient → retornem
      if (fullText.length > 100) {
        return fullText
      }

      // ── Nivell 2: fallback OCR (PDF escanejat / imatge) ──────────────────
      onProgress?.('PDF sense text seleccionable — aplicant OCR...')
      return await this._ocrPDF(file, onProgress)

    } catch (err) {
      console.error('[PDFExtractor] Error pdfjs:', err)
      // Fallback a OCR directe si pdfjs falla
      try {
        return await this._ocrPDF(file, onProgress)
      } catch (ocrErr) {
        console.error('[PDFExtractor] Error OCR:', ocrErr)
        return null
      }
    }
  },

  /**
   * Renderitza cada pàgina del PDF a canvas i aplica OCR.
   * @private
   */
  async _ocrPDF(file, onProgress) {
    const { recognizeImage } = await import('../OCRService.js')
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN

    const arrayBuffer = await file.arrayBuffer()
    const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText      = ''

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(`OCR pàgina ${pageNum} de ${pdf.numPages}...`)

      const page     = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2 }) // escala 2× per millor OCR
      const canvas   = document.createElement('canvas')
      canvas.width   = viewport.width
      canvas.height  = viewport.height

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport,
      }).promise

      const pageText = await recognizeImage(canvas, onProgress)
      fullText += pageText + '\n'
    }

    return fullText.trim()
  },
}
