/**
 * MappingEngine
 * Takes the raw { FIELD_KEY → string } map produced by runFieldExtractors
 * and returns a { formValues, detected } pair that matches ImportProjectPage's
 * form state shape.
 */

const FORM_KEYS = [
  'title', 'service', 'owner_name', 'problem_description',
  'beneficiary_profile', 'recurrence', 'existing_alternatives',
  'objectives', 'hypotheses', 'indicators', 'success_criteria',
  'test_protocol', 'simulation_scenarios',
  'budget', 'partners', 'resources', 'risks', 'timeline',
  'priority', 'tags', 'kpis',
]

/**
 * @param {Record<string, string>} rawFields  — output of runFieldExtractors
 * @returns {{ formValues: Record<string, string>, detected: Record<string, boolean> }}
 */
export function mapToForm(rawFields) {
  const formValues = {}
  const detected   = {}

  for (const key of FORM_KEYS) {
    const raw = rawFields[key]
    if (raw && String(raw).trim().length > 0) {
      formValues[key] = String(raw).trim()
      detected[key]   = true
    }
  }

  // Guarantee a valid priority default
  if (!formValues.priority || !['alta', 'mitja', 'baixa'].includes(formValues.priority)) {
    formValues.priority = rawFields.priority ?? 'mitja'
    if (!['alta', 'mitja', 'baixa'].includes(formValues.priority)) {
      formValues.priority = 'mitja'
    }
  }

  // 'kpis' field falls back to indicators when empty (mirrors old logic)
  if (!formValues.kpis && formValues.indicators && formValues.indicators.length > 20) {
    formValues.kpis   = formValues.indicators
    detected.kpis     = detected.indicators
  }

  return { formValues, detected }
}
