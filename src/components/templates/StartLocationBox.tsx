'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X, LocateFixed } from 'lucide-react'
import { reverseGeocode } from '@/lib/geo/reverse-geocode'

export type ResolvedLocation = { name: string; lat: number; lon: number }

type GeoResult = { name: string; latitude: number; longitude: number; admin1?: string; country?: string }

type Props = {
  location: ResolvedLocation | null
  onChange: (loc: ResolvedLocation | null) => void
}

export default function StartLocationBox({ location, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(() => {
    if (typeof window === 'undefined') return false
    return !location && typeof navigator !== 'undefined' && !!navigator.geolocation
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triedAutoLocate = useRef(false)

  // Try browser geolocation once, silently — fully skippable if denied/unavailable
  useEffect(() => {
    if (location || triedAutoLocate.current) return
    triedAutoLocate.current = true
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const name = (await reverseGeocode(latitude, longitude)) || 'your area'
        onChange({ name, lat: latitude, lon: longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        )
        const data = await res.json()
        setResults(data.results || [])
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handlePick(r: GeoResult) {
    setQuery('')
    setResults([])
    setOpen(false)
    onChange({ name: r.name, lat: r.latitude, lon: r.longitude })
  }

  if (location) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-blue-100/80">
        <MapPin className="h-3 w-3 text-blue-300" />
        Near {location.name}
        <button
          onClick={() => onChange(null)}
          className="ml-1 text-blue-100/40 hover:text-white"
          aria-label="Clear starting location"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[220px]">
      <div className="relative">
        {locating ? (
          <LocateFixed className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-pulse text-blue-300" />
        ) : (
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-100/40" />
        )}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={locating ? 'Finding your location...' : 'Set starting location'}
          className="w-full rounded-full border border-white/15 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-blue-100/40 focus:border-blue-400/50 focus:outline-none"
          style={{ color: '#ffffff', colorScheme: 'dark' }}
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-2xl border border-white/10 bg-[#0B1832] shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => handlePick(r)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-blue-50 hover:bg-white/10"
              >
                <MapPin className="h-3 w-3 shrink-0 text-blue-100/40" />
                {r.name}{r.admin1 ? `, ${r.admin1}` : ''}{r.country ? `, ${r.country}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}