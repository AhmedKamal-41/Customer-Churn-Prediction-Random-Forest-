import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import ProfilePanel from '../chat/ProfilePanel'
import InsightPanel from '../chat/InsightPanel'
import WhatIfPanel from '../chat/WhatIfPanel'
import { useChatApp } from '../chat/ChatAppContext'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import IconButton from '../ui/IconButton'
import ThemeToggle from '../ui/ThemeToggle'
import { listSessions, createSession, deleteSession } from '../storage/sessions'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { useDemoMode } from '../hooks/useDemoMode'

const nav = [
  { path: '/chat', label: 'Chat' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/about', label: 'About' },
  { path: '/model', label: 'Model' },
  { path: '/testing', label: 'Testing' },
  { path: '/batch', label: 'Batch' },
  { path: '/sessions', label: 'Sessions' },
  { path: '/automation', label: 'Automation' },
]

function BackendStatus() {
  return (
    <span aria-label="Backend live"><Badge status="success">Backend: Live</Badge></span>
  )
}

function formatSessionTime(updatedAt) {
  try {
    const d = new Date(updatedAt)
    const now = new Date()
    const diffMs = now - d
    if (diffMs < 60000) return 'Just now'
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min ago`
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function Sidebar({
  onNavigate,
  recentSessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isCreating
}) {
  return (
    <>
      <div className="px-4 py-6 border-b border-border/50">
        <Link to="/dashboard" className="font-semibold text-lg text-text no-underline hover:opacity-90" onClick={onNavigate}>
          Churn Assistant
        </Link>
      </div>

      <nav className="p-4 space-y-1 flex-1" aria-label="Main">
        {nav.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            isActive={(_, location) =>
              path === '/dashboard' ? (location.pathname === '/' || location.pathname === '/dashboard') :
              path === '/chat' ? (location.pathname === '/chat' || location.pathname.startsWith('/chat/')) :
              location.pathname === path
            }
            className={({ isActive }) =>
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors no-underline ' +
              (isActive ? 'bg-border/40 text-accent' : 'text-text hover:bg-border/30')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">Recent Sessions</span>
          <button
            type="button"
            onClick={() => { onNewSession(); onNavigate() }}
            disabled={isCreating}
            className="text-xs font-medium text-accent hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="New session"
            data-testid="new-session"
          >
            + New
          </button>
        </div>

        <ul className="space-y-1" data-testid="sessions-list">
          {recentSessions.slice(0, 5).map((session) => (
            <li key={session.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { onSelectSession(session.id); onNavigate() }}
                className={`flex-1 min-w-0 text-left rounded-xl px-3 py-2 text-sm transition-colors truncate ${
                  session.id === activeSessionId
                    ? 'bg-border/40 text-accent'
                    : 'text-text hover:bg-border/30'
                }`}
                title={session.title}
                data-testid={`session-row-${session.id}`}
              >
                <div className="text-sm font-medium truncate">{session.title || 'Untitled'}</div>
                <div className="text-xs text-muted mt-0.5">{formatSessionTime(session.updatedAt)}</div>
              </button>

              {recentSessions.length >= 1 && (
                <button
                  type="button"
                  aria-label="Delete session"
                  data-testid={`delete-session-${session.id}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession?.(session.id)
                  }}
                  className="shrink-0 rounded-xl p-2 text-muted hover:text-red-400 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  title="Remove session"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-border/50 text-xs text-muted">
        v1.0
      </div>
    </>
  )
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [reconnected, setReconnected] = useState(false)
  const reconnectedTimerRef = useRef(null)
  const prevOnlineRef = useRef(null)
  const creatingRef = useRef(false)

  const location = useLocation()
  const navigate = useNavigate()

  const { online } = useBackendStatus()
  const { demoModeEnabled, enableDemoMode, disableDemoMode } = useDemoMode()

  const {
    answers,
    prediction,
    status,
    rightTab,
    setChatState,
    activeSessionId,
    setActiveSessionId,
    flushCurrentSession,
    setCreateAndGoToNewSession,
  } = useChatApp()

  const [sessionsVersion, setSessionsVersion] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [sessionsList, setSessionsList] = useState(() => listSessions())

  const closeSidebar = () => setSidebarOpen(false)
  const closePanel = () => setPanelOpen(false)

  const activeTab = rightTab ?? 'profile'
  const setActiveTab = (tab) => setChatState((prev) => ({ ...prev, rightTab: tab }))

  const recentSessions = sessionsList
  const activeSessionIdFromUrl = location.pathname.startsWith('/chat/') ? location.pathname.slice('/chat/'.length) : null
  const activeSessionIdForSidebar = activeSessionIdFromUrl ?? activeSessionId

  const handleDeleteSession = (id) => {
    // ✅ FIX #1: flush before deleting/navigating so latest messages persist
    flushCurrentSession?.()

    deleteSession(id)
    setSessionsList((prev) => prev.filter((s) => s.id !== id))

    if (activeSessionIdForSidebar === id) {
      const remaining = listSessions()
      if (remaining.length > 0) {
        const fallbackId = remaining[0].id
        setActiveSessionId(fallbackId)
        navigate(`/chat/${fallbackId}`)
      } else {
        setActiveSessionId(null)
        navigate('/chat')
      }
    }

    setSessionsVersion((v) => v + 1)
  }

  useEffect(() => {
    if (prevOnlineRef.current === false && online === true) {
      setReconnected(true)
      if (reconnectedTimerRef.current) clearTimeout(reconnectedTimerRef.current)
      reconnectedTimerRef.current = setTimeout(() => setReconnected(false), 5000)
    }
    prevOnlineRef.current = online
    return () => {
      if (reconnectedTimerRef.current) clearTimeout(reconnectedTimerRef.current)
    }
  }, [online])

  useEffect(() => {
    if (prediction) setActiveTab('insights')
  }, [prediction])

  useEffect(() => {
    if (!prediction && activeTab === 'whatif') setActiveTab('insights')
  }, [prediction, activeTab])

  const handleNewSession = useCallback(() => {
    if (creatingRef.current) return
    creatingRef.current = true
    if (isCreating) {
      creatingRef.current = false
      return
    }
    setIsCreating(true)
    try {
      flushCurrentSession?.()
      const newSession = createSession()
      setActiveSessionId(newSession.id)
      navigate(`/chat/${newSession.id}`)
      setSessionsList(listSessions())
    } finally {
      setIsCreating(false)
      creatingRef.current = false
    }
  }, [isCreating, flushCurrentSession, setActiveSessionId, navigate])

  useEffect(() => {
    setCreateAndGoToNewSession(() => handleNewSession)
  }, [handleNewSession, setCreateAndGoToNewSession])

  const handleSelectSession = (id) => {
    // ✅ FIX #1: flush before switching so last message doesn't vanish
    flushCurrentSession?.()

    setActiveSessionId(id)
    navigate(`/chat/${id}`)
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-200">
      <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:flex-col w-full min-h-screen sticky top-0 border-r border-border bg-card/40 backdrop-blur">
          <Sidebar
            onNavigate={() => {}}
            recentSessions={recentSessions}
            activeSessionId={activeSessionIdForSidebar}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            isCreating={isCreating}
          />
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <button
              type="button"
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/40 z-10 md:hidden"
              aria-label="Close menu"
            />
            <aside
              className="fixed top-0 left-0 z-20 h-full w-[280px] flex flex-col bg-card border-r border-border shadow-xl transform transition-transform md:hidden"
              aria-label="Main navigation"
            >
              <Sidebar
                onNavigate={closeSidebar}
                recentSessions={recentSessions}
                activeSessionId={activeSessionIdForSidebar}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
                isCreating={isCreating}
              />
            </aside>
          </>
        )}

        {/* Main area */}
        <div className="flex flex-col min-h-0 min-w-0">
          {/* Header row */}
          <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-8 bg-card/95 backdrop-blur border-b border-border shadow-lg shadow-black/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <IconButton
                aria-label="Toggle menu"
                className="md:hidden"
                onClick={() => setSidebarOpen((o) => !o)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </IconButton>
              <Link to="/dashboard" className="font-semibold text-lg text-text hover:opacity-90 no-underline">
                Churn Assistant
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {(location.pathname === '/dashboard' || location.pathname === '/chat') && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNewSession(); }}
                  disabled={isCreating}
                  aria-label="New session"
                  data-testid="new-session"
                >
                  New session
                </Button>
              )}
              <BackendStatus />
              <ThemeToggle />
              <IconButton
                aria-label="Toggle profile and insight"
                className="md:hidden"
                onClick={() => setPanelOpen((o) => !o)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </IconButton>
            </div>
          </header>

          {/* Content + right panel */}
          <div className="flex-1 flex min-h-0">
            <main className="flex-1 min-w-0 overflow-auto px-4 py-6 md:px-8 md:py-10">
              <div className="mx-auto w-full max-w-6xl">
                <Outlet />
              </div>
            </main>

            {/* Right panel - desktop */}
            <aside className="hidden md:flex md:flex-col w-[360px] flex-shrink-0 border-l border-border bg-card/50 overflow-auto">
              <div className="flex flex-col h-full">
                <div className="flex border-b border-border flex-shrink-0" role="tablist" data-testid="report-tabs">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'profile' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'insights'}
                    onClick={() => setActiveTab('insights')}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'insights' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text'
                    }`}
                  >
                    Insights
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'whatif'}
                    aria-disabled={!prediction}
                    onClick={() => prediction && setActiveTab('whatif')}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      !prediction ? 'opacity-50 cursor-not-allowed text-muted' : ''
                    } ${
                      activeTab === 'whatif' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text'
                    }`}
                  >
                    What-If
                  </button>
                </div>
                <div className="p-4 space-y-4 overflow-auto flex-1">
                  {activeTab === 'profile' && <ProfilePanel answers={answers} />}
                  {activeTab === 'insights' && (
                    <InsightPanel prediction={prediction} status={status} answers={answers} />
                  )}
                  {activeTab === 'whatif' && prediction && (
                    <WhatIfPanel baseAnswers={answers} basePrediction={prediction} />
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile right panel drawer */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closePanel} aria-hidden="true" />
          <aside
            className="fixed top-14 right-0 bottom-0 w-full max-w-sm z-50 bg-card border-l border-border overflow-auto md:hidden shadow-xl"
            aria-label="Customer profile and insight"
          >
            <div className="p-4 flex justify-between items-center border-b border-border">
              <h2 className="font-semibold text-text">Profile & Insight</h2>
              <IconButton aria-label="Close panel" onClick={closePanel}>
                ✕
              </IconButton>
            </div>
            <div className="flex border-b border-border" role="tablist" data-testid="report-tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'insights'}
                onClick={() => setActiveTab('insights')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'insights' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text'
                }`}
              >
                Insights
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'whatif'}
                aria-disabled={!prediction}
                onClick={() => prediction && setActiveTab('whatif')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  !prediction ? 'opacity-50 cursor-not-allowed text-muted' : ''
                } ${
                  activeTab === 'whatif' ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text'
                }`}
              >
                What-If
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-auto">
              {activeTab === 'profile' && <ProfilePanel answers={answers} />}
              {activeTab === 'insights' && (
                <InsightPanel prediction={prediction} status={status} answers={answers} />
              )}
              {activeTab === 'whatif' && prediction && (
                <WhatIfPanel baseAnswers={answers} basePrediction={prediction} />
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
