export const STEPS = ['age', 'tenure', 'monthlyCharges', 'contract', 'internetService', 'paymentDelay']

export const STEP_CONFIG = {
  age: {
    label: 'What is the customer\'s age?',
    type: 'number',
    min: 0,
    max: 120,
    required: true,
  },
  tenure: {
    label: 'How many months has the customer been with us?',
    type: 'number',
    min: 0,
    max: 120,
    required: true,
  },
  monthlyCharges: {
    label: 'What are the monthly charges?',
    type: 'number',
    min: 0,
    max: 1000,
    required: true,
  },
  contract: {
    label: 'What is the contract type?',
    type: 'enum',
    options: ['Month-to-month', 'One year', 'Two year'],
    required: true,
  },
  internetService: {
    label: 'What internet service do they have?',
    type: 'enum',
    options: ['DSL', 'Fiber optic', 'None'],
    required: true,
  },
  paymentDelay: {
    label: 'How many days of payment delay (if any)?',
    type: 'number',
    min: 0,
    max: 60,
    required: true,
  },
}

export function getStepByKey(stepKey) {
  return STEP_CONFIG[stepKey] || null
}

export function getQuestion(stepKey) {
  return STEP_CONFIG[stepKey]?.label ?? null
}

export function options(stepKey) {
  return STEP_CONFIG[stepKey]?.options ?? []
}

export function isComplete(answers) {
  return STEPS.every((k) => answers[k] != null && answers[k] !== '')
}

export function getNextStepKey(currentKey) {
  const i = STEPS.indexOf(currentKey)
  if (i === -1 || i >= STEPS.length - 1) return null
  return STEPS[i + 1]
}

export function isLastStep(stepKey) {
  return STEPS[STEPS.length - 1] === stepKey
}

export function validateAnswer(stepKey, value) {
  const config = STEP_CONFIG[stepKey]
  if (!config) return { valid: false, message: 'Unknown field.' }
  if (config.required && (value === undefined || value === null || value === ''))
    return { valid: false, message: 'This field is required.' }
  if (config.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return { valid: false, message: 'Please enter a valid number.' }
    if (config.min != null && n < config.min)
      return { valid: false, message: `Must be at least ${config.min}.` }
    if (config.max != null && n > config.max)
      return { valid: false, message: `Must be at most ${config.max}.` }
    return { valid: true, value: stepKey === 'monthlyCharges' ? n : Math.round(n) }
  }
  if (config.type === 'enum') {
    if (!config.options.includes(value)) return { valid: false, message: 'Please choose one of the options.' }
    return { valid: true, value }
  }
  return { valid: true, value }
}

export function normalizeAnswer(stepKey, rawInput) {
  const config = STEP_CONFIG[stepKey]
  if (!config) return rawInput
  if (config.type === 'number') {
    const n = Number(String(rawInput).trim())
    if (Number.isNaN(n)) return rawInput
    return stepKey === 'monthlyCharges' ? n : Math.round(n)
  }
  return typeof rawInput === 'string' ? rawInput.trim() : rawInput
}
