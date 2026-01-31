import { useState, useLayoutEffect } from 'react'

const THEME_KEY = 'churn-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function setTheme(value) {
    setThemeState(value === 'dark' || value === 'light' ? value : theme)
  }

  function toggleTheme() {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return { theme, setTheme, toggleTheme }
}
