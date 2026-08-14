'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Trip } from '@/types/trip'
import { CURRENCIES, TRANSPORT_MODES, TRIP_INTERESTS, FOOD_PREFERENCES, ACCESSIBILITY_NEEDS } from '@/lib/validations/trip'
import { buildDestinationMeta } from '@/lib/geo/geocode'
import DestinationsInput from '@/components/trips/DestinationsInput'
import TagSelector from '@/components/trips/TagSelector'

export default function EditTripDialog({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(trip.title)
  const [source, setSource] = useState(trip.source)
  const [destinations, setDestinations] = useState<string[]>(trip.destinations)
  const [startDate, setStartDate] = useState(trip.start_date ?? '')
  const [endDate, setEndDate] = useState(trip.end_date ?? '')
  const [travelers, setTravelers] = useState(trip.travelers)
  const [budget, setBudget] = useState(trip.budget)
  const [currency, setCurrency] = useState(trip.currency)
  const [transportMode, setTransportMode] = useState(trip.transport_mode)
  const [interests, setInterests] = useState<string[]>(trip.interests)
  const [foodPreferences, setFoodPreferences] = useState<string[]>(trip.food_preferences)
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>(trip.accessibility_needs)

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const [sourceMeta] = await buildDestinationMeta([source])
    const destinationMeta = await buildDestinationMeta(destinations)

    const { error: updateError } = await supabase
      .from('trips')
      .update({
        title,
        source,
        destinations,
        destination_meta: destinationMeta,
        source_meta: sourceMeta,
        start_date: startDate || null,
        end_date: endDate || null,
        travelers,
        budget,
        currency,
        transport_mode: transportMode,
        interests,
        food_preferences: foodPreferences,
        accessibility_needs: accessibilityNeeds,
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

          <DestinationsInput value={destinations} onChange={setDestinations} />

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

          <div className="grid grid-cols-4 gap-4">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Transport</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {TRANSPORT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

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