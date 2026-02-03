export default function MessageBubble({ message, answers, onConfirmPredict }) {
  const { role, content, type, payload } = message
  const isAssistant = role === 'assistant'
  const isError = type === 'error'
  const isResult = type === 'result'

  if (isResult && payload) {
    const isChurn = payload.label === 'CHURN'
    return (
      <div className={`flex justify-start mb-4 message-in`} data-testid="message-assistant">
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-xs font-semibold text-text" aria-hidden="true">
            CA
          </div>
          <div
            className={`rounded-2xl px-4 py-3 border shadow-lg shadow-black/20 ${
              isChurn
                ? 'bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-900/30 dark:border-rose-500 dark:text-rose-100'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-lg">{payload.label}</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/50 dark:bg-black/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-600 dark:bg-rose-400 transition-all duration-500"
                style={{ width: `${payload.score * 100}%` }}
              />
            </div>
            <p className="text-base font-semibold mt-1">Score: {(payload.score * 100).toFixed(1)}%</p>
            {payload.explanation?.length > 0 && (
              <ul className="mt-2 text-sm list-disc list-inside space-y-0.5 text-text">
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
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 message-in`} data-testid={isAssistant ? 'message-assistant' : 'message-user'}>
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
