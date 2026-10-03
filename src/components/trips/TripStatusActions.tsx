'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trip } from '@/types/trip'
import { computeDisplayStatus } from '@/lib/trip-status'
import RatingDialog from '@/components/trips/RatingDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

export default function TripStatusActions({ trip }: { trip: Trip }) {
  const router = useRouter()
  const supabase = createClient()
  const [showRating, setShowRating] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const displayStatus = computeDisplayStatus(trip)

  if (displayStatus !== 'upcoming') return null

  async function handleCancel() {
    setCancelling(true)
    await supabase.from('trips').update({ status: 'cancelled' }).eq('id', trip.id)
    setCancelling(false)
    setShowCancelConfirm(false)
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setShowRating(true)} className="rounded-full border border-sand/25 bg-black/40 px-3 py-1.5 text-sm text-white shadow-md backdrop-blur-md hover:bg-black/55">
        Mark Completed
      </button>
      <button onClick={() => setShowCancelConfirm(true)} className="rounded-full border border-red-300/40 bg-red-600/50 px-3 py-1.5 text-sm text-white shadow-md backdrop-blur-md hover:bg-red-600/65">
        Cancel Trip
      </button>
      {showRating && (
        <RatingDialog tripId={trip.id} onClose={() => setShowRating(false)} onSubmitted={() => { setShowRating(false); router.refresh() }} />
      )}
      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel this trip?"
        message="This will mark the trip as cancelled. You can't undo this from here."
        confirmLabel="Cancel Trip"
        confirming={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  )
}