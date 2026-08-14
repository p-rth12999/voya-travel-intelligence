'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Plus, X, Loader2, Search } from 'lucide-react'
import { fetchUnsplashPhoto } from '@/lib/unsplash'
import { DestinationCard } from '@/lib/validations/trip'

type GeoResult = { name: string; latitude: number | null; longitude: number | null; country?: string; country_code?: string; admin1?: string }

export default function DestinationCardsInput({
  value,
  onChange,
  error,
}: {
  value: DestinationCard[]
  onChange: (next: DestinationCard[]) => void
  error?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [pending, setPending] = useState<GeoResult | null>(null)
  const [note, setNote] = useState('')
  const [loadingPhoto, setLoadingPhoto] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      } catch {
        setResults([])
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function pickResult(r: GeoResult) {
    setPending(r)
    setQuery('')
    setResults([])
    setNote('')
  }

  async function confirmAdd() {
    if (!pending) return
    setLoadingPhoto(true)
    const photoUrl = await fetchUnsplashPhoto(`${pending.name} ${pending.country ?? ''}`)
    setLoadingPhoto(false)

    onChange([
      ...value,
      {
        name: pending.name,
        country: pending.country ?? null,
        countryCode: pending.country_code ?? null,
        lat: pending.latitude ?? null,
        lon: pending.longitude ?? null,
        note,
        photoUrl,
      },
    ])
    setPending(null)
    setNote('')
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Destinations</label>

      <div className="space-y-3">
        {value.map((dest, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-gray-200 p-2">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {dest.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dest.photoUrl} alt={dest.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <MapPin className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{dest.name}</p>
              {dest.note && <p className="text-xs text-gray-500">{dest.note}</p>}
            </div>
            <button type="button" onClick={() => removeAt(i)} className="self-start text-gray-300 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {!pending ? (
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a destination to add..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:border-blue-500 focus:outline-none"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-lg">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => pickResult(r)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-blue-50"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    {r.name}{r.admin1 ? `, ${r.admin1}` : ''}{r.country ? `, ${r.country}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length >= 2 && results.length === 0 && (
            <button
              type="button"
              onClick={() => pickResult({ name: query, latitude: null, longitude: null })}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Can&apos;t find it? Add &quot;{query}&quot; anyway
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3">
          <p className="mb-2 text-sm font-medium text-gray-900">{pending.name}</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What do you want to do here? (optional)"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmAdd}
              disabled={loadingPhoto}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add destination
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}