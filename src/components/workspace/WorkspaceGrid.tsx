import { TripAIContent } from '@/lib/validations/trip-ai-content'
import WorkspaceSections from '@/components/workspace/WorkspaceSections'
import AIChatCard from '@/components/workspace/cards/AIChatCard'
import { DestinationMeta } from '@/types/trip'
import { Sparkles } from 'lucide-react'

export default function WorkspaceGrid({
  content,
  tripId,
  sourceMeta,
  destinationMeta,
}: {
  content: TripAIContent
  tripId: string
  sourceMeta: DestinationMeta | null
  destinationMeta: DestinationMeta[] | null
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-2xl border border-blue-100 bg-cream/80 px-4 py-3 text-sm text-blue-800">
        <Sparkles className="h-4 w-4 shrink-0" />
        Want something different? Just tell the AI chat what to change — it can update any part of this plan for you.
      </div>
      <WorkspaceSections content={content} sourceMeta={sourceMeta} destinationMeta={destinationMeta} />
      <AIChatCard tripId={tripId} />
    </div>
  )
}