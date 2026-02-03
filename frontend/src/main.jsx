import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/app.css'

// Start E2E mocks in background when VITE_E2E=true; never block app mount
if (import.meta.env.VITE_E2E === 'true') {
  import('./mocks/browser.js')
    .then(({ startE2EMocks }) => startE2EMocks())
    .catch((e) => {
      if (import.meta.env.DEV) console.warn('[E2E] Mocks not loaded:', e.message)
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
