export default function Button({ children, variant = 'secondary', type = 'button', className = '', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-black/20'
  const variants = {
    primary: 'bg-accent text-white hover:opacity-90 active:opacity-80',
    secondary: 'bg-card text-text hover:bg-card/80 active:opacity-90 border border-border',
    ghost: 'bg-transparent text-muted hover:bg-card hover:text-text',
  }
  const size = 'px-4 py-2.5 text-sm'
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.secondary} ${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
