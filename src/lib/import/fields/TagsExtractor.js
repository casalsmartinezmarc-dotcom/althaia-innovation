import { matchText } from '../TextParser.js'

export const FIELD_KEY = 'tags'

const KEYWORD_MAP = [
  [/bessó digital|digital twin/i,              'Bessó Digital'],
  [/intel·ligència artificial|\bIA\b|machine learning/i, 'IA'],
  [/IoT|sensor/i,                              'IoT'],
  [/living lab/i,                              'Living Lab'],
  [/cuidador|cures/i,                          'Cures'],
  [/simulaci/i,                                'Simulació'],
  [/robòtic/i,                                 'Robòtica'],
  [/salut|clínic|assistencial/i,               'Salut'],
  [/FHIR|HL7|interoperabilitat/i,              'Interoperabilitat'],
  [/predicci|predictiv/i,                      'IA Predictiva'],
  [/blockchain/i,                              'Blockchain'],
  [/telemedecina|telemedicina/i,               'Telemedecina'],
  [/wearable/i,                                'Wearables'],
]

export function extract({ text }) {
  const explicit = matchText(text,
    '(?:etiquetes|paraules clau|tags|keywords|àmbits temàtics)[:\\s]+([^\\n]{3,150})')
  if (explicit) return explicit

  const kws = KEYWORD_MAP
    .filter(([pattern]) => pattern.test(text))
    .map(([, label]) => label)

  return kws.join(', ')
}
