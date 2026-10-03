'use client'

import { useState } from 'react'
import { CloudRain, ShieldAlert, Users, Bus, ChevronDown } from 'lucide-react'

const CATEGORY_ICONS: Record<string, typeof CloudRain> = {
  weather: CloudRain,
  localRegulations: ShieldAlert,
  crowdIntelligence: Users,
  mobilityIntelligence: Bus,
}

export default function TripUpdateBanner({
  summary,
  affectedCards,
  floating = false,
}: {
  summary: string
  affectedCards: string[]
  floating?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={
        floating
          ? 'rounded-3xl border border-blue-100 bg-cream/90 p-4 shadow-lg backdrop-blur-xl print:hidden'
          : 'mb-6 rounded-3xl border border-blue-100 bg-cream/80 p-4 backdrop-blur print:hidden'
      }
    >
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-900">Travel Update</span>
          <div className="flex -space-x-1.5">
            {affectedCards.slice(0, 4).map((key) => {
              const Icon = CATEGORY_ICONS[key] || CloudRain
              return (
                <span key={key} className="flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-blue-50">
                  <Icon className="h-3 w-3 text-blue-600" />
                </span>
              )
            })}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <p className={`mt-2 text-sm text-blue-800 ${expanded ? '' : 'truncate'}`}>{summary}</p>
    </div>
  )
}