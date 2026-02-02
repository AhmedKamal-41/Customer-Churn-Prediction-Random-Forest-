import { useReducer, useEffect, useRef, useState } from 'react'
import { chatReducer, getInitialState, ACTIONS, buildPredictBody } from './chatReducer'
import { predictSmart } from '../api/churnApi'
import { useChatApp } from './ChatAppContext'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { useDemoMode } from '../hooks/useDemoMode'
import { getSession, replaceMessages, updateSession } from '../storage/sessions'
import MessageList from './MessageList'
import ChatComposer from './ChatComposer'
import { STEPS } from './chatFlow'

export default function ChatWindow({ onStateChange, sessionId }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, getInitialState)
  const [hydrated, setHydrated] = useState(false)
  const { setChatState, setResetChatFn } = useChatApp()
  const { online } = useBackendStatus()
  const { demoModeEnabled } = useDemoMode()
  const canPredict = online || demoModeEnabled
  const predictDisabledReason =
    !online && !demoModeEnabled ? 'Backend offline. Enable Demo Mode to continue.' : undefined
  const restoredSessionIdRef = useRef(null)
  const latestStateRef = useRef(null)

  // Reset hydrated when session changes so we don't persist stale messages
  useEffect(() => {
    setHydrated(false)
  }, [sessionId])

  useEffect(() => {
    if (sessionId) {
      const s = getSession(sessionId)
      if (s) {
        if (restoredSessionIdRef.current === sessionId) return
        restoredSessionIdRef.current = sessionId
        dispatch({ type: ACTIONS.RESTORE, payload: s })
        const rightTab = s.ui?.rightTab ?? 'profile'
        setChatState((prev) => ({ ...prev, rightTab }))
        setTimeout(() => setHydrated(true), 0)
      }
      // sessionId set but getSession null: do nothing; ChatPage will redirect
    } else {
      if (restoredSessionIdRef.current === 'init') return
      restoredSessionIdRef.current = 'init'
      dispatch({ type: ACTIONS.INIT })
      setTimeout(() => setHydrated(true), 0)
    }
  }, [sessionId, setChatState])

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

  // Auto-save messages only after hydration so we never overwrite with stale data
  useEffect(() => {
    if (!hydrated || !sessionId) return
    console.log('SAVE', sessionId, state.messages?.length ?? 0)
    replaceMessages(sessionId, state.messages ?? [])
  }, [hydrated, sessionId, state.messages])

  // Save full session state when leaving (e.g. switching to another session) so chat and profile are preserved
  useEffect(() => {
    latestStateRef.current = {
      messages: state.messages ?? [],
      answers: state.answers ?? {},
      status: state.status ?? 'collecting',
      prediction: state.prediction ?? null,
      currentStepIndex: state.currentStepIndex ?? 0,
      editStepKey: state.editStepKey ?? null,
    }
    return () => {
      if (sessionId && latestStateRef.current) {
        updateSession(sessionId, latestStateRef.current)
      }
    }
  }, [sessionId, state.messages, state.answers, state.status, state.prediction, state.currentStepIndex, state.editStepKey])

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
