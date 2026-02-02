import { demoPredict } from '../demo/demoPredict'

export async function getHealth() {
  const res = await fetch('/api/health')
  if (import.meta.env.DEV) console.log('[API] GET /api/health', res.status)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}

export async function predict(body) {
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Request failed: ${res.status}`)
    }
    return res.json()
  } catch (err) {
    if (err.message && (err.message.startsWith('Request failed:') || err.message === 'Health check failed')) throw err
    throw new Error("I couldn't reach the backend. Please try again.")
  }
}

/**
 * Try real backend first; on failure, use demo prediction if demo mode is on, else throw.
 * This ensures "Confirm & Predict" always attempts the backend (no reliance on health check).
 * @param {object} body - Predict request body
 * @param {{ online?: boolean, demoModeEnabled: boolean }} opts
 * @returns {Promise<object>} - { label, score, votes?, explanation, demo? }
 */
export async function predictSmart(body, { demoModeEnabled }) {
  try {
    const result = await predict(body)
    return { ...result, demo: false }
  } catch (err) {
    if (demoModeEnabled) return Promise.resolve(demoPredict(body))
    throw err
  }
}

export async function getMetadata() {
  try {
    const res = await fetch('/api/metadata')
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
