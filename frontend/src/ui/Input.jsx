export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  disabled,
  className = '',
  id,
  'aria-label': ariaLabel,
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel}
      className={`w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-text placeholder-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent/50 disabled:opacity-50 shadow-lg shadow-black/10 transition-colors duration-200 ${className}`}
      {...props}
    />
  )
}
