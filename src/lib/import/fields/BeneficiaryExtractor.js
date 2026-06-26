import { findSection, findAllSections } from '../TextParser.js'

export const FIELD_KEY = 'beneficiary_profile'

export function extract({ sections, lines }) {
  const fromSec = findSection(sections, [
    'beneficiaris', 'usuaris finals', "perfil d'usuari",
    'a qui va dirigit', 'persona', 'assistència',
  ])
  if (fromSec.length > 10) return fromSec.slice(0, 500)

  const actorSec = findAllSections(sections, ['nivell 1', 'nivell 4', 'persona', 'assistència'])
  if (actorSec.length > 10) return actorSec.slice(0, 500)

  const actorLines = lines
    .filter(l => /(?:persona|habitatge|cuidador|infermeri|treball social|familiar|pacient|resident|usuari)/i.test(l))
    .slice(0, 10).join('\n')
  return actorLines.slice(0, 500)
}
