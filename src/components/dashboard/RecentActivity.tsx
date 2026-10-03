interface ActivityItem {
  summary: string
  createdAt: string
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-3xl border border-sand bg-cream/80 p-4 shadow-sm backdrop-blur">
      <p className="mb-3 font-serif text-sm font-semibold text-navy-dark">Recent Activity</p>
      {items.length === 0 ? (
        <p className="text-xs text-navy-dark/30">No recent updates yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-navy-dark/60">{item.summary}</li>
          ))}
        </ul>
      )}
    </div>
  )
}