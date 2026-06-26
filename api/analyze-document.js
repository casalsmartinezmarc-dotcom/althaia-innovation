/**
 * Vercel Serverless Function — /api/analyze-document
 *
 * Rep el text d'un document i usa Gemini 2.0 Flash per extreure
 * els camps estructurats del formulari d'importació.
 *
 * POST { text: string }
 * → 200 { fields: { title, service, ... } }
 * → 500 { error: string }
 */

const GEMINI_MODEL   = 'gemini-2.0-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const MAX_TEXT_CHARS  = 40_000   // ~10k tokens — suficient per a qualsevol document

const PROMPT = `Ets un extractor d'informació especialitzat en projectes d'innovació hospitalària.
Analitza el document de l'Hospital Althaia (Manresa, Catalunya) i extreu els camps indicats.
Respon ÚNICAMENT amb un objecte JSON vàlid i sense cap text addicional fora del JSON.

CAMPS A EXTREURE (string; "" si no es troba al document):
- title              : Títol del projecte o necessitat detectada
- service            : Servei clínic o departament afectat
- owner_name         : Nom del responsable o referent
- problem_description: Descripció del problema o necessitat (2-5 frases)
- beneficiary_profile: Perfil dels beneficiaris (pacients, professionals, etc.)
- recurrence         : Freqüència i volum del problema
- existing_alternatives: Solucions actuals i per què no son suficients
- objectives         : Objectius específics i resultats esperats (llista si cal)
- hypotheses         : Hipòtesi principal que es vol verificar
- indicators         : Indicadors de mesura / KPIs principals
- success_criteria   : Llindars d'èxit i criteris de validació
- test_protocol      : Protocol de proves o cas pràctic, pas a pas
- simulation_scenarios: Escenaris de simulació o casos d'ús concrets
- budget             : Pressupost estimat (text, p.ex. "350.000 €")
- partners           : Partners, proveïdors o entitats involucrades
- resources          : Recursos necessaris (equip humà, infraestructura, dades)
- risks              : Riscos identificats i plans de mitigació
- timeline           : Calendari o fases d'implementació
- priority           : Prioritat del projecte — ÚNICAMENT "alta", "mitja" o "baixa"
- tags               : Paraules clau separades per comes (p.ex. "IA, Living Lab, Cures")
- kpis               : KPIs finals o indicadors clau de rendiment del projecte

DOCUMENT:
`

export default async function handler(req, res) {
  // CORS permissiu (mateixa origen Vercel, però per si de cas)
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const { text } = req.body ?? {}
  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return res.status(400).json({ error: 'Text massa curt o absent' })
  }

  // Truncar per evitar excedir el límit de tokens
  const truncated = text.slice(0, MAX_TEXT_CHARS)

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: PROMPT + truncated }],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature:      0.1,   // baixa creativitat → resultats consistents
          maxOutputTokens:  2048,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('[analyze-document] Gemini error:', errText)
      return res.status(502).json({ error: 'Error de la API de Gemini' })
    }

    const data   = await geminiRes.json()
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    let fields
    try {
      fields = JSON.parse(rawJson)
    } catch {
      console.error('[analyze-document] JSON invàlid de Gemini:', rawJson.slice(0, 200))
      return res.status(502).json({ error: 'Resposta invàlida de Gemini' })
    }

    return res.status(200).json({ fields })

  } catch (err) {
    console.error('[analyze-document] Error inesperat:', err)
    return res.status(500).json({ error: 'Error intern del servidor' })
  }
}
