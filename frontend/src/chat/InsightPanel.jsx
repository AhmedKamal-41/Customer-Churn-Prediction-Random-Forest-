import { useState } from 'react'
import Card from '../ui/Card'
import { generateRetentionPlan } from './retentionPlan'
import ActionPlanCard from './ActionPlanCard'

function getRiskPill(score) {
  if (score < 0.35) return { label: 'Low', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
  if (score <= 0.65) return { label: 'Medium', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
  return { label: 'High', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
}

function getTopDrivers(prediction, answers) {
  const fromExplanation =
    prediction.explanation?.length > 0
      ? prediction.explanation.slice(0, 3).map((item) => `${item.feature}: ${item.reason}`)
      : []
  if (fromExplanation.length > 0) return fromExplanation

  const heuristics = []
  if (answers.contract === 'Month-to-month') {
    heuristics.push('Month-to-month contract increases churn risk')
  }
  const delay = Number(answers.paymentDelay)
  if (!Number.isNaN(delay) && delay > 14) {
    heuristics.push('Recent payment delays signal risk')
  }
  const tenure = Number(answers.tenure)
  if (!Number.isNaN(tenure) && tenure < 12) {
    heuristics.push('Low tenure suggests weak retention')
  }
  if (answers.internetService === 'Fiber optic') {
    heuristics.push('Fiber optic segment may have higher churn')
  }
  if (heuristics.length < 3 && delay > 7 && delay <= 14 && !heuristics.some((h) => h.includes('payment'))) {
    heuristics.push('Recent payment delays signal risk')
  }
  return heuristics.slice(0, 3)
}

function getConfidence(prediction) {
  const votes = prediction.votes
  if (votes != null && typeof votes === 'number' && votes > 0) {
    const confidence = Math.min(0.95, 0.5 + (votes / 100) * 0.5)
    return Math.round(confidence * 100)
  }
  const score = prediction.score ?? 0.5
  const confidence = Math.min(1, Math.max(0, Math.abs(score - 0.5) * 2))
  return Math.round(confidence * 100)
}

export default function InsightPanel({ prediction, status, answers = {} }) {
  const [copyFeedback, setCopyFeedback] = useState(false)
  const show = status === 'done' && prediction
  if (!show) {
    return (
      <Card title="Insights">
        <p className="text-sm text-muted">Complete a prediction to see insights.</p>
      </Card>
    )
  }

  const score = prediction.score ?? 0
  const riskPct = Math.round(score * 100)
  const pill = getRiskPill(score)
  const topDrivers = getTopDrivers(prediction, answers)
  const confidencePct = getConfidence(prediction)
  const drivers =
    prediction.explanation?.length > 0
      ? prediction.explanation.slice(0, 3).map((item) => `${item.feature}: ${item.reason}`)
      : topDrivers
  const plan = generateRetentionPlan({ answers, prediction, drivers })

  const handleCopy = () => {
    const text =
      'Retention Action Plan\n\n' +
      plan.actions
        .map((a, i) => `${i + 1}) [${a.priority}] ${a.title} — ${a.rationale} (Impact: ${a.impact})`)
        .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    })
  }

  const handleExportJson = () => {
    const payload = { answers, prediction, actions: plan.actions, summaryText: plan.summaryText }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plan.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card title="Risk Score">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-2xl font-semibold text-text">{riskPct}%</span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${pill.className}`}
              >
                {pill.label}
              </span>
              {prediction.demo === true && (
                <span className="inline-flex items-center rounded border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                  DEMO
                </span>
              )}
            </div>
          </div>
          {prediction.demo === true && (
            <p className="text-xs text-muted">Backend unavailable — demo estimate.</p>
          )}
          <div className="h-2 rounded-full bg-card overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${riskPct}%` }}
            />
          </div>
        </div>
      </Card>

      <Card title="Top Drivers">
        {topDrivers.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-text">
            {topDrivers.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No drivers available.</p>
        )}
      </Card>

      <Card title="Confidence">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-text">{confidencePct}%</p>
          <p className="text-xs text-muted">Based on model agreement.</p>
        </div>
      </Card>

      <ActionPlanCard
        plan={plan}
        isChurn={prediction?.label === 'CHURN'}
        onCopy={handleCopy}
        onExportJson={handleExportJson}
        copyFeedback={copyFeedback}
      />
    </div>
  )
}
