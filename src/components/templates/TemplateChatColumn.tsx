'use client'

import { RefObject } from 'react'
import { Send, Sparkles, Loader2, RotateCcw } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  messages: ChatMessage[]
  loading: boolean
  input: string
  setInput: (v: string) => void
  onSend: () => void
  onStartOver: () => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export default function TemplateChatColumn({ messages, loading, input, setInput, onSend, onStartOver, scrollRef }: Props) {
  const hasStarted = messages.length > 0

  return (
    <div className="flex h-full flex-col">
      {hasStarted && (
        <div className="flex justify-end px-4 pt-4 lg:px-10">
          <button
            onClick={onStartOver}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-blue-100/60 transition hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Start Over
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 lg:px-10">
        {!hasStarted ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles className="mb-4 h-8 w-8 text-blue-300" />
            <h1 className="text-2xl font-semibold text-white lg:text-3xl">
              Plan your next trip...
            </h1>
            <p className="mt-2 max-w-md text-sm text-blue-100/60">
              Describe a trip idea in your own words — I&apos;ll turn it into a template as we chat.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-50'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-blue-100/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-4 lg:px-10">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Describe your trip idea..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-blue-100/40 focus:outline-none"
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}