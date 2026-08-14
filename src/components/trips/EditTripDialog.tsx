'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Trip } from '@/types/trip'
import { CURRENCIES, TRANSPORT_PREFERENCES, TRIP_INTERESTS, FOOD_PREFERENCES, ACCESSIBILITY_NEEDS, DestinationCard } from '@/lib/validations/trip'
import DestinationCardsInput from '@/components/trips/DestinationCardsInput'
import TagSelector from '@/components/trips/TagSelector'

export default function EditTripDialog({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(trip.title)
  const [source, setSource] = useState(trip.source)
  const [destinations, setDestinations] = useState<DestinationCard[]>(
    (trip.destination_meta || trip.destinations.map((d) => ({ destination: d }))).map((m) => ({
      name: 'destination' in m ? m.destination : (m as { destination: string }).destination,
      country: (m as { country?: string | null }).country ?? null,
      countryCode: (m as { countryCode?: string | null }).countryCode ?? null,
      lat: (m as { lat?: number | null }).lat ?? null,
      lon: (m as { lon?: number | null }).lon ?? null,
      note: (m as { note?: string | null }).note ?? '',
      photoUrl: (m as { photoUrl?: string | null }).photoUrl ?? null,
    }))
  )
  const [useExactDates, setUseExactDates] = useState(!!trip.start_date && !!trip.end_date)
  const [startDate, setStartDate] = useState(trip.start_date ?? '')
  const [endDate, setEndDate] = useState(trip.end_date ?? '')
  const [durationDays, setDurationDays] = useState<number | ''>(trip.duration_days ?? '')
  const [startTime, setStartTime] = useState(trip.start_time ?? '10:00')
  const [endTime, setEndTime] = useState(trip.end_time ?? '19:00')
  const [travelers, setTravelers] = useState(trip.travelers)
  const [budget, setBudget] = useState(trip.budget)
  const [currency, setCurrency] = useState(trip.currency)
  const [transportPreferences, setTransportPreferences] = useState<string[]>(trip.transport_preferences || [])
  const [interests, setInterests] = useState<string[]>(trip.interests)
  const [foodPreferences, setFoodPreferences] = useState<string[]>(trip.food_preferences)
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>(trip.accessibility_needs)

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const isSingleDay = !useExactDates && durationDays === 1

    const { error: updateError } = await supabase
      .from('trips')
      .update({
        title,
        source,
        destinations: destinations.map((d) => d.name),
        destination_meta: destinations.map((d) => ({
          destination: d.name,
          country: d.country ?? null,
          countryCode: d.countryCode ?? null,
          lat: d.lat ?? null,
          lon: d.lon ?? null,
          note: d.note || null,
          photoUrl: d.photoUrl ?? null,
        })),
        start_date: useExactDates ? startDate || null : null,
        end_date: useExactDates ? endDate || null : null,
        duration_days: useExactDates ? null : durationDays || null,
        start_time: isSingleDay ? startTime || null : null,
        end_time: isSingleDay ? endTime || null : null,
        travelers,
        budget,
        currency,
        transport_preferences: transportPreferences,
        interests,
        food_preferences: foodPreferences,
        accessibility_needs: accessibilityNeeds,
        ai_content: null,
        ai_generated_at: null,
      })
      .eq('id', trip.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit trip details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Saving changes will regenerate your AI trip plan the next time you open this trip.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Trip title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Starting from</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <DestinationCardsInput value={destinations} onChange={setDestinations} />

          <div className="rounded-xl border border-gray-200 p-4">
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={useExactDates}
                onChange={(e) => setUseExactDates(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              I know my exact travel dates
            </label>

            {useExactDates ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">End date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">How many days?</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                {durationDays === 1 && (
                  <div className="mt-3 grid grid-cols-2 gap-4 rounded-lg bg-blue-50/50 p-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Start time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">End time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Travelers</label>
              <input
                type="number"
                min={1}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Budget</label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <TagSelector
            selected={transportPreferences}
            options={TRANSPORT_PREFERENCES}
            label="Transport preferences"
            onToggle={(v) => toggle(transportPreferences, setTransportPreferences, v)}
          />
          <TagSelector
            selected={interests}
            options={TRIP_INTERESTS}
            label="Preferences"
            onToggle={(v) => toggle(interests, setInterests, v)}
          />
          <TagSelector
            selected={foodPreferences}
            options={FOOD_PREFERENCES}
            label="Food preferences"
            onToggle={(v) => toggle(foodPreferences, setFoodPreferences, v)}
          />
          <TagSelector
            selected={accessibilityNeeds}
            options={ACCESSIBILITY_NEEDS}
            label="Accessibility needs"
            onToggle={(v) => toggle(accessibilityNeeds, setAccessibilityNeeds, v)}
          />
        </div>

        <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}