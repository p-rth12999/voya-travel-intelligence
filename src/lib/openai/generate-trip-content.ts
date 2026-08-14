import { openai } from '@/lib/openai/client'
import { tripAIContentSchema, TripAIContent } from '@/lib/validations/trip-ai-content'
import { Trip } from '@/types/trip'
import { zodResponseFormat } from 'openai/helpers/zod'

export async function generateTripAIContent(
  trip: Trip,
  completedActivities: string[] = [],
  completedPackingItems: string[] = []
): Promise<TripAIContent> {
  const progressNote =
    completedActivities.length > 0 || completedPackingItems.length > 0
      ? `
The traveler has already completed part of this plan. Already-done activities (do not repeat or reschedule these — continue the itinerary from the next logical point onward, renumbering remaining days starting from Day 1): ${completedActivities.join('; ')}. Already-handled packing items (exclude these from the new checklist): ${completedPackingItems.join('; ') || 'none'}.`
      : ''

  const sequencingNote = trip.auto_sequence
    ? "The destinations below are not necessarily in a good order — determine the most practical order yourself based on real-world geography and transport connectivity, and generate the timeline and journeyPlan in that optimized order."
    : "The destinations below are in the exact order the traveler wants — do not reorder them, but still flag in journeyPlan if any specific leg lacks a practical direct transport option, and note a realistic alternative in that leg's note field."

  const hasExactDates = !!trip.start_date && !!trip.end_date
  const isSingleDayWithTime = !hasExactDates && trip.duration_days === 1 && !!trip.start_time && !!trip.end_time

  const dateContext = hasExactDates
    ? `Dates: ${trip.start_date} to ${trip.end_date}`
    : isSingleDayWithTime
    ? `This is a single-day trip, from ${trip.start_time} to ${trip.end_time}. Exact calendar date is not set yet.`
    : `Trip length: ${trip.duration_days ?? 'unspecified'} day(s). Exact calendar dates are not set yet.`

  const timelineDateInstruction = hasExactDates
    ? 'Each timeline day\'s "date" field should be the actual calendar date.'
    : isSingleDayWithTime
    ? `This is a single day of ${trip.start_time} to ${trip.end_time}. Plan activities as a realistic hour-by-hour schedule that fits within this specific time window — do not plan a full multi-day itinerary, and be mindful of the total available hours. The single timeline day's "date" field should read "${trip.start_time} – ${trip.end_time}".`
    : 'Exact calendar dates are not known yet, so each timeline day\'s "date" field should be a relative label like "Day 1", "Day 2", etc. instead of a real calendar date.'

  const transportPrefs = trip.transport_preferences.length > 0 ? trip.transport_preferences.join(', ') : 'None specified — use your best judgment per leg'

  const completion = await openai.chat.completions.parse({
    model: 'openai/gpt-4o-mini',
    max_tokens: 4000,
    messages: [
      { role: 'system', content: 'You are a travel planning assistant. Generate detailed, practical, and destination-specific content for the trip described. Be specific to the actual destination — avoid generic advice.' },
      {
        role: 'user',
        content: `Generate a complete travel plan for this trip:
Journey: ${trip.source} → ${trip.destinations.join(' → ')}
Title: ${trip.title}
${dateContext}
Travelers: ${trip.travelers}
Budget: ${trip.budget} ${trip.currency}
Transport preferences (guidance, not a strict rule — use judgment where preferences conflict with practicality): ${transportPrefs}
Preferences: ${trip.interests.join(', ') || 'None specified'}
Food preferences/restrictions: ${trip.food_preferences.join(', ') || 'None specified'}
Accessibility needs: ${trip.accessibility_needs.join(', ') || 'None specified'}${progressNote}
This is ONE continuous multi-leg journey, not separate trips. Keep origin-dependent context (visa status, embassy references, home currency) fixed throughout regardless of which leg is being discussed.
First, determine tripType: "domestic" if every stop is in the same country as ${trip.source}, "international" otherwise.
${timelineDateInstruction}
Sequencing: ${sequencingNote}
For journeyPlan: produce one leg per consecutive stop, starting from ${trip.source} to the first destination. For each leg, pick the most realistic real-world transport mode based on actual connectivity between those specific places and the traveler's transport preferences above — do not assume a direct route exists just because it looks geographically close; if there's no practical direct option (e.g. no suitable flight connection), name a sensible connecting hub or alternate mode in the note instead. Give a realistic estimatedTravelTime (e.g. "~3-4 hrs by car", "~1.5 hr flight plus transfers") reasoned from general knowledge, not live data. For each leg, include 1-2 genuine hidden gems near that specific leg's destination if any good ones exist (small, lesser-known, real places only — do not invent names) — across the whole journeyPlan there should be at least 3 hidden gems total where the destinations reasonably support it. Set journeyPlan.optimized to true only if you changed the input order.
Restaurant recommendations must strictly respect food preferences. Timeline, activities, and medical recommendations must account for accessibility needs.
For currencyInfo and offlineLanguage: only populate if tripType is "international", otherwise return null for both.
For mobilityIntelligence: for each destination in the journey, determine if it's car-free or has driving restrictions (like Zermatt, Venice, Matheran-style towns) and explain the recommended way to get around. Assess whether a rental car remains practical given the traveler's transport preferences and the journey overall, or if any destination requires switching to local transport (set rentalVehicleAssessment accordingly; if road-trip/car isn't a relevant consideration for this trip, set it to null).
For accommodationIntelligence: for each destination, note anything affecting accommodation demand (season, festivals, holidays) and a recommended booking window, plus a primary recommendation with 2-3 backup alternatives per destination.
Be clear that mobility, accommodation, and travel-time guidance is reasoned advice based on general knowledge, not verified real-time transit schedules, live hotel availability, or live routing data — the user should confirm specifics directly before relying on them.`,
      },
    ],
    response_format: zodResponseFormat(tripAIContentSchema, 'trip_ai_content'),
  })
  const parsed = completion.choices[0].message.parsed
  if (!parsed) throw new Error('OpenAI did not return valid structured content.')
  return parsed
}