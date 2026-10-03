import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-sand bg-cream/80 py-16 text-center shadow-sm backdrop-blur">
      <Compass className="h-10 w-10 text-navy-dark/20" />
      <h3 className="mt-3 font-serif text-lg font-semibold text-navy-dark">Start your next adventure</h3>
      <p className="mt-1 text-sm text-navy-dark/50">Create an AI-powered travel plan with live intelligence.</p>
      <Link href="/trips/new" className="mt-4 rounded-lg bg-brass px-5 py-2.5 text-sm font-medium text-navy-dark hover:bg-brass/90">
        Create your first trip
      </Link>
    </div>
  )
}