import { Loader2 } from 'lucide-react'

export default function TripLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#DEEDFC]">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading your trip...</p>
      </div>
    </div>
  )
}