/**
 * OCRService — Wrapper sobre Tesseract.js.
 *
 * Càrrega lazy (dynamic import) per no incloure Tesseract al bundle principal.
 * Singleton de worker per reutilitzar-lo entre pàgines d'un mateix document.
 *
 * Extensible: es pot substituir Tesseract per qualsevol altre motor OCR
 * canviant ÚNICAMENT aquest fitxer.
 */

let _worker = null

async function getWorker(onProgress) {
  if (_worker) return _worker

  const { createWorker } = await import('tesseract.js')

  _worker = await createWorker(['cat', 'spa', 'eng'], 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        onProgress?.(`OCR: ${Math.round(m.progress * 100)}%`)
      }
    },
  })

  return _worker
}

/**
 * Allibera el worker (crida quan l'usuari abandona la pàgina o tanca la sessió).
 */
export async function terminateOCR() {
  if (_worker) {
    await _worker.terminate()
    _worker = null
  }
}

/**
 * Reconeix text en una imatge (HTMLCanvasElement | HTMLImageElement | Blob | URL).
 *
 * @param {*} imageSource - Font d'imatge compatible amb Tesseract
 * @param {Function} [onProgress] - Callback (missatge: string)
 * @returns {Promise<string>} Text extret
 */
export async function recognizeImage(imageSource, onProgress) {
  try {
    onProgress?.('Inicialitzant motor OCR (Tesseract.js)...')
    const worker = await getWorker(onProgress)
    onProgress?.('Processant imatge amb OCR...')
    const { data: { text } } = await worker.recognize(imageSource)
    return text || ''
  } catch (err) {
    console.error('[OCRService] Error:', err)
    return ''
  }
}
