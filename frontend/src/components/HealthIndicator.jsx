import { useState, useEffect } from 'react'
import { getHealth } from '../api/client'

export function HealthIndicator() {
  const [status, setStatus] = useState('checking') // checking | ok | fail

  useEffect(() => {
    getHealth()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('fail'))
  }, [])

  if (status === 'checking') return <span className="health checking">Checking…</span>
  if (status === 'ok') return <span className="health ok">API OK</span>
  return <span className="health fail">API offline</span>
}
