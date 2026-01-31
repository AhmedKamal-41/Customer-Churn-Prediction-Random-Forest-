import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'churn_demo_mode'

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const DemoModeContext = createContext(null)

export function DemoModeProvider({ children }) {
  const [demoModeEnabled, setDemoModeEnabledState] = useState(readStored)

  const enableDemoMode = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setDemoModeEnabledState(true)
  }, [])

  const disableDemoMode = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setDemoModeEnabledState(false)
  }, [])

  const value = {
    demoModeEnabled,
    enableDemoMode,
    disableDemoMode,
  }

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext)
  return (
    ctx || {
      demoModeEnabled: false,
      enableDemoMode: () => {},
      disableDemoMode: () => {},
    }
  )
}
