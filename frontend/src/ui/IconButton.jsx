export default function IconButton({ children, 'aria-label': ariaLabel, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-border bg-card text-text hover:bg-card/80 hover:text-text active:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 shadow-lg shadow-black/20 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
