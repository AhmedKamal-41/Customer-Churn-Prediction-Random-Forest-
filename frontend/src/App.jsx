import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatAppProvider } from './chat/ChatAppContext'
import AppShell from './app/AppShell'
import ChatPage from './pages/ChatPage'
import AboutPage from './pages/AboutPage'
import ModelPage from './pages/ModelPage'
import TestingPage from './pages/TestingPage'
import BatchPage from './pages/BatchPage'
import SessionsPage from './pages/SessionsPage'
import DashboardPage from './pages/DashboardPage'
import { getActiveSessionId, setActiveSessionId as setActiveSessionIdStorage } from './storage/sessions'
import { DemoModeProvider } from './hooks/useDemoMode'

const initialChatState = {
  answers: {},
  prediction: null,
  status: 'collecting',
  rightTab: 'profile',
}

function App() {
  const [chatState, setChatState] = useState(initialChatState)
  const [resetChatFn, setResetChatFn] = useState(() => () => {})
  const [activeSessionId, setActiveSessionIdState] = useState(() => getActiveSessionId())

  const setActiveSessionId = (id) => {
    setActiveSessionIdStorage(id)
    setActiveSessionIdState(id)
  }

  const chatValue = {
    ...chatState,
    setChatState: (updater) => {
      setChatState((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }))
    },
    resetChat: () => {
      setChatState(initialChatState)
      resetChatFn()
    },
    setResetChatFn: (fn) => setResetChatFn(() => fn),
    activeSessionId,
    setActiveSessionId,
  }

  return (
    <BrowserRouter>
      <DemoModeProvider>
        <ChatAppProvider value={chatValue}>
          <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<ChatPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="model" element={<ModelPage />} />
            <Route path="testing" element={<TestingPage />} />
            <Route path="batch" element={<BatchPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sessions" element={<SessionsPage />} />
          </Route>
          </Routes>
        </ChatAppProvider>
      </DemoModeProvider>
    </BrowserRouter>
  )
}

export default App
