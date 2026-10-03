'use client'

import { CalendarDays } from 'lucide-react'
import WorkspaceCard from '@/components/workspace/WorkspaceCard'
import { TripAIContent } from '@/lib/validations/trip-ai-content'
import { useCompletion } from '@/components/workspace/CompletionContext'

export default function TimelineCard({ data }: { data: TripAIContent['timeline'] }) {
  const { completedActivities, toggleActivity } = useCompletion()

  return (
    <WorkspaceCard title="Timeline" icon={CalendarDays} status="ready">
      <div className="relative space-y-6 pl-4">
        <div className="absolute bottom-2 left-1.5 top-2 w-px bg-sand" />
        {data.days.map((day) => (
          <div key={day.day} className="relative">
            <div className="absolute -left-[15px] top-0.5 h-3 w-3 rounded-full border-2 border-cream bg-brass shadow" />
            <p className="font-serif text-sm font-semibold text-navy-dark">Day {day.day}: {day.title}</p>
            <ul className="mt-1.5 space-y-1">
              {day.activities.map((activity, i) => {
                const isDone = completedActivities.includes(activity)
                return (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <input type="checkbox" checked={isDone} onChange={() => toggleActivity(activity)} className="mt-0.5" />
                    <span className={isDone ? 'text-navy-dark/25 line-through' : 'text-navy-dark/60'}>{activity}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </WorkspaceCard>
  )
}