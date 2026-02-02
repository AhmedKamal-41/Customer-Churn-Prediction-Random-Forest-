export default function Badge({ children, status = 'neutral', className = '' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    error: 'bg-red-500/20 text-red-300 border border-red-500/30',
    neutral: 'bg-card/80 text-muted border border-border',
  }
  return <span className={`${base} ${variants[status] || variants.neutral} ${className}`}>{children}</span>
}
