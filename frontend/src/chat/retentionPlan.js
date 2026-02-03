/**
 * Generates a retention action plan from answers, prediction, and top drivers.
 * @param {{ answers: object, prediction: object, drivers: string[] }} params
 * @returns {{ actions: Array<{ id: string, priority: string, title: string, rationale: string, impact: string, tags: string[] }>, summaryText: string }}
 */
export function generateRetentionPlan({ answers, prediction, drivers }) {
  const actions = []
  const seenTitles = new Set()

  function addAction(priority, title, rationale, impact, tags = []) {
    if (seenTitles.has(title)) return
    seenTitles.add(title)
    actions.push({
      id: `action-${actions.length + 1}`,
      priority,
      title,
      rationale,
      impact,
      tags,
    })
  }

  const label = prediction?.label
  const isChurn = label === 'CHURN'

  if (isChurn) {
    if (answers.contract === 'Month-to-month') {
      addAction(
        'High',
        'Offer 12-month plan discount',
        'Month-to-month contracts are associated with higher churn; a committed plan with a discount can improve retention.',
        'High',
        ['contract']
      )
    }
    const paymentDelay = Number(answers.paymentDelay)
    if (!Number.isNaN(paymentDelay) && paymentDelay >= 10) {
      addAction(
        'High',
        'Enable autopay + payment reminders',
        `Payment delay of ${paymentDelay} days suggests billing friction; autopay and reminders can reduce late payments.`,
        'High',
        ['billing']
      )
    }
    const tenure = Number(answers.tenure)
    if (!Number.isNaN(tenure) && tenure <= 6) {
      addAction(
        'Medium',
        'First-90-days onboarding call',
        'New customers (6 months or less) benefit from proactive onboarding to reinforce value and reduce early churn.',
        'Medium',
        ['onboarding']
      )
    }
    const monthlyCharges = Number(answers.monthlyCharges)
    if (!Number.isNaN(monthlyCharges) && monthlyCharges >= 80) {
      addAction(
        'Medium',
        'Review plan fit / right-size bundle',
        `Monthly charges ($${monthlyCharges}) may indicate plan mismatch; review usage and offer a better-fit bundle.`,
        'Medium',
        ['billing']
      )
    }
    addAction(
      'Low',
      'Customer satisfaction check-in',
      'A quick check-in helps identify issues early and reinforces the relationship.',
      'Low',
      ['engagement']
    )
  } else {
    addAction(
      'Medium',
      'Maintain engagement: loyalty rewards',
      'Low churn risk profile; loyalty rewards and engagement programs help maintain satisfaction.',
      'Medium',
      ['engagement']
    )
    addAction(
      'Low',
      'Periodic satisfaction survey',
      'Regular feedback keeps the relationship strong and surfaces opportunities.',
      'Low',
      ['engagement']
    )
  }

  const ordered = [...actions].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 }
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
  })

  const capped = ordered.slice(0, 5).map((a, i) => ({ ...a, id: `action-${i + 1}` }))

  return {
    actions: capped,
    summaryText: 'Recommended next steps based on this profile.',
  }
}
