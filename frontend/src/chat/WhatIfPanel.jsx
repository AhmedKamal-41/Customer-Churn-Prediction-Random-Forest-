import { useState, useEffect, useRef } from 'react'
import { STEPS, STEP_CONFIG, validateAnswer } from './chatFlow'
import { buildPredictBody } from './chatReducer'
import { predictSmart } from '../api/churnApi'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { useDemoMode } from '../hooks/useDemoMode'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

function getShortLabel(stepKey) {
  return stepKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

export default function WhatIfPanel({ baseAnswers, basePrediction }) {
  const { online } = useBackendStatus()
  const { demoModeEnabled } = useDemoMode()
  const [whatIfInputs, setWhatIfInputs] = useState(() => ({ ...baseAnswers }))
  const [whatIfResult, setWhatIfResult] = useState(basePrediction ? { ...basePrediction } : null)
  const [whatIfStatus, setWhatIfStatus] = useState('idle')
  const [whatIfError, setWhatIfError] = useState(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const lastBodyStrRef = useRef('')

  const debouncedInputs = useDebouncedValue(whatIfInputs, 400)

  // Sync when base data changes (e.g. new prediction)
  useEffect(() => {
    setWhatIfInputs({ ...baseAnswers })
    setWhatIfResult(basePrediction ? { ...basePrediction } : null)
    setWhatIfStatus('idle')
    setWhatIfError(null)
    lastBodyStrRef.current = JSON.stringify(buildPredictBody(baseAnswers))
  }, [baseAnswers, basePrediction])

  // Re-score when debounced inputs are valid and changed
  useEffect(() => {
    if (!basePrediction) return
    const body = {}
    let allValid = true
    for (const stepKey of STEPS) {
      const v = debouncedInputs[stepKey]
      const res = validateAnswer(stepKey, v)
      if (!res.valid) {
        allValid = false
        break
      }
      body[stepKey] = res.value
    }
    if (!allValid) return
    const bodyStr = JSON.stringify(buildPredictBody(body))
    if (bodyStr === lastBodyStrRef.current) return
    lastBodyStrRef.current = bodyStr
    setWhatIfStatus('loading')
    setWhatIfError(null)
    predictSmart(buildPredictBody(body), { online, demoModeEnabled })
      .then((res) => {
        setWhatIfResult(res)
        setWhatIfStatus('idle')
        setLastUpdatedAt(Date.now())
      })
      .catch((err) => {
        setWhatIfStatus('error')
        setWhatIfError(err.message || 'Update failed.')
      })
  }, [debouncedInputs, basePrediction, online, demoModeEnabled])

  const handleReset = () => {
    setWhatIfInputs({ ...baseAnswers })
    setWhatIfResult(basePrediction ? { ...basePrediction } : null)
    setWhatIfStatus('idle')
    setWhatIfError(null)
    lastBodyStrRef.current = JSON.stringify(buildPredictBody(baseAnswers))
  }

  const handleFieldChange = (stepKey, value) => {
    setWhatIfInputs((prev) => ({ ...prev, [stepKey]: value }))
  }

  const score = whatIfResult?.score ?? 0
  const riskPct = Math.round(score * 100)
  const baseScore = basePrediction?.score ?? 0
  const deltaPctPoints = Math.round((score - baseScore) * 100)
  const isChurn = whatIfResult?.label === 'CHURN'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-semibold text-text">What-If Playground</h2>
        <Button variant="ghost" onClick={handleReset} className="text-xs">
          Reset to current answers
        </Button>
      </div>

      <Card title="Controls">
        {STEPS.map((stepKey) => {
          const config = STEP_CONFIG[stepKey]
          const value = whatIfInputs[stepKey]
          const validation = validateAnswer(stepKey, value)
          const isInvalid = !validation.valid
          if (config?.type === 'number') {
            return (
              <div key={stepKey} className="space-y-1 mb-3">
                <label className="block text-xs font-medium text-muted" htmlFor={`whatif-${stepKey}`}>
                  {getShortLabel(stepKey)}
                </label>
                <Input
                  id={`whatif-${stepKey}`}
                  type="number"
                  min={config.min}
                  max={config.max}
                  step={stepKey === 'monthlyCharges' ? 0.01 : 1}
                  value={value ?? ''}
                  onChange={(e) => handleFieldChange(stepKey, e.target.value)}
                  aria-invalid={isInvalid}
                  aria-label={getShortLabel(stepKey)}
                />
                {isInvalid && (
                  <p className="text-xs text-red-400" role="alert">
                    {validation.message}
                  </p>
                )}
              </div>
            )
          }
          if (config?.type === 'enum') {
            return (
              <div key={stepKey} className="space-y-1 mb-3">
                <span className="block text-xs font-medium text-muted">{getShortLabel(stepKey)}</span>
                <div className="flex flex-wrap gap-2">
                  {config.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleFieldChange(stepKey, opt)}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                        value === opt
                          ? 'border-accent bg-accent/20 text-accent'
                          : 'border-border bg-card text-text hover:bg-border/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {isInvalid && (
                  <p className="text-xs text-red-400" role="alert">
                    {validation.message}
                  </p>
                )}
              </div>
            )
          }
          return null
        })}
      </Card>

      <Card title="What-If Risk Score">
        {whatIfStatus === 'loading' && (
          <p className="text-sm text-muted mb-2">Updating…</p>
        )}
        {whatIfError && (
          <div className="mb-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400" role="alert">
            Update failed: {whatIfError}
          </div>
        )}
        {whatIfResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-2xl font-semibold text-text">{riskPct}%</span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    isChurn ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {whatIfResult.label ?? (isChurn ? 'CHURN' : 'NO_CHURN')}
                </span>
              </div>
              {deltaPctPoints !== 0 && (
                <span
                  className={`text-xs font-medium ${
                    deltaPctPoints > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {deltaPctPoints > 0 ? '+' : ''}{deltaPctPoints} pts
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-card overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, riskPct))}%` }}
              />
            </div>
            {lastUpdatedAt && whatIfStatus === 'idle' && (
              <p className="text-xs text-muted">Updated just now</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
