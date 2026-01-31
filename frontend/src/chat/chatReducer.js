import { STEPS, getNextStepKey, isLastStep, validateAnswer, normalizeAnswer, STEP_CONFIG } from './chatFlow'

export const ACTIONS = {
  INIT: 'INIT',
  RESTORE: 'RESTORE',
  ANSWER_SUBMIT: 'ANSWER_SUBMIT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SHOW_SUMMARY: 'SHOW_SUMMARY',
  CONFIRM_PREDICT: 'CONFIRM_PREDICT',
  PREDICT_SUCCESS: 'PREDICT_SUCCESS',
  PREDICT_ERROR: 'PREDICT_ERROR',
  SET_STEP: 'SET_STEP',
  RESET: 'RESET',
  START_EDIT: 'START_EDIT',
  APPLY_EDIT: 'APPLY_EDIT',
  CANCEL_EDIT: 'CANCEL_EDIT',
  RESET_FLOW: 'RESET_FLOW',
}

const initialState = {
  currentStepIndex: 0,
  answers: {},
  messages: [],
  status: 'collecting',
  error: null,
  prediction: null,
  editStepKey: null,
}

function getCurrentStepKey(state) {
  return state.currentStepIndex >= 0 && state.currentStepIndex < STEPS.length
    ? STEPS[state.currentStepIndex]
    : null
}

function buildInitialMessages() {
  const firstKey = STEPS[0]
  const config = STEP_CONFIG[firstKey]
  return [{ role: 'assistant', content: config?.label || 'Hello.', type: 'question' }]
}

