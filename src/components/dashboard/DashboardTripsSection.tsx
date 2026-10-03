'use client'

import { useState, useMemo } from 'react'
import { Trip } from '@/types/trip'
import { computeDisplayStatus } from '@/lib/trip-status'
import RichTripCard from '@/components/dashboard/RichTripCard'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import TripFilters, { StatusFilter, SortOption } from '@/components/dashboard/TripFilters'

export default function DashboardTripsSection({
  trips,
  ratings,
  searchQuery,
}: {
  trips: Trip[]
  ratings: Record<string, number>
  searchQuery: string
}) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortOption>('recent')

  const visibleTrips = useMemo(() => {
    let result = trips.filter((t) => filter === 'all' || computeDisplayStatus(t) === filter)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.destinations.some((d) => d.toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case 'oldest':
        result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'alphabetical':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rated':
        result = [...result].sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0))
        break
      default:
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [trips, filter, sort, searchQuery, ratings])

  return (
    <div>
      <h2 className="mb-3 font-serif text-lg font-semibold text-navy-dark">Your Trips</h2>
      <TripFilters filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
      {visibleTrips.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTrips.map((trip) => (
            <RichTripCard key={trip.id} trip={trip} avgRating={ratings[trip.id] ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}