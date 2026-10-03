'use client'

import { RefObject } from 'react'
import { Send, Sparkles, RotateCcw } from 'lucide-react'
import CompassSpinner from '@/components/shared/CompassSpinner'
import StartLocationBox, { ResolvedLocation } from './StartLocationBox'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

type Props = {
  messages: ChatMessage[]
  loading: boolean
  input: string
  setInput: (v: string) => void
  onSend: () => void
  onSuggestionClick: (text: string) => void
  onStartOver: () => void
  scrollRef: RefObject<HTMLDivElement | null>
  startLocation: ResolvedLocation | null
  onLocationChange: (loc: ResolvedLocation | null) => void
}

export default function TemplateChatColumn({
  messages,
  loading,
  input,
  setInput,
  onSend,
  onSuggestionClick,
  onStartOver,
  scrollRef,
  startLocation,
  onLocationChange,
}: Props) {
  const hasStarted = messages.length > 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 lg:px-10">
        <StartLocationBox location={startLocation} onChange={onLocationChange} />
        {hasStarted && (
          <button
            onClick={onStartOver}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-sand/15 px-3 py-1 text-xs text-sand/60 transition hover:bg-sand/5 hover:text-cream"
          >
            <RotateCcw className="h-3 w-3" /> Start Over
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 lg:px-10">
        {!hasStarted ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles className="mb-4 h-8 w-8 text-brass" />
            <h1 className="font-serif text-2xl font-semibold text-cream lg:text-3xl">
              Plan your next trip...
            </h1>
            <p className="mt-2 max-w-md text-sm text-sand/60">
              Describe a trip idea in your own words — I&apos;ll turn it into a template as we chat.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-brass text-navy-dark' : 'bg-sand/10 text-sand'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => onSuggestionClick(s)}
                        className="rounded-full border border-brass/40 bg-brass/10 px-3 py-1.5 text-xs text-sand transition hover:bg-brass/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-sand/10 px-4 py-2.5 text-sm text-sand/60">
                  <CompassSpinner className="h-3.5 w-3.5" /> Thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-sand/10 px-4 py-4 lg:px-10">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-sand/15 bg-sand/5 px-4 py-2 backdrop-blur">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Describe your trip idea..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-cream placeholder:text-sand/40 focus:outline-none"
            style={{ color: '#faf6ee', colorScheme: 'dark' }}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass text-navy-dark transition hover:bg-brass/90 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}