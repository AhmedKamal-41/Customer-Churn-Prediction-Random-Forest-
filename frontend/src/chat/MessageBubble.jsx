export default function MessageBubble({ message, answers, onConfirmPredict }) {
  const { role, content, type, payload } = message
  const isAssistant = role === 'assistant'
  const isError = type === 'error'
  const isResult = type === 'result'

  if (isResult && payload) {
    const isChurn = payload.label === 'CHURN'
    return (
      <div className={`flex justify-start mb-4 message-in`}>
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-xs font-semibold text-text" aria-hidden="true">
            CA
          </div>
          <div
            className={`rounded-2xl px-4 py-3 border shadow-lg shadow-black/20 ${
              isChurn
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-lg">{payload.label}</p>
              {payload.demo === true && (
                <span className="inline-flex items-center rounded border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                  DEMO
                </span>
              )}
            </div>
            {payload.demo === true && (
              <p className="text-xs mt-1 opacity-90">Backend unavailable — demo estimate.</p>
            )}
            <div className="mt-2 h-2 rounded-full bg-card/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-muted transition-all duration-500"
                style={{ width: `${payload.score * 100}%` }}
              />
            </div>
            <p className="text-sm mt-1 opacity-90">Score: {(payload.score * 100).toFixed(1)}%</p>
            {payload.explanation?.length > 0 && (
              <ul className="mt-2 text-sm list-disc list-inside space-y-0.5">
                {payload.explanation.map((item, i) => (
                  <li key={i}>
                    <strong>{item.feature}</strong>: {item.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 message-in`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center text-xs font-semibold shadow-lg shadow-black/20 ${isAssistant ? 'bg-card border-border text-text' : 'bg-accent/20 border-accent/30 text-accent'}`}
          aria-hidden="true"
        >
          {isAssistant ? 'CA' : 'You'}
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 border shadow-lg shadow-black/20 transition-colors duration-200 ${
            isAssistant
              ? 'bg-card/70 border-border text-text'
              : 'bg-accent/15 border-accent/30 text-accent'
          } ${isError ? 'border-red-500/40 text-red-200' : ''}`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
