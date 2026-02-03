export async function getHealth() {
  const res = await fetch('/api/health')
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
