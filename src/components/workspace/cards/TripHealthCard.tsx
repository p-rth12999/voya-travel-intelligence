import { TripHealth } from '@/lib/validations/trip-live-intelligence'

const LEVEL_COLORS = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' }

export default function TripHealthCard({
  health,
  lastUpdated,
  floating = false,
}: {
  health: TripHealth
  lastUpdated?: string | null
  floating?: boolean
}) {
  const color = LEVEL_COLORS[health.level]
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (health.score / 100) * circumference

  return (
    <div
      className={
        floating
          ? 'rounded-3xl border border-sand bg-cream/80 p-5 shadow-lg backdrop-blur-xl'
          : 'mb-6 rounded-3xl border border-sand bg-cream/90 p-6 shadow-sm backdrop-blur'
      }
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e5ded0" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-xl font-bold text-navy-dark sm:text-2xl">{health.score}%</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-semibold text-navy-dark">Trip Health</h3>
            {lastUpdated && (
              <span className="text-xs text-navy-dark/30">
                Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-navy-dark/60">{health.summary}</p>
          <ul className="mt-2 space-y-1">
            {health.factors.map((f, i) => (
              <li key={i} className="text-xs text-navy-dark/50">• {f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}