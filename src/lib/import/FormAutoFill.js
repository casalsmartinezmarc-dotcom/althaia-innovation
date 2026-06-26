/**
 * FormAutoFill
 * Merges mapped form values into a blank form template and produces the
 * detected-flags map used by the ImportProjectPage review UI.
 */

/**
 * @param {Record<string, string>} formValues  — output of MappingEngine.mapToForm
 * @param {Record<string, string>} emptyForm   — the blank form template
 * @returns {{ newForm: Record<string, string>, flags: Record<string, boolean> }}
 */
export function autoFill(formValues, emptyForm) {
  const newForm = { ...emptyForm }
  const flags   = {}

  for (const [key, value] of Object.entries(formValues)) {
    if (value !== undefined && String(value).trim().length > 0) {
      newForm[key] = String(value).trim()
      flags[key]   = true
    }
  }

  return { newForm, flags }
}
