import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import SummaryCard from './SummaryCard'

export default function MessageList({
  messages,
  status,
  answers,
  onStartEdit,
  onConfirmPredict,
  onReset,
  canPredict = true,
  predictDisabledReason,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 chat-scroll">
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id ?? i}
          message={msg}
          answers={answers}
          onConfirmPredict={onConfirmPredict}
        />
      ))}
      {status === 'review' && (
        <div className="flex justify-start mb-4 message-in">
          <SummaryCard
            answers={answers}
            onEdit={onStartEdit}
            onConfirm={onConfirmPredict}
            onReset={onReset}
            disabledConfirm={!canPredict}
            disabledReason={predictDisabledReason}
          />
        </div>
      )}
      {status === 'predicting' && (
        <div className="flex justify-start mb-4 message-in">
          <div className="flex items-center gap-2 bg-card/70 border border-border rounded-2xl px-4 py-2 shadow-lg shadow-black/20">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  )
}
