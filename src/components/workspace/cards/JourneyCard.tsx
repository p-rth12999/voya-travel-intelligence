import { ArrowDown, Route, Sparkles } from 'lucide-react'
import WorkspaceCard from '@/components/workspace/WorkspaceCard'
import { countryCodeToFlag } from '@/lib/geo/country-flag'
import { haversineDistanceKm } from '@/lib/geo/distance'
import { DestinationMeta } from '@/types/trip'

type Leg = {
  from: string
  to: string
  transportMode: string
  note: string
  estimatedTravelTime: string
  hiddenGems: { name: string; description: string }[]
}

function findMeta(name: string, allMeta: DestinationMeta[]): DestinationMeta | null {
  return (
    allMeta.find(
      (m) =>
        m.destination.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(m.destination.toLowerCase())
    ) ?? null
  )
}

export default function JourneyCard({
  journeyPlan,
  sourceMeta,
  destinationMeta,
}: {
  journeyPlan: { optimized: boolean; legs: Leg[] }
  sourceMeta: DestinationMeta | null
  destinationMeta: DestinationMeta[] | null
}) {
  if (!journeyPlan.legs.length) {
    return (
      <WorkspaceCard title="Journey" icon={Route} status="empty" emptyMessage="No route data available yet.">
        <></>
      </WorkspaceCard>
    )
  }

  const allMeta = [...(sourceMeta ? [sourceMeta] : []), ...(destinationMeta ?? [])]

  return (
    <WorkspaceCard title="Journey" icon={Route}>
      {journeyPlan.optimized && (
        <p className="mb-4 text-xs font-medium text-brass">Reordered by AI for a more practical route</p>
      )}
      <div className="space-y-1">
        {journeyPlan.legs.map((leg, i) => {
          const fromMeta = findMeta(leg.from, allMeta)
          const toMeta = findMeta(leg.to, allMeta)
          const distanceKm =
            fromMeta?.lat != null && fromMeta?.lon != null && toMeta?.lat != null && toMeta?.lon != null
              ? Math.round(haversineDistanceKm(fromMeta.lat, fromMeta.lon, toMeta.lat, toMeta.lon))
              : null

          return (
            <div key={i}>
              <div className="flex items-center gap-2 rounded-2xl border border-sand bg-sand/20 px-4 py-2.5">
                <span className="text-lg">{countryCodeToFlag(fromMeta?.countryCode ?? null)}</span>
                <span className="text-sm font-medium text-navy-dark">{leg.from}</span>
              </div>

              <div className="ml-5 flex flex-col gap-1 border-l-2 border-brass/30 py-2 pl-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-navy-dark/60">
                  <span className="rounded-full bg-brass/15 px-2 py-0.5 font-medium text-navy-dark">{leg.transportMode}</span>
                  {distanceKm !== null && <span>~{distanceKm} km</span>}
                  <span>{leg.estimatedTravelTime}</span>
                </div>
                {leg.note && <p className="text-xs text-navy-dark/50">{leg.note}</p>}
                {leg.hiddenGems.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {leg.hiddenGems.map((gem, gi) => (
                      <div key={gi} className="flex items-start gap-1.5 text-xs text-navy-dark/60">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brass" />
                        <span><span className="font-medium text-navy-dark">{gem.name}:</span> {gem.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                <ArrowDown className="h-4 w-4 text-brass/50" />
              </div>

              {i === journeyPlan.legs.length - 1 && (
                <div className="flex items-center gap-2 rounded-2xl border border-sand bg-sand/20 px-4 py-2.5">
                  <span className="text-lg">{countryCodeToFlag(toMeta?.countryCode ?? null)}</span>
                  <span className="text-sm font-medium text-navy-dark">{leg.to}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </WorkspaceCard>
  )
}