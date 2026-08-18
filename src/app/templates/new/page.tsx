'use client'

import { useState, useRef, useEffect } from 'react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import Sidebar from '@/components/dashboard/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TemplateDraft } from '@/lib/validations/template-draft-ai'
import { buildDestinationMeta } from '@/lib/geo/geocode'
import TemplateChatColumn from '@/components/templates/TemplateChatColumn'
import TemplateDraftPanel from '@/components/templates/TemplateDraftPanel'
import { ResolvedLocation } from '@/components/templates/StartLocationBox'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

type SavedState = {
  messages: ChatMessage[]
  draft: TemplateDraft
  questionsAsked: number
  readyToCreate: boolean
  startLocation: ResolvedLocation | null
}

const EMPTY_DRAFT: TemplateDraft = {
  title: null,
  description: null,
  destinations: [],
  transportMode: null,
  interests: [],
  tags: [],
  durationDaysMin: null,
  durationDaysMax: null,
  isInternational: null,
}

const STORAGE_KEY = 'voya-template-maker-draft'

function loadSaved(): SavedState | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function bucketForDuration(days: number): string {
  if (days <= 1) return '1_day'
  if (days <= 4) return '3_day'
  if (days <= 9) return '7_day'
  return '15_day'
}

export default function TemplateMakerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadSaved()?.messages || [])
  const [draft, setDraft] = useState<TemplateDraft>(() => loadSaved()?.draft || EMPTY_DRAFT)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionsAsked, setQuestionsAsked] = useState<number>(() => loadSaved()?.questionsAsked || 0)
  const [readyToCreate, setReadyToCreate] = useState<boolean>(() => loadSaved()?.readyToCreate || false)
  const [startLocation, setStartLocation] = useState<ResolvedLocation | null>(() => loadSaved()?.startLocation || null)
  const [creating, setCreating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (messages.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, draft, questionsAsked, readyToCreate, startLocation }))
    } catch {
      // storage full or unavailable — not critical, fail silently
    }
  }, [messages, draft, questionsAsked, readyToCreate, startLocation])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleStartOver() {
    localStorage.removeItem(STORAGE_KEY)
    setMessages([])
    setDraft(EMPTY_DRAFT)
    setQuestionsAsked(0)
    setReadyToCreate(false)
    setInput('')
    // startLocation intentionally preserved — that's about where you are, not the conversation
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    if (!overrideText) setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch('/api/template-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDraft: draft,
          latestMessage: text,
          questionsAsked,
          recentHistory: messages,
          startLocation,
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      setDraft(data.draft)
      setReadyToCreate(data.readyToCreate)

      if (data.clarifyingQuestion) {
        setQuestionsAsked((prev) => prev + 1)
        setMessages((prev) => [...prev, { role: 'assistant', content: data.clarifyingQuestion, suggestions: data.destinationSuggestions }])
      } else if (data.readyToCreate) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I've got what I need — take a look at the draft and hit Create Template when you're ready, or keep chatting to refine it.",
            suggestions: data.destinationSuggestions,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Got it — tell me more, or ask me to adjust anything.', suggestions: data.destinationSuggestions },
        ])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong on my end — mind trying that again?' }])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (creating) return
    setCreating(true)

    const durationDaysMin = draft.durationDaysMin ?? 3
    const durationDaysMax = draft.durationDaysMax ?? durationDaysMin

    const destinationMeta = await buildDestinationMeta(draft.destinations)
    const primary = destinationMeta.find((d) => d.lat !== null && d.lon !== null)

    if (!primary) {
      setCreating(false)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I couldn't pin down a real location for this trip — mind naming a more specific destination?" },
      ])
      return
    }

    const imageSeed =
      (draft.title || 'trip').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 7)

    const { data, error } = await supabase
      .from('trip_templates')
      .insert({
        title: draft.title || 'Untitled Trip',
        description: draft.description || '',
        destinations: draft.destinations,
        region: primary.destination,
        state: '',
        country: primary.country || '',
        transport_mode: draft.transportMode,
        interests: draft.interests,
        tags: draft.tags,
        duration_days_min: durationDaysMin,
        duration_days_max: durationDaysMax,
        duration_bucket: bucketForDuration(durationDaysMin),
        is_international: draft.isInternational ?? false,
        popularity_score: 0,
        latitude: primary.lat,
        longitude: primary.lon,
        image_seed: imageSeed,
        ai_generated: true,
      })
      .select()
      .single()

    setCreating(false)

    if (error || !data) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Couldn't save the template — mind trying again?" }])
      return
    }

    localStorage.removeItem(STORAGE_KEY)
    router.push(`/trips/new?template=${data.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1832] lg:flex-row">
      <Sidebar />

      {/* Mobile: stacked, not resizable */}
      <div className="flex flex-1 flex-col lg:hidden">
        <div className="flex-1">
          <TemplateChatColumn
            messages={messages}
            loading={loading}
            input={input}
            setInput={setInput}
            onSend={() => handleSend()}
            onSuggestionClick={(s) => handleSend(s)}
            onStartOver={handleStartOver}
            scrollRef={scrollRef}
            startLocation={startLocation}
            onLocationChange={setStartLocation}
          />
        </div>
        <div className="border-t border-white/10">
          <TemplateDraftPanel draft={draft} readyToCreate={readyToCreate} creating={creating} onCreate={handleCreate} />
        </div>
      </div>

      {/* Desktop: resizable split-screen */}
      <div className="hidden flex-1 lg:flex">
        <PanelGroup orientation="horizontal" className="h-full">
          <Panel defaultSize="70%" minSize="45%">
            <TemplateChatColumn
              messages={messages}
              loading={loading}
              input={input}
              setInput={setInput}
              onSend={() => handleSend()}
              onSuggestionClick={(s) => handleSend(s)}
              onStartOver={handleStartOver}
              scrollRef={scrollRef}
              startLocation={startLocation}
              onLocationChange={setStartLocation}
            />
          </Panel>
          <PanelResizeHandle className="w-1 bg-white/10 transition hover:bg-blue-500/50 active:bg-blue-500" />
          <Panel defaultSize="30%" minSize="22%" maxSize="45%">
            <TemplateDraftPanel draft={draft} readyToCreate={readyToCreate} creating={creating} onCreate={handleCreate} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}