import { useReducer, useEffect, useRef } from 'react'
import { chatReducer, getInitialState, ACTIONS, buildPredictBody } from './chatReducer'
import { predictSmart } from '../api/churnApi'
import { useChatApp } from './ChatAppContext'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { useDemoMode } from '../hooks/useDemoMode'
import MessageList from './MessageList'
import ChatComposer from './ChatComposer'
import { STEPS } from './chatFlow'

export default function ChatWindow({ initialSession, onStateChange, sessionId }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, getInitialState)
  const { setChatState, setResetChatFn } = useChatApp()
  const { online } = useBackendStatus()
  const { demoModeEnabled } = useDemoMode()
  const canPredict = online || demoModeEnabled
  const predictDisabledReason =
    !online && !demoModeEnabled ? 'Backend offline — enable Demo Mode to continue.' : undefined
  const restoredSessionIdRef = useRef(null)

  useEffect(() => {
    if (initialSession != null) {
      if (restoredSessionIdRef.current === initialSession.id) return
      restoredSessionIdRef.current = initialSession.id
      dispatch({ type: ACTIONS.RESTORE, payload: initialSession })
      const rightTab = initialSession.ui?.rightTab ?? 'profile'
      setChatState((prev) => ({ ...prev, rightTab }))
    } else {
      if (restoredSessionIdRef.current === 'init') return
      restoredSessionIdRef.current = 'init'
      dispatch({ type: ACTIONS.INIT })
    }
  }, [initialSession?.id, sessionId, setChatState])

  useEffect(() => {
    setChatState((prev) => ({
      ...prev,
      answers: state.answers,
      prediction: state.prediction,
      status: state.status,
    }))
  }, [state.answers, state.prediction, state.status, setChatState])

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  useEffect(() => {
    setResetChatFn(() => () => dispatch({ type: ACTIONS.RESET_FLOW }))
    return () => setResetChatFn(() => () => {})
  }, [setResetChatFn])

  const handleAnswerSubmit = (stepKey, rawValue) => {
    dispatch({ type: ACTIONS.ANSWER_SUBMIT, payload: { stepKey, rawValue } })
  }

  const handleStartEdit = (stepKey) => {
    dispatch({ type: ACTIONS.START_EDIT, payload: { stepKey } })
  }

  const handleApplyEdit = (stepKey, rawValue) => {
    dispatch({ type: ACTIONS.APPLY_EDIT, payload: { stepKey, rawValue } })
  }

  const handleCancelEdit = () => {
    dispatch({ type: ACTIONS.CANCEL_EDIT })
  }

  const handleReset = () => {
    dispatch({ type: ACTIONS.RESET_FLOW })
  }

  const predictTimeoutRef = useRef(null)
  useEffect(() => {
    return () => {
      if (predictTimeoutRef.current) clearTimeout(predictTimeoutRef.current)
    }
  }, [])

  const handleConfirmPredict = () => {
    dispatch({ type: ACTIONS.CONFIRM_PREDICT })
    const answers = state.answers
    predictTimeoutRef.current = setTimeout(() => {
      predictTimeoutRef.current = null
      predictSmart(buildPredictBody(answers), { online, demoModeEnabled })
        .then((result) => dispatch({ type: ACTIONS.PREDICT_SUCCESS, payload: result }))
        .catch((err) =>
          dispatch({
            type: ACTIONS.PREDICT_ERROR,
            payload: { message: err?.message || "I couldn't reach the backend. Please try again." },
          })
        )
    }, 500)
  }

  const showComposer = state.status === 'collecting' || state.status === 'editing'
  const isEditing = state.status === 'editing'
  const composerStepIndex = isEditing && state.editStepKey ? STEPS.indexOf(state.editStepKey) : state.currentStepIndex
  const composerOnSubmit = isEditing ? handleApplyEdit : handleAnswerSubmit

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/20 transition-colors duration-200 flex flex-col h-[560px]">
      <div className="flex flex-col flex-1 min-h-0">
        <MessageList
          messages={state.messages}
          status={state.status}
          answers={state.answers}
          onStartEdit={handleStartEdit}
          onConfirmPredict={handleConfirmPredict}
          onReset={handleReset}
          canPredict={canPredict}
          predictDisabledReason={predictDisabledReason}
        />
      </div>
      {showComposer && (
        <div className="border-t border-border p-4 flex-shrink-0">
          <ChatComposer
            currentStepIndex={composerStepIndex}
            onSubmit={composerOnSubmit}
            disabled={state.status === 'predicting'}
          />
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="mt-2 text-sm text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
