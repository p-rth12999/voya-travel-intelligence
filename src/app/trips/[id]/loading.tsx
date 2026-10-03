import CompassSpinner from '@/components/shared/CompassSpinner'

export default function TripLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3 text-navy-dark/50">
        <CompassSpinner className="h-6 w-6" />
        <p className="text-sm">Loading your trip...</p>
      </div>
    </div>
  )
}