export default function Card({ children, title, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-lg shadow-black/20 p-4 transition-colors duration-200 ${className}`}
    >
      {title && (
        <h2 className="text-sm font-semibold text-text mb-3 border-b border-border pb-2">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
