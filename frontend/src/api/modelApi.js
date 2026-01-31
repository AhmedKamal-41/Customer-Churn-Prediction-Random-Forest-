const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function getModelMetrics() {
  const res = await fetch(`${baseUrl}/api/model/metrics`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}
