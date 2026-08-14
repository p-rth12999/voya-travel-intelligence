import { Trip } from '@/types/trip'
import { getTripHeroImage } from '@/lib/trip-hero-image'
import { computeDisplayStatus } from '@/lib/trip-status'
import TripHeaderActions from '@/components/trips/TripHeaderActions'
import TripStatusActions from '@/components/trips/TripStatusActions'
import PrintButton from '@/components/trips/PrintButton'
import TripHealthCard from '@/components/workspace/cards/TripHealthCard'
import TripUpdateBanner from '@/components/trips/TripUpdateBanner'
import { TripHealth } from '@/lib/validations/trip-live-intelligence'

const STATUS_STYLES = {
  draft: 'bg-purple-600/80',
  planning: 'bg-gray-900/70',
  upcoming: 'bg-blue-600/90',
  completed: 'bg-green-600/90',
  cancelled: 'bg-red-600/90',
}
const STATUS_LABELS = { draft: 'Draft', planning: 'Planning', upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' }

function formatTripDates(trip: Trip): string {
  if (trip.start_date && trip.end_date) return `${trip.start_date} – ${trip.end_date}`
  if (trip.duration_days) return `${trip.duration_days} day${trip.duration_days > 1 ? 's' : ''} · dates not set`
  return 'Dates not set'
}

export default function TripHeroHeader({
  trip,
  health,
  updateSummary,
  updateAffectedCards,
}: {
  trip: Trip
  health: TripHealth | null
  updateSummary?: string
  updateAffectedCards?: string[]
}) {
  const status = computeDisplayStatus(trip)
  const hero = getTripHeroImage(trip.id, 1920, 700)
  const hasOverlayContent = health || updateSummary
  const dateLabel = formatTripDates(trip)

  return (
    <div className="mb-6">
      <div className="relative overflow-hidden shadow-sm print:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt={trip.destinations[0]} className="h-72 w-full object-cover sm:h-96" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/70" />

        <span className={`absolute left-6 top-5 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>

        <div className="absolute right-4 top-4 flex flex-wrap items-center justify-end gap-2 sm:right-6">
          <TripStatusActions trip={trip} />
          <TripHeaderActions trip={trip} />
          <PrintButton />
        </div>

        <div className="absolute left-6 right-6 bottom-6 text-white sm:left-8">
          <h1 className="text-2xl font-semibold drop-shadow sm:text-4xl">{trip.title}</h1>
          <p className="mt-1 text-sm text-white/85 drop-shadow sm:text-base">{trip.source} → {trip.destinations.join(' → ')}</p>
          <p className="mt-1 text-xs text-white/70 drop-shadow sm:text-sm">
            {dateLabel} · {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} · {trip.budget} {trip.currency}
          </p>
        </div>
      </div>

      {hasOverlayContent && (
        <div className="mx-4 mt-4 sm:mx-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {health && (
              <div className="lg:col-span-2">
                <TripHealthCard health={health} lastUpdated={trip.live_intelligence_refreshed_at} floating />
              </div>
            )}
            {updateSummary && (
              <TripUpdateBanner summary={updateSummary} affectedCards={updateAffectedCards || []} floating />
            )}
          </div>
        </div>
      )}

      {/* Print version */}
      <div className="hidden p-8 print:block">
        <h1 className="text-2xl font-semibold text-gray-900">{trip.title}</h1>
        <p className="text-sm text-gray-500">{trip.source} → {trip.destinations.join(' → ')}</p>
        <p className="text-xs text-gray-400">
          {dateLabel} · {trip.travelers} traveler(s) · {trip.budget} {trip.currency}
        </p>
      </div>
    </div>
  )
}