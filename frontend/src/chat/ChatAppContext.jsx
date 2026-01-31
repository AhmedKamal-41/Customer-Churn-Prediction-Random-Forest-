import { createContext, useContext } from 'react'

const ChatAppContext = createContext(null)

export function ChatAppProvider({ children, value }) {
  return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>
}

export function useChatApp() {
  const ctx = useContext(ChatAppContext)
  return (
    ctx || {
      answers: {},
      prediction: null,
      status: 'collecting',
      rightTab: 'profile',
      activeSessionId: null,
      setActiveSessionId: () => {},
      resetChat: () => {},
      setChatState: () => {},
      setResetChatFn: () => {},
    }
  )
}
