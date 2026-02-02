export async function getModelMetrics() {
  const res = await fetch('/api/model/metrics')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function getFeatureImportance() {
  const res = await fetch('/api/model/feature-importance')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}