function getShortLabel(stepKey) {
  return stepKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

export function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT: {
      if (state.messages.length > 0) return state
      return { ...state, messages: buildInitialMessages() }
    }
    case ACTIONS.RESTORE: {
      const session = action.payload
      const messages =
        session.messages?.length > 0 ? session.messages : buildInitialMessages()
      const answers = session.answers ?? {}
      const currentStepIndex =
        session.currentStepIndex != null
          ? session.currentStepIndex
          : Math.min(
              STEPS.findIndex((k) => answers[k] == null || answers[k] === ''),
              STEPS.length - 1
            )
      return {
        ...initialState,
        messages,
        answers,
        status: session.status ?? 'collecting',
        prediction: session.prediction ?? null,
        error: null,
        currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : 0,
        editStepKey: session.editStepKey ?? null,
      }
    }
    case ACTIONS.RESET:
    case ACTIONS.RESET_FLOW: {
      return {
        ...initialState,
        messages: buildInitialMessages(),
      }
    }
    case ACTIONS.ANSWER_SUBMIT: {
      const { stepKey, rawValue } = action.payload
      const normalized = normalizeAnswer(stepKey, rawValue)
      const validation = validateAnswer(stepKey, normalized)
      if (!validation.valid) {
        return {
          ...state,
          messages: [
            ...state.messages,
            { role: 'user', content: String(rawValue), type: 'answer' },
            { role: 'assistant', content: validation.message, type: 'error' },
            { role: 'assistant', content: STEP_CONFIG[stepKey]?.label, type: 'question' },
          ],
        }
      }
      const value = validation.value
      const newAnswers = { ...state.answers, [stepKey]: value }
      const userMsg = { role: 'user', content: String(value), type: 'answer' }
      if (isLastStep(stepKey)) {
        return {
          ...state,
          answers: newAnswers,
          messages: [
            ...state.messages,
            userMsg,
            { role: 'assistant', content: 'Review your answers below. You can edit any field.', type: 'question' },
          ],
          status: 'review',
        }
      }
      const nextKey = getNextStepKey(stepKey)
      const nextConfig = STEP_CONFIG[nextKey]
      const nextIndex = STEPS.indexOf(nextKey)
      return {
        ...state,
        answers: newAnswers,
        currentStepIndex: nextIndex,
        messages: [
          ...state.messages,
          userMsg,
          { role: 'assistant', content: nextConfig?.label || '', type: 'question' },
        ],
      }
    }
    case ACTIONS.SET_STEP: {
      const { stepKey } = action.payload
      const idx = STEPS.indexOf(stepKey)
      if (idx === -1) return state
      const config = STEP_CONFIG[stepKey]
      return {
        ...state,
        currentStepIndex: idx,
        status: 'collecting',
        editStepKey: null,
        messages: [
          ...state.messages,
          { role: 'assistant', content: config?.label || '', type: 'question' },
        ],
      }
    }
    case ACTIONS.START_EDIT: {
      const { stepKey } = action.payload
      const config = STEP_CONFIG[stepKey]
      const shortLabel = getShortLabel(stepKey)
      return {
        ...state,
        status: 'editing',
        editStepKey: stepKey,
        messages: [
          ...state.messages,
          { role: 'assistant', content: `Okay — update ${shortLabel}:`, type: 'question' },
        ],
      }
    }
    case ACTIONS.APPLY_EDIT: {
      const { stepKey, rawValue } = action.payload
      const normalized = normalizeAnswer(stepKey, rawValue)
      const validation = validateAnswer(stepKey, normalized)
      const shortLabel = getShortLabel(stepKey)
      const editQuestion = `Okay — update ${shortLabel}:`
      if (!validation.valid) {
        return {
          ...state,
          messages: [
            ...state.messages,
            { role: 'user', content: String(rawValue), type: 'answer' },
            { role: 'assistant', content: validation.message, type: 'error' },
            { role: 'assistant', content: editQuestion, type: 'question' },
          ],
        }
      }
      const value = validation.value
      const newAnswers = { ...state.answers, [stepKey]: value }
      return {
        ...state,
        answers: newAnswers,
        status: 'review',
        editStepKey: null,
        messages: [
          ...state.messages,
          { role: 'user', content: String(value), type: 'answer' },
          { role: 'assistant', content: `Updated ${shortLabel.toLowerCase()} to ${value}.`, type: 'question' },
        ],
      }
    }
    case ACTIONS.CANCEL_EDIT: {
      return {
        ...state,
        status: 'review',
        editStepKey: null,
      }
    }
    case ACTIONS.CONFIRM_PREDICT: {
      return { ...state, status: 'predicting', error: null }
    }
    case ACTIONS.PREDICT_SUCCESS: {
      const pred = action.payload
      const riskPct = Math.round((pred.score ?? 0) * 100)
      const predictionText =
        pred.label === 'CHURN'
          ? `Prediction: CHURN (${riskPct}% risk)`
          : `Prediction: NO_CHURN (${riskPct}% risk)`
      return {
        ...state,
        status: 'done',
        prediction: pred,
        error: null,
        messages: [
          ...state.messages,
          { role: 'assistant', content: predictionText, type: 'question' },
          { role: 'assistant', content: null, type: 'result', payload: pred },
          { role: 'assistant', content: 'See the Insights panel for key drivers.', type: 'question' },
          { role: 'assistant', content: "Here's a suggested retention plan — see the Insights panel.", type: 'question' },
        ],
      }
    }
    case ACTIONS.PREDICT_ERROR: {
      return {
        ...state,
        status: 'review',
        error: action.payload?.message || 'Prediction failed.',
        messages: [
          ...state.messages,
          { role: 'assistant', content: action.payload?.message || 'Something went wrong. Please try again.', type: 'error' },
        ],
      }
    }
    default:
      return state
  }
}

export function getInitialState() {
  return {
    ...initialState,
    messages: [],
  }
}

export function buildPredictBody(answers) {
  return {
    age: answers.age,
    tenure: answers.tenure,
    monthlyCharges: answers.monthlyCharges,
    contract: answers.contract,
    internetService: answers.internetService,
    paymentDelay: answers.paymentDelay,
  }
}
