import CryptoJS from 'crypto-js'

const KEY = import.meta.env.VITE_ENCRYPTION_KEY

// Prefix que identifica un valor encriptat (distingeix de text pla existent)
const ENC = 'ENC§'

export const encryptionEnabled = Boolean(KEY)

// ─── Text ──────────────────────────────────────────────────────────────────────

export function encryptText(value) {
  if (!encryptionEnabled || value === null || value === undefined || value === '') return value
  const str = String(value)
  if (str.startsWith(ENC)) return str  // ja encriptat
  return ENC + CryptoJS.AES.encrypt(str, KEY).toString()
}

export function decryptText(value) {
  if (!value || typeof value !== 'string') return value
  if (!value.startsWith(ENC)) return value  // text pla (compatibilitat enrere)
  try {
    const bytes = CryptoJS.AES.decrypt(value.slice(ENC.length), KEY)
    return bytes.toString(CryptoJS.enc.Utf8) || value
  } catch { return value }
}

// ─── JSON (camps JSONB de Supabase) ───────────────────────────────────────────

export function encryptJSON(obj) {
  if (!encryptionEnabled || obj === null || obj === undefined) return obj
  if (typeof obj === 'object' && obj !== null && 'enc' in obj) return obj  // ja encriptat
  try {
    return { enc: CryptoJS.AES.encrypt(JSON.stringify(obj), KEY).toString() }
  } catch { return obj }
}

export function decryptJSON(value) {
  if (!value) return value
  // Objecte encriptat: { enc: "..." }
  if (typeof value === 'object' && value !== null && typeof value.enc === 'string') {
    try {
      const bytes = CryptoJS.AES.decrypt(value.enc, KEY)
      const str   = bytes.toString(CryptoJS.enc.Utf8)
      return str ? JSON.parse(str) : value
    } catch { return value }
  }
  return value  // ja era JSON pla (compatibilitat enrere)
}
