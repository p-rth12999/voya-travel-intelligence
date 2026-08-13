'use client'

export type StatusFilter = 'all' | 'draft' | 'planning' | 'upcoming' | 'completed' | 'cancelled'
export type SortOption = 'recent' | 'oldest' | 'alphabetical' | 'rated'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'planning', label: 'Planning' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function TripFilters({
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: {
  filter: StatusFilter
  onFilterChange: (f: StatusFilter) => void
  sort: SortOption
  onSortChange: (s: SortOption) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white bg-white/80 p-2 shadow-sm backdrop-blur">
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="rated">Best Rated</option>
      </select>
    </div>
  )
}