import CompassSpinner from '@/components/shared/CompassSpinner'

export default function WorkspaceGridSkeleton({ status }: { status: 'loading' | 'error' }) {
  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        We couldn&apos;t generate your trip content right now. Please try refreshing the page.
      </div>
    )
  }
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <CompassSpinner className="h-4 w-4" /> Generating your AI trip plan...
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}