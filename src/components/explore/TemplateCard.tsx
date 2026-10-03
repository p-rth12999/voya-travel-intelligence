'use client'

import Link from 'next/link'
import { MapPin, Sparkles, Globe2 } from 'lucide-react'

export type TripTemplate = {
  id: string
  title: string
  description: string
  destinations: string[]
  tags: string[]
  duration_days_min: number
  duration_days_max: number
  image_seed: string
  is_international: boolean
}

export default function TemplateCard({ template, distanceKm }: { template: TripTemplate; distanceKm: number | null }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-sand bg-cream/80 shadow-sm">
      <div
        className="relative h-36 bg-cover bg-center"
        style={{ backgroundImage: `url(https://picsum.photos/seed/${template.image_seed}/400/240)` }}
      >
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brass/90 px-2.5 py-1 text-xs font-medium text-navy-dark">
          <Sparkles className="h-3.5 w-3.5" /> AI-suggested
        </span>
        {template.is_international && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-navy/90 px-2.5 py-1 text-xs font-medium text-cream">
            <Globe2 className="h-3.5 w-3.5" /> International
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-serif font-medium text-navy-dark">{template.title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-navy-dark/50">
          <MapPin className="h-3 w-3" /> {template.destinations.join(', ')}
        </p>
        <p className="mt-2 text-xs text-navy-dark/50">{template.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {template.tags.map((t) => (
            <span key={t} className="rounded-full bg-sand/40 px-2 py-0.5 text-[10px] font-medium capitalize text-navy-dark/70">
              {t.replace('_', ' ')}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-navy-dark/40">
          <span>
            {template.duration_days_min === template.duration_days_max
              ? `${template.duration_days_min} day${template.duration_days_min === 1 ? '' : 's'}`
              : `${template.duration_days_min}–${template.duration_days_max} days`}
          </span>
          {distanceKm !== null && <span>~{Math.round(distanceKm)} km away</span>}
        </div>
        <Link
          href={`/trips/new?template=${template.id}`}
          className="mt-3 block rounded-full bg-brass py-2 text-center text-sm font-medium text-navy-dark hover:bg-brass/90"
        >
          Plan this out
        </Link>
      </div>
    </div>
  )
}