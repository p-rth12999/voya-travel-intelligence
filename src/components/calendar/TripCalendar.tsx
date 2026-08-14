'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import Link from 'next/link'
import { Trip } from '@/types/trip'

export default function TripCalendar({ trips }: { trips: Trip[] }) {
  const [selected, setSelected] = useState<Date | undefined>(new Date())

  const datedTrips = trips.filter(
    (t): t is Trip & { start_date: string; end_date: string } => t.start_date !== null && t.end_date !== null
  )

  const tripDays = datedTrips.flatMap((t) => {
    const days: { date: Date; trip: Trip }[] = []
    const start = new Date(t.start_date)
    const end = new Date(t.end_date)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({ date: new Date(d), trip: t })
    }
    return days
  })

  const selectedDayTrips = selected
    ? tripDays.filter((d) => d.date.toDateString() === selected.toDateString()).map((d) => d.trip)
    : []

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="rounded-3xl border border-white bg-white/80 p-4 shadow-sm">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ tripDay: tripDays.map((d) => d.date) }}
          modifiersClassNames={{ tripDay: 'bg-blue-100 font-semibold text-blue-700 rounded-full' }}
        />
      </div>
      <div className="flex-1 rounded-3xl border border-white bg-white/80 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          {selected?.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
        {selectedDayTrips.length === 0 ? (
          <p className="text-sm text-gray-400">No trips on this day.</p>
        ) : (
          <ul className="space-y-2">
            {selectedDayTrips.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/trips/${t.id}`}
                  className="block rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800 hover:bg-blue-100"
                >
                  {t.title} — {t.destinations?.join(' → ')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}