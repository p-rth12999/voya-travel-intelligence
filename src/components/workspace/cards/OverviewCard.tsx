import { Compass } from 'lucide-react'
import WorkspaceCard from '@/components/workspace/WorkspaceCard'
import { TripAIContent } from '@/lib/validations/trip-ai-content'

export default function OverviewCard({ data }: { data: TripAIContent['overview'] }) {
  return (
    <WorkspaceCard title="Overview" icon={Compass} status="ready">
      <p className="text-sm text-navy-dark/70">{data.summary}</p>
      <ul className="mt-3 space-y-1">
        {data.highlights.map((h, i) => (
          <li key={i} className="text-sm text-navy-dark/50">• {h}</li>
        ))}
      </ul>
    </WorkspaceCard>
  )
}