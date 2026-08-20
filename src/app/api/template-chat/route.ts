import { openai } from '@/lib/openai/client'
import { templateChatResponseSchema } from '@/lib/validations/template-draft-ai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { NextRequest } from 'next/server'

const MAX_CLARIFYING_ROUNDS = 3
const FINISH_PHRASES = [
  'create the template', "let's create", 'lets create', 'make the template',
  'create it now', 'finish this', "that's enough", 'go ahead and create',
]

type StartLocation = { name: string; lat: number; lon: number } | null

export async function POST(req: NextRequest) {
  const { currentDraft, latestMessage, questionsAsked, recentHistory, startLocation } = (await req.json()) as {
    currentDraft: unknown
    latestMessage: string
    questionsAsked: number
    recentHistory: { role: 'user' | 'assistant'; content: string }[]
    startLocation: StartLocation
  }

  const roundsLeft = MAX_CLARIFYING_ROUNDS - (questionsAsked || 0)
  const outOfRounds = roundsLeft <= 0
  const userWantsToFinish = FINISH_PHRASES.some((p) => latestMessage.toLowerCase().includes(p))

  const historyMessages = (recentHistory || [])
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content }))

  const locationContext = startLocation
    ? `The user's starting location is ${startLocation.name} (approx coordinates ${startLocation.lat}, ${startLocation.lon}). Use this to ground "near me" / "nearby" style requests when suggesting destinations.`
    : `The user has not shared a starting location. If they describe a vibe without naming a real destination, you may still suggest well-known real destinations broadly matching that vibe, but prefer asking them to name a region or share their location if suggestions would otherwise be too generic to be useful.`

  const systemMessage = {
    role: 'system' as const,
    content: `You are a travel planning assistant helping a user build a reusable trip TEMPLATE through a short, natural conversation — not a specific booked trip.

Important scope: a template captures the general IDEA of a trip (where, roughly how long, what kind of experience). It intentionally has NO fields for exact calendar dates, budget, exact times, or number of travelers — those get filled in later when the user turns this template into a real trip. If the user mentions specific dates, budget, times, or other out-of-scope details (like hotel preferences), acknowledge them naturally and warmly in your message, without pretending you saved them, but do NOT ask follow-up questions about them and do NOT block on them.

${locationContext}

Current draft so far (merge new info into this, never discard what's already filled): ${JSON.stringify(currentDraft)}

Fields you fill: title, description, destinations (real, existing place names only — never invent one), transportMode, interests, tags, durationDaysMin, durationDaysMax, isInternational.

Destination suggestions: if the user describes a mood, vibe, or feeling without naming a real destination, propose 3-4 real, existing destinations that reasonably match — grounded in their starting location if you have one — and put them in destinationSuggestions. Otherwise leave it as an empty array.

Always write a natural, conversational "message" — this is what gets shown in the chat, every single turn, whether or not you're asking something. Never leave it generic or repeat the same wording turn after turn. If the user asks something out of scope (like hotel preferences), respond to it warmly and specifically in the message, then gently steer back to the template itself if needed.

Clarifying questions: set askedQuestion to true only when your message is genuinely asking about a missing destination or duration — never about dates, budget, or times. You have ${roundsLeft} round(s) of these left before you must stop asking and fill gaps with sensible defaults instead. Never repeat a question that's already been effectively answered earlier in this conversation.

Readiness: once title, destinations, and a duration range are reasonably filled in, set readyToCreate to true. The first time this happens, mention in your message — briefly, warmly, not like an ending — that the draft is looking good and they can create it whenever they're happy with it, or keep chatting to adjust anything. After that, just respond naturally to whatever they say next; don't repeat that same note every turn. If the user explicitly asks you to create/finalize the template, set readyToCreate to true immediately, filling any gaps with sensible defaults, and write a short confirming message.`,
  }

  const messages = [
    systemMessage,
    ...historyMessages,
    { role: 'user' as const, content: latestMessage },
  ]

  const completion = await openai.chat.completions.parse({
    model: 'openai/gpt-4o-mini',
    max_tokens: 900,
    messages,
    response_format: zodResponseFormat(templateChatResponseSchema, 'template_chat_response'),
  })

  const parsed = completion.choices[0].message.parsed
  if (!parsed) {
    return new Response(JSON.stringify({ error: 'AI did not return a valid response.' }), { status: 500 })
  }

  if (outOfRounds || userWantsToFinish) {
    parsed.readyToCreate = true
    parsed.askedQuestion = false
  }

  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' },
  })
}