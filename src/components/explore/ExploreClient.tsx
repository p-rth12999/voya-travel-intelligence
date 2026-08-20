'use client'

import { useEffect, useMemo, useState } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'
import CompassSpinner from '@/components/shared/CompassSpinner'
import LocationSearch, { ResolvedLocation } from './LocationSearch'
import TemplateCard, { TripTemplate } from './TemplateCard'
import { haversineDistanceKm } from '@/lib/geo/distance'
import { reverseGeocode } from '@/lib/geo/reverse-geocode'
import { createClient } from '@/lib/supabase/client'

const BUCKET_SECTIONS: { key: string; label: string }[] = [
  { key: '1_day', label: 'Day Trips' },
  { key: '3_day', label: 'Weekend Trips (2-4 days)' },
  { key: '7_day', label: 'Week-long Trips (5-9 days)' },
  { key: '15_day', label: 'Extended Trips (10+ days)' },
]

type FullTemplate = TripTemplate & { latitude: number; longitude: number; duration_bucket: string | null }

export default function ExploreClient() {
  const supabase = createClient()
  const [location, setLocation] = useState<ResolvedLocation | null>(null)
  const [includeInternational, setIncludeInternational] = useState(false)
  const [templates, setTemplates] = useState<FullTemplate[]>([])
  const [status, setStatus] = useState<'idle' | 'locating' | 'generating' | 'denied' | 'error'>('idle')

  async function fetchTemplatesForLocation(loc: ResolvedLocation) {
    const box = 0.3
    const { data, error } = await supabase
      .from('trip_templates')
      .select('*')
      .gte('latitude', loc.lat - box)
      .lte('latitude', loc.lat + box)
      .gte('longitude', loc.lon - box)
      .lte('longitude', loc.lon + box)

    if (error) {
      console.error('Fetching templates failed:', error)
      setStatus('error')
      return
    }

    setTemplates((data as FullTemplate[]) || [])
  }

  async function generateAndRefresh(loc: ResolvedLocation) {
    setStatus('generating')
    try {
      const res = await fetch('/api/generate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: loc.name,
          lat: loc.lat,
          lon: loc.lon,
          includeInternational,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Generation request failed:', res.status, body)
        setStatus('error')
        return
      }

      await fetchTemplatesForLocation(loc)
    } catch (err) {
      console.error('Generation request threw:', err)
      setStatus('error')
      return
    }
    setStatus('idle')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigator.geolocation) {
        setStatus('denied')
        return
      }
      setStatus('locating')
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const name = (await reverseGeocode(latitude, longitude)) || 'your area'
          const loc = { name, lat: latitude, lon: longitude }
          setLocation(loc)
          await generateAndRefresh(loc)
        },
        () => setStatus('denied'),
        { timeout: 8000 }
      )
    }, 0)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleManualSelect(loc: ResolvedLocation) {
    setLocation(loc)
    await generateAndRefresh(loc)
  }

  async function handleToggleInternational(next: boolean) {
    setIncludeInternational(next)
    if (location) await generateAndRefresh(location)
  }

  const grouped = useMemo(() => {
    return BUCKET_SECTIONS.map((section) => {
      const items = templates
        .filter((t) => t.duration_bucket === section.key)
        .map((t) => ({
          template: t,
          distanceKm:
            location && t.latitude && t.longitude
              ? haversineDistanceKm(location.lat, location.lon, t.latitude, t.longitude)
              : null,
        }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
      return { ...section, items }
    })
  }, [templates, location])

  const hasAnyResults = grouped.some((s) => s.items.length > 0)

  return (
    <div>
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LocationSearch onSelect={handleManualSelect} />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={includeInternational}
            onChange={(e) => handleToggleInternational(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Include international options
        </label>
      </div>

      {location && (
        <p className="mb-5 flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" /> Showing trips near {location.name}
        </p>
      )}

      {status === 'locating' && (
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/70 p-6 text-sm text-gray-500">
          <CompassSpinner className="h-4 w-4" /> Finding your location...  
                </div>
      )}

      {status === 'generating' && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-700">
          <CompassSpinner className="h-4 w-4" /> Generating trip ideas for this area...
        </div>
      )}

      {status === 'denied' && !location && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white/70 p-10 text-center text-sm text-gray-500">
          <LocateFixed className="h-6 w-6 text-gray-300" />
          Couldn&apos;t get your location. Search a place above to see trip ideas.
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-100 bg-red-50/70 p-10 text-center text-sm text-red-600">
          Something went wrong generating trip ideas. Try searching again.
        </div>
      )}

      {location && status === 'idle' && !hasAnyResults && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white/70 p-10 text-center text-sm text-gray-500">
          No trip ideas found near {location.name} yet.
        </div>
      )}

      {location && status === 'idle' && hasAnyResults && (
        <div className="space-y-8">
          {grouped.map((section) =>
            section.items.length > 0 ? (
              <div key={section.key}>
                <h2 className="mb-3 text-sm font-semibold text-gray-800">{section.label}</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map(({ template, distanceKm }) => (
                    <TemplateCard key={template.id} template={template} distanceKm={distanceKm} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}