import { useState, useEffect, useCallback } from 'react'
import { getHealth } from '../api/churnApi'

const POLL_INTERVAL_MS = 10000
const FORCE_OFFLINE = import.meta.env.VITE_FORCE_OFFLINE === '1'

export function useBackendStatus() {
  const [online, setOnline] = useState(FORCE_OFFLINE ? false : null)
  const [lastOnlineAt, setLastOnlineAt] = useState(null)
  const [lastCheckedAt, setLastCheckedAt] = useState(() => new Date().toISOString())
  const [failures, setFailures] = useState(FORCE_OFFLINE ? 1 : 0)

  const check = useCallback(() => {
    if (FORCE_OFFLINE) {
      setOnline(false)
      setLastCheckedAt(new Date().toISOString())
      setFailures((f) => f + 1)
      return
    }
    setLastCheckedAt(new Date().toISOString())
    getHealth()
      .then(() => {
        setOnline(true)
        setLastOnlineAt(new Date().toISOString())
        setFailures(0)
      })
      .catch(() => {
        setOnline(false)
        setFailures((f) => f + 1)
      })
  }, [])

  useEffect(() => {
    if (FORCE_OFFLINE) return
    check()
    const t = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [check])

  const retry = useCallback(() => check(), [check])

  return {
    online: FORCE_OFFLINE ? false : online,
    lastOnlineAt: FORCE_OFFLINE ? null : lastOnlineAt,
    lastCheckedAt,
    failures: FORCE_OFFLINE ? 1 : failures,
    retry,
  }
}
