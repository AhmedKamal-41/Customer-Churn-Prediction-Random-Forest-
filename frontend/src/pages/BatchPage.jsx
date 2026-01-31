import { useState, useRef } from 'react'
import { parseCsv } from '../utils/csv'
import { STEPS, validateAnswer, normalizeAnswer } from '../chat/chatFlow'
import { buildPredictBody } from '../chat/chatReducer'
import { predictSmart } from '../api/churnApi'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { useDemoMode } from '../hooks/useDemoMode'
import { runBatch } from '../batch/runBatch'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const REQUIRED_HEADERS = [...STEPS]

function getRiskBucket(score) {
  if (score == null || Number.isNaN(score)) return null
  if (score < 0.35) return 'Low'
  if (score <= 0.65) return 'Medium'
  return 'High'
}

function getRiskBadgeClass(bucket) {
  if (bucket === 'High') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (bucket === 'Medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  if (bucket === 'Low') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  return 'bg-card/80 text-muted border border-border'
}

const SAMPLE_CSV = `age,tenure,monthlyCharges,contract,internetService,paymentDelay
40,24,70,Month-to-month,DSL,5
55,12,85,One year,Fiber optic,0`

export default function BatchPage() {
  const { online } = useBackendStatus()
  const { demoModeEnabled } = useDemoMode()
  const [parsed, setParsed] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState({ processed: 0, total: 0 })
  const cancelRef = useRef(null)

  const canRunBatch = online || demoModeEnabled
  const batchDisabledReason = !online && !demoModeEnabled ? 'Backend offline — enable Demo Mode to continue.' : undefined

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0]
    if (!file) return
    setParseError(null)
    setParsed(null)
    setResults([])
    setStatus('idle')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const { headers, rows } = parseCsv(reader.result)
        const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
        if (missing.length > 0) {
          setParseError(`Missing columns: ${missing.join(', ')}`)
          return
        }
        setParsed({ headers, rows })
      } catch (err) {
        setParseError(err.message || 'Invalid CSV')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const startBatch = () => {
    if (!parsed || status !== 'idle') return
    const { rows } = parsed
    const initialResults = []
    const validRows = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      let valid = true
      const normalized = {}
      for (const key of STEPS) {
        const raw = row[key]
        const norm = normalizeAnswer(key, raw)
        const validation = validateAnswer(key, norm)
        if (!validation.valid) {
          initialResults[i] = { rowIndex: i, inputs: row, error: validation.message, status: 'validation' }
          valid = false
          break
        }
        normalized[key] = validation.value
      }
      if (valid) {
        initialResults[i] = null
        validRows.push({ rowIndex: i, body: buildPredictBody(normalized) })
      }
    }
    setResults(initialResults)
    setStatus('running')
    setProgress({ processed: 0, total: rows.length })
    const controller = new AbortController()
    cancelRef.current = controller

    runBatch(
      {
        rows: validRows,
        concurrency: 3,
        signal: controller.signal,
        onProgress: ({ processed, total }) => setProgress({ processed, total }),
        onResult: (rowIndex, result) => {
          setResults((prev) => {
            const next = [...prev]
            next[rowIndex] = {
              rowIndex,
              inputs: parsed.rows[rowIndex],
              label: result.label,
              score: result.score,
              status: 'success',
            }
            return next
          })
        },
        onError: (rowIndex, err) => {
          setResults((prev) => {
            const next = [...prev]
            next[rowIndex] = {
              rowIndex,
              inputs: parsed.rows[rowIndex],
              error: err.message || 'Request failed',
              status: 'error',
            }
            return next
          })
        },
        onDone: () => {
          setStatus((s) => (s === 'running' ? 'done' : 'cancelled'))
          cancelRef.current = null
        },
      },
      (body) => predictSmart(body, { online, demoModeEnabled })
    )
  }

  const cancelBatch = () => {
    if (cancelRef.current) cancelRef.current.abort()
  }

  const clearResults = () => {
    setResults([])
    setStatus('idle')
    setProgress({ processed: 0, total: 0 })
  }

  const successResults = results.filter((r) => r && r.status === 'success')
  const summary = (() => {
    const total = results.length
    const success = successResults.length
    const failed = total - success
    const churnCount = successResults.filter((r) => r.label === 'CHURN').length
    const churnRate = success > 0 ? (churnCount / success) * 100 : 0
    const avgScore = success > 0
      ? successResults.reduce((a, r) => a + (r.score ?? 0), 0) / success
      : 0
    const buckets = { Low: 0, Medium: 0, High: 0 }
    successResults.forEach((r) => {
      const b = getRiskBucket(r.score)
      if (b) buckets[b]++
    })
    return { total, success, failed, churnRate, avgScore, buckets }
  })()

  const sortedResults = [...results].sort((a, b) => {
    if (!a || !b) return 0
    const sa = a.status === 'success' ? (a.score ?? 0) : -1
    const sb = b.status === 'success' ? (b.score ?? 0) : -1
    return sb - sa
  })

  const exportCsv = () => {
    const headers = [...REQUIRED_HEADERS, 'label', 'score']
    const lines = [headers.join(',')]
    results.forEach((r) => {
      if (!r) return
      const row = REQUIRED_HEADERS.map((h) => (r.inputs?.[h] ?? ''))
      row.push(r.label ?? '')
      row.push(r.status === 'success' ? (r.score != null ? (r.score * 100).toFixed(1) : '') : (r.error ?? ''))
      lines.push(row.join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJson = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      summary: {
        total: summary.total,
        success: summary.success,
        failed: summary.failed,
        churnRate: summary.churnRate.toFixed(1),
        avgScore: (summary.avgScore * 100).toFixed(1),
        buckets: summary.buckets,
      },
      results,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch-results.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Batch scoring</h1>
        <p className="text-sm text-muted mt-1">
          Upload a CSV with customer data to run churn predictions in bulk. Columns must match: age, tenure,
          monthlyCharges, contract, internetService, paymentDelay.
        </p>
      </div>

      <Card title="Upload CSV">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm text-text file:mr-2 file:rounded-xl file:border file:border-border file:bg-card file:px-4 file:py-2 file:text-sm file:font-medium"
              aria-label="Choose CSV file"
            />
            <Button variant="ghost" type="button" onClick={downloadSample} className="text-sm">
              Download sample CSV
            </Button>
          </div>
          {parseError && (
            <p className="text-sm text-red-400" role="alert">
              {parseError}
            </p>
          )}
          {parsed && (
            <p className="text-xs text-muted">
              Detected {parsed.headers.length} columns, {parsed.rows.length} row(s).
            </p>
          )}
        </div>
      </Card>

      {parsed && (
        <Card>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <Button
              variant="primary"
              type="button"
              onClick={startBatch}
              disabled={status === 'running' || !canRunBatch}
              aria-label={batchDisabledReason || 'Start batch'}
              title={batchDisabledReason}
            >
              Start batch
            </Button>
            {status === 'running' && (
              <Button variant="secondary" type="button" onClick={cancelBatch} aria-label="Cancel batch">
                Cancel
              </Button>
            )}
            {(status === 'done' || status === 'cancelled') && (
              <Button variant="ghost" type="button" onClick={clearResults}>
                Clear results
              </Button>
            )}
          </div>
          {(status === 'running' || status === 'done' || status === 'cancelled') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Processed:</span>
                <span className="font-medium text-text">
                  {progress.processed} / {progress.total}
                </span>
                <span className="text-muted">
                  {status === 'running' && 'Running...'}
                  {status === 'done' && 'Complete'}
                  {status === 'cancelled' && 'Cancelled'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-card overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{
                    width: progress.total ? `${(progress.processed / progress.total) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {results.length > 0 && (
        <>
          <Card title="Results Summary">
            {successResults.some((r) => r.demo) && (
              <p className="text-xs text-amber-400 mb-3">Running in Demo Mode — some or all predictions are demo estimates.</p>
            )}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-muted">Total rows</dt>
                <dd className="font-semibold text-text">{summary.total}</dd>
              </div>
              <div>
                <dt className="text-muted">Successful predictions</dt>
                <dd className="font-semibold text-text">{summary.success}</dd>
              </div>
              <div>
                <dt className="text-muted">Failed rows</dt>
                <dd className="font-semibold text-text">{summary.failed}</dd>
              </div>
              <div>
                <dt className="text-muted">Predicted churn rate</dt>
                <dd className="font-semibold text-text">
                  {summary.success > 0 ? `${summary.churnRate.toFixed(1)}%` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Average risk score</dt>
                <dd className="font-semibold text-text">
                  {summary.success > 0 ? `${(summary.avgScore * 100).toFixed(1)}%` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Risk buckets</dt>
                <dd className="font-semibold text-text">
                  Low {summary.buckets.Low}, Medium {summary.buckets.Medium}, High {summary.buckets.High}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="ghost" type="button" onClick={exportCsv}>
                Export CSV
              </Button>
              <Button variant="ghost" type="button" onClick={exportJson}>
                Export JSON
              </Button>
            </div>
          </Card>

          <Card title="Results">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border sticky top-0 bg-card z-10">
                    <th className="text-left py-2 px-2 font-semibold text-text">Row #</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Label</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Mode</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Score %</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Age</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Tenure</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Monthly charges</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Contract</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Internet service</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Payment delay</th>
                    <th className="text-left py-2 px-2 font-semibold text-text">Status / Error</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r, idx) => {
                    if (!r) return null
                    const bucket = getRiskBucket(r.score)
                    return (
                      <tr key={r.rowIndex} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-2 px-2 text-muted">{r.rowIndex + 1}</td>
                        <td className="py-2 px-2 text-text">{r.label ?? '—'}</td>
                        <td className="py-2 px-2">
                          {r.status === 'success' ? (
                            r.demo ? (
                              <span className="inline-flex items-center rounded border border-amber-500/50 bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-300">
                                Demo
                              </span>
                            ) : (
                              <span className="text-muted text-xs">Live</span>
                            )
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {r.status === 'success' && r.score != null ? (
                            <span className="flex items-center gap-1">
                              {(r.score * 100).toFixed(1)}%
                              {bucket && (
                                <span
                                  className={`inline-flex rounded-full border px-1.5 py-0.5 text-xs font-medium ${getRiskBadgeClass(bucket)}`}
                                >
                                  {bucket}
                                </span>
                              )}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 px-2 text-muted">{r.inputs?.age ?? '—'}</td>
                        <td className="py-2 px-2 text-muted">{r.inputs?.tenure ?? '—'}</td>
                        <td className="py-2 px-2 text-muted">{r.inputs?.monthlyCharges ?? '—'}</td>
                        <td className="py-2 px-2 text-muted">{r.inputs?.contract ?? '—'}</td>
                        <td className="py-2 px-2 text-muted">{r.inputs?.internetService ?? '—'}</td>
                        <td className="py-2 px-2 text-muted">{r.inputs?.paymentDelay ?? '—'}</td>
                        <td className="py-2 px-2">
                          {r.status === 'success' ? (
                            <Badge status="success">OK</Badge>
                          ) : (
                            <span className="text-red-400 text-xs">{r.error ?? r.status}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!parsed && !parseError && (
        <Card>
          <p className="text-sm text-muted">Upload a CSV file to get started. Use the sample CSV for the expected format.</p>
        </Card>
      )}
    </div>
  )
}
