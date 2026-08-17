import { openai } from '@/lib/openai/client'
import { templateChatResponseSchema } from '@/lib/validations/template-draft-ai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { NextRequest } from 'next/server'

const MAX_CLARIFYING_ROUNDS = 3
const FINISH_PHRASES = [
  'create the template', "let's create", 'lets create', 'make the template',
  'create it now', 'finish this', "that's enough", 'go ahead and create',
]

export async function POST(req: NextRequest) {
  const { currentDraft, latestMessage, questionsAsked, recentHistory } = await req.json()

  const roundsLeft = MAX_CLARIFYING_ROUNDS - (questionsAsked || 0)
  const outOfRounds = roundsLeft <= 0
  const userWantsToFinish = FINISH_PHRASES.some((p) => latestMessage.toLowerCase().includes(p))

  const historyMessages = ((recentHistory || []) as { role: 'user' | 'assistant'; content: string }[])
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content }))

  const systemMessage = {
    role: 'system' as const,
    content: `You are a travel planning assistant helping a user build a reusable trip TEMPLATE through a short conversation — not a specific booked trip.

Important scope: a template captures the general IDEA of a trip (where, roughly how long, what kind of experience). It intentionally has NO fields for exact calendar dates, budget, exact times, or number of travelers — those get filled in later when the user turns this template into a real trip. If the user mentions specific dates, budget, or times, acknowledge them naturally but do NOT ask follow-up questions about them and do NOT block on them — they are out of scope for this draft.

Current draft so far (merge new info into this, never discard what's already filled): ${JSON.stringify(currentDraft)}

Fields you fill: title, description, destinations (real, existing place names only — never invent one), transportMode, interests, tags, durationDaysMin, durationDaysMax, isInternational.

Rules:
- Only ask a clarifying question about destinations or duration-in-days if genuinely still missing — never about dates, budget, or times.
- Never repeat a question that's already been effectively answered earlier in this conversation.
- You have ${roundsLeft} clarifying question round(s) left before you must stop asking and fill gaps with sensible defaults instead.
- If the user asks you to create/finalize/finish the template, immediately set readyToCreate to true and clarifyingQuestion to null, even if some fields are still empty — fill gaps with sensible defaults.
- Once title, destinations, and a duration range are reasonably filled in, set readyToCreate to true and clarifyingQuestion to null.`,
  }

  const messages = [
    systemMessage,
    ...historyMessages,
    { role: 'user' as const, content: latestMessage },
  ]

  const completion = await openai.chat.completions.parse({
    model: 'openai/gpt-4o-mini',
    max_tokens: 800,
    messages,
    response_format: zodResponseFormat(templateChatResponseSchema, 'template_chat_response'),
  })

  const parsed = completion.choices[0].message.parsed
  if (!parsed) {
    return new Response(JSON.stringify({ error: 'AI did not return a valid response.' }), { status: 500 })
  }

  // Hard-enforced in code — never rely on the model alone to stop asking
  if (outOfRounds || userWantsToFinish) {
    parsed.readyToCreate = true
    parsed.clarifyingQuestion = null
  }

  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' },
  })
}