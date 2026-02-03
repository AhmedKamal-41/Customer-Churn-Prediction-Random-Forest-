import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

const SUMMARY_URL = import.meta.env.VITE_AUTOMATION_SUMMARY_URL || '/qa/automation-summary.json'

function formatTimestamp(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function relativeTime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now - d
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
    return formatTimestamp(iso)
  } catch {
    return ''
  }
}

function StatCard({ label, value, className = '' }) {
  return (
    <Card className={className}>
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-text mt-1">{value}</p>
    </Card>
  )
}

export default function AutomationDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(SUMMARY_URL)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Not found' : `HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null)
          setError(err.message || 'Failed to load')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">UI Automation</h1>
          <p className="text-sm text-muted mt-1">Latest run summary</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-border rounded w-16" />
              <div className="h-8 bg-border rounded w-12 mt-2" />
            </Card>
          ))}
        </div>
        <Card>
          <p className="text-sm text-muted">Loading…</p>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">UI Automation</h1>
          <p className="text-sm text-muted mt-1">Latest run summary</p>
        </div>
        <Card className="border-border">
          <p className="text-text font-medium mb-2">No automation data yet</p>
          <p className="text-sm text-muted">
            Enable CI GitHub Pages deployment to see the latest run summary here. The workflow publishes
            a summary JSON and the Playwright HTML report on every push to main.
          </p>
        </Card>
      </div>
    )
  }

  const status = (data.status || 'pass').toLowerCase()
  const isPass = status === 'pass'

  return (
    <div className="max-w-4xl w-full space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-text">UI Automation</h1>
        <Badge status={isPass ? 'success' : 'error'}>
          {isPass ? 'PASS' : 'FAIL'}
        </Badge>
      </div>
      <p className="text-sm text-muted">Latest run summary</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total" value={data.total != null ? data.total : '—'} />
        <StatCard label="Passed" value={data.passed != null ? data.passed : '—'} />
        <StatCard label="Failed" value={data.failed != null ? data.failed : '—'} />
        <StatCard label="Skipped" value={data.skipped != null ? data.skipped : '—'} />
        <StatCard
          label="Duration"
          value={
            data.durationSec != null
              ? `${data.durationSec}s`
              : '—'
          }
        />
        <StatCard label="Last Run" value={formatTimestamp(data.timestamp)} />
      </div>

      <Card title="Links">
        <div className="flex flex-wrap gap-3">
          {data.runUrl && (
            <a
              href={data.runUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg px-4 py-2.5 text-sm bg-card text-text hover:bg-card/80 active:opacity-90 border border-border shadow-lg shadow-black/20"
            >
              Open CI Run
            </a>
          )}
          {data.reportUrl && (
            <a
              href={data.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg px-4 py-2.5 text-sm bg-card text-text hover:bg-card/80 active:opacity-90 border border-border shadow-lg shadow-black/20"
            >
              View Playwright Report
            </a>
          )}
          {!data.runUrl && !data.reportUrl && (
            <p className="text-sm text-muted">No run or report URLs in summary.</p>
          )}
        </div>
      </Card>

      <Card title="Details">
        <dl className="space-y-2 text-sm">
          {data.branch != null && (
            <div>
              <dt className="text-muted">Branch</dt>
              <dd className="font-medium text-text">{data.branch}</dd>
            </div>
          )}
          {data.commit != null && (
            <div>
              <dt className="text-muted">Commit SHA</dt>
              <dd className="font-medium text-text font-mono">
                {(data.commit || '').slice(0, 7)}
              </dd>
            </div>
          )}
          {data.message && (
            <div>
              <dt className="text-muted">Commit message</dt>
              <dd className="font-medium text-text">{data.message}</dd>
            </div>
          )}
          {data.runnerOs && (
            <div>
              <dt className="text-muted">Runner OS</dt>
              <dd className="font-medium text-text">{data.runnerOs}</dd>
            </div>
          )}
        </dl>
      </Card>

      {data.timestamp && relativeTime(data.timestamp) && (
        <p className="text-xs text-muted">
          Last updated {relativeTime(data.timestamp)}
        </p>
      )}
    </div>
  )
}
