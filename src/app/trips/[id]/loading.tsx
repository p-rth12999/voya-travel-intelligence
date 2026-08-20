import CompassSpinner from '@/components/shared/CompassSpinner'

export default function TripLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#DEEDFC]">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <CompassSpinner className="h-6 w-6" />
        <p className="text-sm">Loading your trip...</p>
      </div>
    </div>
  )
}