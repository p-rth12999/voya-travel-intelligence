'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Trip } from '@/types/trip'
import EditTripDialog from '@/components/trips/EditTripDialog'
import OfflineExportButton from '@/components/trips/OfflineExportButton'
import DuplicateTripButton from '@/components/trips/DuplicateTripButton'

export default function TripHeaderActions({ trip }: { trip: Trip }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-sm text-white shadow-md backdrop-blur-md hover:bg-black/55">
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
      <OfflineExportButton tripId={trip.id} />
      <DuplicateTripButton trip={trip} />
      {isEditing && <EditTripDialog trip={trip} onClose={() => setIsEditing(false)} />}
    </>
  )
}