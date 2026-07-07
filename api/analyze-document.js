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

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest']
const MAX_TEXT_CHARS  = 40_000   // ~10k tokens — suficient per a qualsevol document

const PROMPT = `Ets un expert en innovació hospitalària i redacció de projectes sanitaris.
Analitza el document de l'Hospital Althaia (Manresa, Catalunya) i genera una versió estructurada i millorada del contingut per a cada camp del formulari.

INSTRUCCIONS IMPORTANTS:
- NO copïis literalment el text del document. Reescriu i sintetitza la informació.
- Usa un estil professional, clar i orientat a projectes d'innovació sanitària.
- Organitza la informació de manera lògica i coherent.
- Si un camp té múltiples elements, usa format de llista amb "• " davant de cada punt.
- Resumeix si la informació és excessivament llarga (màxim 300 paraules per camp).
- Escriu sempre en català. Si el document és en castellà o anglès, tradueix.
- Si no hi ha informació suficient per a un camp, retorna "".
- Respon ÚNICAMENT amb un objecte JSON vàlid, sense cap text fora del JSON.

CAMPS A GENERAR (string; "" si no hi ha informació):
- title              : Títol concís i descriptiu del projecte (màxim 10 paraules)
- service            : Servei clínic o departament afectat (nom oficial del servei)
- owner_name         : Nom i càrrec del responsable o referent
- problem_description: Descripció clara del problema o necessitat, explicant el context clínic, l'impacte actual i per què cal una solució (3-5 frases ben construïdes)
- beneficiary_profile: Perfil detallat dels beneficiaris: qui són, quantes persones, en quins contextos
- recurrence         : Freqüència, volum i patró del problema (quantes vegades, quants pacients, en quines circumstàncies)
- existing_alternatives: Quines solucions s'utilitzen ara, per què no son suficients i quin és el gap que queda per cobrir
- objectives         : Llista d'objectius específics i mesurables del projecte (format • objectiu)
- hypotheses         : Hipòtesi principal formulada com "Si [acció] → llavors [resultat esperat] → perquè [raonament]"
- indicators         : Llista d'indicadors concrets que es mesuraran per avaluar el projecte (format • indicador: descripció)
- success_criteria   : Llista de criteris mínims d'èxit per considerar el projecte viable (format • criteri)
- test_protocol      : Descripció pas a pas de com es durà a terme el pilot o prova (fases numerades)
- simulation_scenarios: Casos d'ús concrets que es validaran durant el pilot (format • escenari)
- budget             : Pressupost estimat desglossat per conceptes si és possible (format • concepte: import)
- partners           : Llista d'entitats, proveïdors o col·laboradors involucrats i el seu rol (format • entitat: rol)
- resources          : Recursos necessaris organitzats per categoria: equip humà, infraestructura i dades (format • categoria: detall)
- risks              : Riscos principals identificats amb el seu impacte i pla de mitigació (format • risc: impacte → mitigació)
- timeline           : Fases d'implementació amb durada estimada (format • Fase N [durada]: descripció)
- priority           : Prioritat del projecte — ÚNICAMENT "alta", "mitja" o "baixa"
- tags               : Paraules clau separades per comes (p.ex. "IA, Living Lab, Cures")
- kpis               : KPIs finals del projecte amb target quantitatiu si és possible (format • KPI: target)

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

  const body = JSON.stringify({
    contents: [{ parts: [{ text: PROMPT + truncated }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 4096 },
  })

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  let lastError = ''
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
          body,
        })

        if (!geminiRes.ok) {
          const errText = await geminiRes.text()
          lastError = `${model} ${geminiRes.status}: ${errText.slice(0, 200)}`
          if (geminiRes.status === 503 && attempt === 0) { await sleep(1500); continue }
          break
        }

        const data    = await geminiRes.json()
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        let fields
        try { fields = JSON.parse(rawJson) } catch {
          lastError = `JSON invàlid de ${model}`
          break
        }
        return res.status(200).json({ fields })

      } catch (fetchErr) {
        lastError = fetchErr.message
        break
      }
    }
  }

  return res.status(502).json({ error: `Tots els models han fallat: ${lastError}` })
}
