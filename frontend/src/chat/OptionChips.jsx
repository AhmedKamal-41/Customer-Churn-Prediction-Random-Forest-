export default function OptionChips({ options, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Select option">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className="px-4 py-2.5 rounded-2xl text-sm font-medium border border-border bg-card text-text hover:bg-card/80 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 shadow-lg shadow-black/10 transition-colors duration-200"
          aria-label={`Select ${opt}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
