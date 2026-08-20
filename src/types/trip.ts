export type TripStatus = 'planning' | 'upcoming' | 'completed' | 'cancelled'
export type DisplayStatus = 'draft' | TripStatus

export type DestinationMeta = {
  destination: string
  country: string | null
  countryCode: string | null
  lat: number | null
  lon: number | null
  note?: string | null
  photoUrl?: string | null
}

export interface Trip {
  id: string
  user_id: string
  title: string
  description: string | null
  source: string
  destinations: string[]
  destination_meta: DestinationMeta[] | null
  source_meta: DestinationMeta | null
  auto_sequence: boolean
  start_date: string | null
  end_date: string | null
  duration_days: number | null
  start_time: string | null
  end_time: string | null
  travelers: number
  budget: number
  currency: string
  transport_preferences: string[]
  interests: string[]
  food_preferences: string[]
  accessibility_needs: string[]
  status: TripStatus
  created_at: string
  ai_content: unknown | null
  ai_generated_at: string | null
  trip_health: unknown | null
  live_intelligence_refreshed_at: string | null
}