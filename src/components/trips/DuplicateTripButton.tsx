'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Trip } from '@/types/trip'

export default function DuplicateTripButton({ trip }: { trip: Trip }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleDuplicate() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: newTrip, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        title: `${trip.title} (Copy)`,
        source: trip.source,
        destinations: trip.destinations,
        destination_meta: trip.destination_meta,
        source_meta: trip.source_meta,
        auto_sequence: trip.auto_sequence,
        start_date: trip.start_date,
        end_date: trip.end_date,
        duration_days: trip.duration_days,
        travelers: trip.travelers,
        budget: trip.budget,
        currency: trip.currency,
        transport_mode: trip.transport_mode,
        interests: trip.interests,
        food_preferences: trip.food_preferences,
        accessibility_needs: trip.accessibility_needs,
        status: 'planning',
      })
      .select()
      .single()

    setLoading(false)

    if (error || !newTrip) {
      alert('Could not duplicate trip.')
      return
    }

    router.push(`/trips/${newTrip.id}`)
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 print:hidden"
    >
      <Copy className="h-3.5 w-3.5" />
      {loading ? 'Duplicating...' : 'Duplicate'}
    </button>
  )
}