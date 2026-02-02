import { demoPredict } from '../demo/demoPredict'

const baseUrl = (() => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  if (url && !/^https?:\/\//i.test(url)) return 'https://' + url
  return url
})()

export async function getHealth() {
  const url = `${baseUrl}/api/health`
  const res = await fetch(url)
  if (import.meta.env.DEV) console.log('[API] GET', url, res.status)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}

export async function predict(body) {
  try {
    const res = await fetch(`${baseUrl}/api/predict`, {
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
    if (err.message && err.message.startsWith('Request failed:')) throw err
    throw new Error("I couldn't reach the backend. Please try again.")
  }
}

/**
 * Predict using backend when online and not in demo mode; otherwise use demo prediction.
 * @param {object} body - Predict request body
 * @param {{ online: boolean, demoModeEnabled: boolean }} opts
 * @returns {Promise<object>} - { label, score, votes?, explanation, demo? }
 */
export async function predictSmart(body, { online, demoModeEnabled }) {
  if (online && !demoModeEnabled) {
    const result = await predict(body)
    return { ...result, demo: false }
  }
  return Promise.resolve(demoPredict(body))
}

export async function getMetadata() {
  try {
    const res = await fetch(`${baseUrl}/api/metadata`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
