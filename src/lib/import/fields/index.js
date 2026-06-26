import * as Title        from './TitleExtractor.js'
import * as Service      from './ServiceExtractor.js'
import * as Owner        from './OwnerExtractor.js'
import * as Problem      from './ProblemExtractor.js'
import * as Beneficiary  from './BeneficiaryExtractor.js'
import * as Recurrence   from './RecurrenceExtractor.js'
import * as Alternatives from './AlternativesExtractor.js'
import * as Priority     from './PriorityExtractor.js'
import * as Tags         from './TagsExtractor.js'
import * as Objectives   from './ObjectivesExtractor.js'
import * as Hypotheses   from './HypothesesExtractor.js'
import * as Indicators   from './IndicatorsExtractor.js'
import * as SuccessCriteria from './SuccessCriteriaExtractor.js'
import * as TestProtocol from './TestProtocolExtractor.js'
import * as Scenarios    from './ScenariosExtractor.js'
import * as Budget       from './BudgetExtractor.js'
import * as Partners     from './PartnersExtractor.js'
import * as Resources    from './ResourcesExtractor.js'
import * as Risks        from './RisksExtractor.js'
import * as Timeline     from './TimelineExtractor.js'
import * as Kpis         from './KpisExtractor.js'

/** All registered field extractors in priority order */
const EXTRACTORS = [
  Title, Service, Owner, Problem, Beneficiary,
  Recurrence, Alternatives, Priority, Tags,
  Objectives, Hypotheses, Indicators, SuccessCriteria,
  TestProtocol, Scenarios, Budget, Partners,
  Resources, Risks, Timeline, Kpis,
]

/**
 * Run all field extractors on a shared parsed-text object.
 * @param {{ text: string, sections: object, lines: string[] }} parsed
 * @returns {Record<string, string>}  fieldKey → extracted value
 */
export function runFieldExtractors(parsed) {
  const result = {}
  for (const extractor of EXTRACTORS) {
    try {
      const value = extractor.extract(parsed)
      if (value && typeof value === 'string' && value.trim()) {
        result[extractor.FIELD_KEY] = value.trim()
      }
    } catch (err) {
      console.warn(`[FieldExtractor] ${extractor.FIELD_KEY} failed:`, err)
    }
  }
  return result
}
