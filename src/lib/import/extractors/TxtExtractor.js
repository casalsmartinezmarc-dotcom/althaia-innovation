/**
 * TxtExtractor — Extreu text d'un fitxer .txt o text/plain.
 *
 * Usa l'API nativa FileReader del navegador.
 */

export const TxtExtractor = {
  supports: file =>
    file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain',

  /**
   * @param {File} file
   * @param {Function} [onProgress]
   * @returns {Promise<string>}
   */
  extract(file, onProgress) {
    onProgress?.(`Llegint fitxer de text: ${file.name}...`)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = e => resolve(e.target.result || '')
      reader.onerror = () => reject(new Error('Error llegint el fitxer de text'))
      reader.readAsText(file, 'UTF-8')
    })
  },
}
