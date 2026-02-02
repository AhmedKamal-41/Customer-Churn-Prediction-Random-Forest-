const baseUrl = (() => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  if (url && !/^https?:\/\//i.test(url)) return 'https://' + url
  return url
})()

export async function getModelMetrics() {
  const res = await fetch(`${baseUrl}/api/model/metrics`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function getFeatureImportance() {
  const res = await fetch(`${baseUrl}/api/model/feature-importance`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}
