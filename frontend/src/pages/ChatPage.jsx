import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatApp } from '../chat/ChatAppContext'
import ChatWindow from '../chat/ChatWindow'
import { getSession, upsertSession } from '../storage/sessions'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'

function sessionTitle(state, rightTab) {
  const d = new Date()
  const short = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (state?.prediction != null) {
    const pct = Math.round((state.prediction.score ?? 0) * 100)
    return `Churn: ${pct}% (${short})`
  }
  if (state?.answers && Object.keys(state.answers).length > 0) return `In progress (${short})`
  return `New session (${short})`
}

export default function ChatPage() {
  const { sessionId: sessionIdParam } = useParams()
  const navigate = useNavigate()

  const {
    activeSessionId,
    setActiveSessionId,
    rightTab,
    setFlushCurrentSession,
    createAndGoToNewSession,
  } = useChatApp()

  const stateRef = useRef(null)

  // URL is source of truth; fallback to context
  const effectiveSessionId = sessionIdParam || activeSessionId

  // If URL points to a deleted session, clear and go to empty state.
  useEffect(() => {
    if (!effectiveSessionId) return
    const session = getSession(effectiveSessionId)
    if (!session) {
      setActiveSessionId(null)
      navigate('/chat', { replace: true })
    }
  }, [effectiveSessionId, setActiveSessionId, navigate])

  // Keep context in sync with URL so sidebar highlight works
  useEffect(() => {
    if (effectiveSessionId && effectiveSessionId !== activeSessionId) {
      setActiveSessionId(effectiveSessionId)
    }
  }, [effectiveSessionId, activeSessionId, setActiveSessionId])

  const { run: saveSession, flush: flushSave } = useDebouncedCallback(
    (id, state, rightTabValue) => {
      if (!id || !state) return
      const title = sessionTitle(state, rightTabValue)
      upsertSession({
        id,
        title,
        messages: state.messages,
        answers: state.answers,
        status: state.status,
        prediction: state.prediction,
        currentStepIndex: state.currentStepIndex,
        editStepKey: state.editStepKey,
        ui: { rightTab: rightTabValue ?? 'profile' },
      })
    },
    500
  )

  const handleStateChange = (state) => {
    stateRef.current = state
    saveSession(effectiveSessionId, state, rightTab)
  }

  // If rightTab changes, save current state for the same session id
  useEffect(() => {
    if (stateRef.current && effectiveSessionId) {
      saveSession(effectiveSessionId, stateRef.current, rightTab)
    }
  }, [rightTab, effectiveSessionId, saveSession])

  /**
   * ✅ CRITICAL FIX:
   * The flush function MUST always use the latest effectiveSessionId.
   * Previously effectiveSessionId was NOT in the deps, so it could save to the wrong session.
   */
  useEffect(() => {
    const flushCurrentSession = () => {
      // flush debounce first
      flushSave()

      const state = stateRef.current
      if (state && effectiveSessionId) {
        const title = sessionTitle(state, rightTab)
        upsertSession({
          id: effectiveSessionId,
          title,
          messages: state.messages,
          answers: state.answers,
          status: state.status,
          prediction: state.prediction,
          currentStepIndex: state.currentStepIndex,
          editStepKey: state.editStepKey,
          ui: { rightTab: rightTab ?? 'profile' },
        })
      }
    }

    // Store the function in context (as a function-returning function)
    setFlushCurrentSession?.(() => flushCurrentSession)

    return () => setFlushCurrentSession?.(() => {})
  }, [
    effectiveSessionId, // ✅ important
    rightTab,           // ✅ important
    flushSave,
    setFlushCurrentSession,
  ])

  const session = effectiveSessionId ? getSession(effectiveSessionId) : null
  const showEmptyState = !effectiveSessionId || !session

  if (showEmptyState) {
    return (
      <div className="mx-auto w-full max-w-3xl text-center py-12">
        <h1 className="text-2xl font-semibold text-text mb-2">No session selected</h1>
        <p className="text-muted text-sm mb-6">Create a new session to start answering questions.</p>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // Safe: flush any pending state before starting a new session
            flushSave()
            createAndGoToNewSession?.()
          }}
          className="px-4 py-2 rounded-xl font-medium bg-accent text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="new-session"
        >
          Create new session
        </button>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-text mt-2 mb-8">
        Answer a few questions so we can understand your customer.
      </h1>
      <div className="mx-auto w-full max-w-3xl">
        <ChatWindow
          key={effectiveSessionId}
          sessionId={effectiveSessionId}
          onStateChange={handleStateChange}
        />
      </div>
    </>
  )
}
