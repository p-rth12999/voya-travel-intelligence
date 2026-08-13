import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import { computeDisplayStatus } from '@/lib/trip-status'
import { Trip } from '@/types/trip'
import Link from 'next/link'
import { Bell } from 'lucide-react'

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trips } = await supabase.from('trips').select('*').neq('status', 'cancelled')
  const tripList = (trips as Trip[]) || []

  const alerts = tripList
    .filter((t): t is Trip & { start_date: string } => t.start_date !== null)
    .map((t) => ({ trip: t, status: computeDisplayStatus(t), days: daysUntil(t.start_date) }))
    .filter((a) => a.status === 'upcoming' && a.days >= 0 && a.days <= 7)
    .sort((a, b) => a.days - b.days)

  return (
    <div className="flex flex-col min-h-screen bg-[#DEEDFC] lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Alerts</h1>
        {alerts.length === 0 ? (
          <p className="rounded-3xl border border-white bg-white/80 p-6 text-sm text-gray-400 shadow-sm">
            No upcoming trips in the next 7 days.
          </p>
        ) : (
          <ul className="space-y-3">
            {alerts.map(({ trip, days }) => (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm hover:bg-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {trip.title} {days === 0 ? 'starts today!' : `starts in ${days} day${days === 1 ? '' : 's'}`}
                    </p>
                    <p className="text-xs text-gray-500">{trip.destinations?.join(' → ')}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}