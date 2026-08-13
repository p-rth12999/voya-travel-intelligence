import { Trip, DisplayStatus } from '@/types/trip'

export function computeDisplayStatus(trip: Trip): DisplayStatus {
  if (trip.status === 'completed' || trip.status === 'cancelled') return trip.status
  if (!trip.start_date) return 'draft'
  const today = new Date().toISOString().slice(0, 10)
  return today >= trip.start_date ? 'upcoming' : 'planning'
}