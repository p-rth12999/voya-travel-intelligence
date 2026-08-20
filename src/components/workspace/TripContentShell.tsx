'use client'

import { ReactNode } from 'react'
import { useChatPanel } from './ChatPanelContext'

export default function TripContentShell({ children }: { children: ReactNode }) {
  const { isOpen } = useChatPanel()
  return (
    <div className={`flex-1 transition-[margin] duration-300 ease-in-out ${isOpen ? 'lg:mr-[28rem]' : ''}`}>
      {children}
    </div>
  )
}