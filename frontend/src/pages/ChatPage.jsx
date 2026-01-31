import { useState, useEffect, useRef } from 'react'
import { useChatApp } from '../chat/ChatAppContext'
import ChatWindow from '../chat/ChatWindow'
import { getSession, createSession, upsertSession } from '../storage/sessions'
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
  const { activeSessionId, setActiveSessionId, rightTab } = useChatApp()
  const [initialSession, setInitialSession] = useState(null)
  const stateRef = useRef(null)

  useEffect(() => {
    if (!activeSessionId) {
      const newSession = createSession()
      setActiveSessionId(newSession.id)
      setInitialSession(newSession)
      return
    }
    const session = getSession(activeSessionId)
    if (session) {
      setInitialSession(session)
    } else {
      const newSession = createSession()
      setActiveSessionId(newSession.id)
      setInitialSession(newSession)
    }
  }, [activeSessionId, setActiveSessionId])

  const saveSession = useDebouncedCallback((id, state, rightTabValue) => {
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
  }, 500)

  const handleStateChange = (state) => {
    stateRef.current = state
    saveSession(activeSessionId, state, rightTab)
  }

  useEffect(() => {
    if (stateRef.current && activeSessionId) {
      saveSession(activeSessionId, stateRef.current, rightTab)
    }
  }, [rightTab, activeSessionId, saveSession])

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-text mt-2 mb-8">
        Answer a few questions so we can understand your customer.
      </h1>
      <div className="mx-auto w-full max-w-3xl">
        <ChatWindow
          key={activeSessionId}
          sessionId={activeSessionId}
          initialSession={initialSession}
          onStateChange={handleStateChange}
        />
      </div>
    </>
  )
}