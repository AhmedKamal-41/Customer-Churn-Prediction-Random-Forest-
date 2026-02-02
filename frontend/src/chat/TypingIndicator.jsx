export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2" aria-label="Assistant is typing">
      <span className="typing-dot w-2 h-2 rounded-full bg-muted" />
      <span className="typing-dot w-2 h-2 rounded-full bg-muted" />
      <span className="typing-dot w-2 h-2 rounded-full bg-muted" />
    </div>
  )
}
