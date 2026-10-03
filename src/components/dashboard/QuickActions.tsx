import Link from 'next/link'
import { PlusCircle, Sparkles } from 'lucide-react'

export default function QuickActions() {
  return (
    <div className="rounded-3xl border border-sand bg-cream/80 p-4 shadow-sm backdrop-blur">
      <p className="mb-3 font-serif text-sm font-semibold text-navy-dark">Quick Actions</p>
      <div className="space-y-2">
        <Link href="/trips/new" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-navy-dark/70 hover:bg-sand/40">
          <PlusCircle className="h-4 w-4" /> Create Trip
        </Link>
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-navy-dark/30" disabled>
          <Sparkles className="h-4 w-4" /> AI Recommendations (soon)
        </button>
      </div>
    </div>
  )
}