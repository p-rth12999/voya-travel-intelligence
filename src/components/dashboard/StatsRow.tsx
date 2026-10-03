'use client'
import { motion } from 'framer-motion'
import { Map, Globe, Building2, Sparkles, HeartPulse } from 'lucide-react'
import AnimatedCounter from '@/components/dashboard/AnimatedCounter'
import { computeDashboardStats } from '@/lib/dashboard-stats'

export default function StatsRow({ stats }: { stats: ReturnType<typeof computeDashboardStats> & { upcomingCount?: number } }) {
  const cards = [
    { icon: Map, color: 'bg-blue-50 text-blue-600', label: 'Trips Planned', value: stats.tripsPlanned, sub: stats.tripsThisMonth > 0 ? `+${stats.tripsThisMonth} this month` : undefined },
    { icon: Globe, color: 'bg-purple-50 text-purple-600', label: 'Countries', value: stats.countriesVisited },
    { icon: Building2, color: 'bg-amber-50 text-amber-600', label: 'Places', value: stats.placesExplored },
    { icon: Sparkles, color: 'bg-indigo-50 text-indigo-600', label: 'AI Suggestions', value: stats.aiSuggestionsUsedPct, suffix: '%' },
    { icon: HeartPulse, color: 'bg-green-50 text-green-600', label: 'Avg Trip Health', value: stats.avgTripHealth ?? 0, suffix: stats.avgTripHealth !== null ? '%' : '', display: stats.avgTripHealth === null ? '—' : undefined },
  ]
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="rounded-2xl border border-sand bg-cream/80 p-4 shadow-sm backdrop-blur"
        >
          <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${card.color}`}>
            <card.icon className="h-4 w-4" />
          </div>
          <p className="font-serif text-xl font-semibold text-navy-dark">
            {card.display ?? <AnimatedCounter value={card.value} suffix={card.suffix} />}
          </p>
          <p className="text-xs text-navy-dark/50">{card.label}</p>
          {card.sub && <p className="mt-0.5 text-xs text-brass">{card.sub}</p>}
        </motion.div>
      ))}
    </div>
  )
}