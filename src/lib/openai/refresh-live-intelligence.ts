'use server'

import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'
import { zodResponseFormat } from 'openai/helpers/zod'
import { liveIntelligenceResponseSchema } from '@/lib/validations/trip-live-intelligence'
import { getWeatherSnapshot } from '@/lib/weather/get-weather'
import { computeDisplayStatus } from '@/lib/trip-status'
import { Trip } from '@/types/trip'

const REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000

export async function refreshLiveIntelligenceIfNeeded(trip: Trip) {
  const status = computeDisplayStatus(trip)
  if (status !== 'upcoming') return
  if (!trip.start_date || !trip.end_date) return

  if (trip.live_intelligence_refreshed_at) {
    const last = new Date(trip.live_intelligence_refreshed_at).getTime()
    if (Date.now() - last < REFRESH_INTERVAL_MS) return
  }

  const weather = await getWeatherSnapshot(trip.destinations[0], trip.start_date, trip.end_date)

  try {
    const completion = await openai.chat.completions.parse({
      model: 'openai/gpt-4o-mini',
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content:
            'You are a travel intelligence assistant. Given a trip\'s existing plan and fresh weather data, calculate a Trip Health score (0-100: green 80-100, yellow 50-79, red under 50) reflecting how smoothly the trip is likely to go. Only patch the specific plan sections that genuinely need to change based on new information — return null for anything unaffected. Never make legal, safety, or official travel decisions; if advisories or regulations seem relevant, recommend the user verify with official government sources rather than asserting facts yourself.',
        },
        {
          role: 'user',
          content: `Trip: ${trip.source} → ${trip.destinations.join(' → ')}, ${trip.start_date} to ${trip.end_date}.
Current weather data: ${weather ? `${weather.location}: ${weather.forecast}` : 'No forecast available yet (trip is too far out).'}
Current plan (only patch sections that need updating): ${JSON.stringify(trip.ai_content)}

Assess trip health and provide patches only for weather, packingChecklist, timeline, crowdIntelligence, localRegulations, mobilityIntelligence, or accommodationIntelligence sections that genuinely need to change based on the current weather data.`,
        },
      ],
      response_format: zodResponseFormat(liveIntelligenceResponseSchema, 'live_intelligence'),
    })

    const parsed = completion.choices[0].message.parsed
    if (!parsed) return

    const supabase = await createClient()
    const existingContent = (trip.ai_content as Record<string, unknown>) || {}
    const updatedContent = { ...existingContent }

    for (const key of parsed.affectedCards) {
      const patch = parsed.cardPatches[key]
      if (patch) updatedContent[key] = patch
    }

    await supabase
      .from('trips')
      .update({
        ai_content: updatedContent,
        trip_health: parsed.tripHealth,
        live_intelligence_refreshed_at: new Date().toISOString(),
      })
      .eq('id', trip.id)

    if (parsed.affectedCards.length > 0) {
      await supabase.from('trip_update_log').insert({
        trip_id: trip.id,
        summary: parsed.updateSummary,
        affected_cards: parsed.affectedCards,
      })
    }
  } catch (err) {
    console.error('Live intelligence refresh failed:', err)
  }
}