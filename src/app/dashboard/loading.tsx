import CompassSpinner from '@/components/shared/CompassSpinner'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <CompassSpinner className="h-8 w-8 text-brass" />
    </div>
  )
}