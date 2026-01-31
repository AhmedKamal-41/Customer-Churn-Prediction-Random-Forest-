/**
 * Deterministic demo prediction matching baseline rules.
 * Returns same shape as backend: { label, score, votes?, explanation, demo: true }.
 * @param {{ age, tenure, monthlyCharges, contract, internetService, paymentDelay }} body
 * @returns {{ label: string, score: number, votes: number, explanation: Array<{ feature: string, reason: string }>, demo: true }}
 */
export function demoPredict(body) {
  let score = 0.3
  const explanation = []

  if (body.contract === 'Month-to-month') {
    score += 0.2
    explanation.push({ feature: 'contract', reason: 'Month-to-month increases churn risk' })
  }

  const paymentDelay = Number(body.paymentDelay)
  if (!Number.isNaN(paymentDelay) && paymentDelay >= 10) {
    const delta = Math.min(0.15, 0.05 + (paymentDelay - 10) * 0.005)
    score += delta
    explanation.push({ feature: 'paymentDelay', reason: 'Payment delays signal risk' })
  }

  const tenure = Number(body.tenure)
  if (!Number.isNaN(tenure) && tenure <= 6) {
    score += 0.1
    explanation.push({ feature: 'tenure', reason: 'Low tenure suggests weak retention' })
  }

  if (body.internetService === 'Fiber optic') {
    score += 0.05
    explanation.push({ feature: 'internetService', reason: 'Fiber optic segment may have higher churn' })
  }

  score = Math.min(1, Math.max(0, score))
  const label = score >= 0.5 ? 'CHURN' : 'NO_CHURN'
  const votes = Math.round(score * 100)

  return {
    label,
    score,
    votes,
    explanation,
    demo: true,
  }
}
