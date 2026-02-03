import { useState, useEffect, useCallback } from 'react'
import { getModelMetrics } from '../api/modelApi'
import { FALLBACK_METRICS } from '../data/fallbackMetrics'
import { useChatApp } from '../chat/ChatAppContext'
import { getSession, listSessions } from '../storage/sessions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function formatDate(iso) {
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

function KpiCard({ label, value, className = '' }) {
  return (
    <Card className={className}>
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-text mt-1">{value}</p>
    </Card>
  )
}

function ConfusionMatrixGrid({ labels, matrix }) {
  if (!labels?.length || !matrix?.length) return null
  const maxVal = Math.max(...matrix.flat(), 1)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-2 font-medium text-muted" scope="col" />
            <th className="text-center py-2 px-2 font-medium text-muted" scope="col">
              Pred: {labels[0]}
            </th>
            <th className="text-center py-2 px-2 font-medium text-muted" scope="col">
              Pred: {labels[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="py-2 px-2 font-medium text-muted">
                Actual: {labels[i]}
              </td>
              {row.map((cell, j) => {
                const intensity = cell / maxVal
                const bg = intensity > 0.5
                  ? 'bg-emerald-500/30'
                  : intensity > 0.2
                    ? 'bg-emerald-500/15'
                    : 'bg-card'
                return (
                  <td
                    key={j}
                    className={`py-2 px-2 text-center font-semibold text-text border border-border ${bg}`}
                  >
                    {cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardPage() {
  const { activeSessionId } = useChatApp()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const activeSession = activeSessionId ? getSession(activeSessionId) : null
  const latestPrediction = activeSession?.prediction
  const recentWithPredictions = listSessions()
    .filter((s) => s.prediction != null && (s.prediction.score != null || s.prediction.proba != null))
    .slice(0, 10)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getModelMetrics()
      setMetrics(data)
      setUsingFallback(false)
    } catch (err) {
      setMetrics(FALLBACK_METRICS)
      setError(null)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="max-w-6xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">Model Dashboard</h1>
          <p className="text-sm text-muted mt-1">Evaluation metrics, reliability signals, and drivers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-border rounded w-20" />
              <div className="h-8 bg-border rounded w-16 mt-2" />
            </Card>
          ))}
        </div>
        <Card>
          <p className="text-sm text-muted">Loading metrics…</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">Model Dashboard</h1>
          <p className="text-sm text-muted mt-1">Evaluation metrics, reliability signals, and drivers</p>
        </div>
        <Card className="border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <Button variant="primary" onClick={load}>
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  const { model, kpis, confusionMatrix, rocCurve, featureImportance } = metrics || {}

  return (
    <div className="max-w-6xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Model Dashboard</h1>
        <p className="text-sm text-muted mt-1">Evaluation metrics, reliability signals, and drivers</p>
      </div>

      {usingFallback && (
        <p className="text-sm text-muted bg-card border border-border rounded-xl px-4 py-2">
          Showing default metrics (backend unavailable).
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Accuracy" value={formatPct(kpis?.accuracy)} />
        <KpiCard label="F1 Score" value={formatPct(kpis?.f1)} />
        <KpiCard label="ROC-AUC" value={formatPct(kpis?.rocAuc)} />
        <KpiCard label="Churn Rate" value={formatPct(kpis?.churnRate)} />
        <KpiCard label="Test Samples" value={kpis?.samples != null ? kpis.samples.toLocaleString() : '—'} />
      </div>

      {(latestPrediction != null && (latestPrediction.score != null || latestPrediction.proba != null)) && (
        <Card title="Latest prediction (current session)">
          <div className="flex flex-wrap items-center gap-3">
            <Badge status={latestPrediction.label === 'CHURN' ? 'warning' : 'success'}>
              {latestPrediction.label}
            </Badge>
            <span className="text-text font-medium">
              Probability: {formatPct(latestPrediction.score ?? latestPrediction.proba)}
            </span>
            {(latestPrediction.model_version ?? latestPrediction.modelVersion) && (
              <span className="text-muted text-sm">
                Model: {latestPrediction.model_version ?? latestPrediction.modelVersion}
              </span>
            )}
          </div>
        </Card>
      )}

      {recentWithPredictions.length > 0 && (
        <Card title="Last 10 session predictions">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-muted" scope="col">Session</th>
                  <th className="text-center py-2 px-2 font-medium text-muted" scope="col">Label</th>
                  <th className="text-center py-2 px-2 font-medium text-muted" scope="col">Score</th>
                  <th className="text-right py-2 px-2 font-medium text-muted" scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentWithPredictions.map((s) => {
                  const p = s.prediction
                  const score = p?.score ?? p?.proba
                  return (
                    <tr key={s.id} className="border-t border-border/50">
                      <td className="py-2 px-2 font-medium text-text">{s.title ?? 'Session'}</td>
                      <td className="py-2 px-2 text-center">
                        <Badge status={p?.label === 'CHURN' ? 'warning' : 'success'}>{p?.label ?? '—'}</Badge>
                      </td>
                      <td className="py-2 px-2 text-center">{score != null ? formatPct(score) : '—'}</td>
                      <td className="py-2 px-2 text-right text-muted">{formatDate(s.updatedAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Confusion Matrix">
            <ConfusionMatrixGrid labels={confusionMatrix?.labels} matrix={confusionMatrix?.matrix} />
          </Card>
          <Card title="Model Info">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted">Version</dt>
                <dd className="font-medium text-text">{model?.version ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Last trained</dt>
                <dd className="font-medium text-text">{formatDate(model?.lastTrainedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Last evaluated</dt>
                <dd className="font-medium text-text">{formatDate(model?.lastEvaluatedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Dataset</dt>
                <dd className="font-medium text-text">{model?.dataset ?? '—'}</dd>
              </div>
              {model?.notes && (
                <div>
                  <dt className="text-muted">Notes</dt>
                  <dd className="font-medium text-text">{model.notes}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="ROC Curve">
            {rocCurve?.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rocCurve} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" dataKey="fpr" domain={[0, 1]} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted" />
                    <YAxis type="number" dataKey="tpr" domain={[0, 1]} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted" />
                    <Tooltip
                      formatter={([v]) => [(v * 100).toFixed(2) + '%']}
                      labelFormatter={(_, payload) => payload?.[0] && `FPR: ${(payload[0].payload.fpr * 100).toFixed(1)}%`}
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem' }}
                    />
                    <Line type="monotone" dataKey="tpr" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted">No ROC curve data.</p>
            )}
          </Card>
          <Card title="Feature Importance">
            {featureImportance?.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureImportance}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted" />
                    <YAxis type="category" dataKey="feature" width={100} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted" />
                    <Tooltip
                      formatter={([v]) => [(v * 100).toFixed(1) + '%']}
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem' }}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]} fill="var(--color-accent)">
                      {featureImportance.map((_, i) => (
                        <Cell key={i} fill="var(--color-accent)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted">No feature importance data.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
