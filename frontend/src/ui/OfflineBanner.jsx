import Button from './Button'

function formatLastOnline(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return null
  }
}

export default function OfflineBanner({
  online,
  lastOnlineAt,
  onRetry,
  demoModeEnabled,
  onEnableDemo,
  onDisableDemo,
  reconnected,
}) {
  if (online && reconnected) {
    return (
      <div
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 mb-4 flex flex-wrap items-center justify-between gap-3"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-emerald-200">Backend reconnected.</p>
        {demoModeEnabled && (
          <Button variant="secondary" type="button" onClick={onDisableDemo} className="text-xs">
            Switch to Live mode
          </Button>
        )}
      </div>
    )
  }

  if (online) return null

  const lastStr = formatLastOnline(lastOnlineAt)

  return (
    <div
      className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 mb-4"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-sm font-medium text-red-200 mb-2">
        Backend offline — you can retry or use Demo Mode.
      </p>
      {lastStr && (
        <p className="text-xs text-red-200/80 mb-3">Last seen: {lastStr}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" type="button" onClick={onRetry} className="text-xs">
          Retry
        </Button>
        {!demoModeEnabled && (
          <Button variant="primary" type="button" onClick={onEnableDemo} className="text-xs">
            Enable Demo Mode
          </Button>
        )}
      </div>
    </div>
  )
}
