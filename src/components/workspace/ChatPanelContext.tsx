'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type ChatPanelContextValue = {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null)

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return <ChatPanelContext.Provider value={{ isOpen, setIsOpen }}>{children}</ChatPanelContext.Provider>
}

export function useChatPanel() {
  const ctx = useContext(ChatPanelContext)
  if (!ctx) throw new Error('useChatPanel must be used within ChatPanelProvider')
  return ctx
}