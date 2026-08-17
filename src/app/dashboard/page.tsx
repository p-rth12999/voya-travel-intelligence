import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeaderWrapper from '@/components/dashboard/DashboardHeaderWrapper'
import { computeDashboardStats } from '@/lib/dashboard-stats'
import { Trip } from '@/types/trip'
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })
  const tripList = (trips as Trip[]) || []

  if (!error && tripList.length === 0) {
    redirect('/templates/new')
  }

  const { data: ratingsData } = await supabase
    .from('trip_ratings')
    .select('trip_id, stars')
    .in('trip_id', tripList.map((t) => t.id))
  const ratings: Record<string, number> = {}
  const ratingGroups: Record<string, number[]> = {}
  ;(ratingsData || []).forEach((r) => {
    ratingGroups[r.trip_id] = ratingGroups[r.trip_id] || []
    ratingGroups[r.trip_id].push(r.stars)
  })
  Object.entries(ratingGroups).forEach(([tripId, stars]) => {
    ratings[tripId] = stars.reduce((a, b) => a + b, 0) / stars.length
  })
  const { data: updateLogs } = await supabase
    .from('trip_update_log')
    .select('summary, created_at, trip_id')
    .in('trip_id', tripList.map((t) => t.id))
    .order('created_at', { ascending: false })
    .limit(5)
  const stats = computeDashboardStats(tripList)
  const userName =
  (user.user_metadata?.username as string) ||
  (user.user_metadata?.full_name as string) ||
  user.email?.split('@')[0] ||
  'traveler'
  if (error) {
    return <div className="p-8 text-sm text-red-600">Couldn&apos;t load your trips: {error.message}</div>
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#DEEDFC] lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <DashboardHeaderWrapper
          userName={userName}
          stats={stats}
          trips={tripList}
          ratings={ratings}
          activity={(updateLogs || []).map((u) => ({ summary: u.summary, createdAt: u.created_at }))}
        />
      </div>
    </div>
  )
}