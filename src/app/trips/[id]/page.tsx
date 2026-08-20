import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TripHeroHeader from '@/components/trips/TripHeroHeader'
import WorkspaceGrid from '@/components/workspace/WorkspaceGrid'
import WorkspaceGridSkeleton from '@/components/workspace/WorkspaceGridSkeleton'
import { CompletionProvider } from '@/components/workspace/CompletionContext'
import { ChatPanelProvider } from '@/components/workspace/ChatPanelContext'
import TripContentShell from '@/components/workspace/TripContentShell'
import { getOrGenerateTripContent } from '@/lib/openai/get-or-generate-trip-content'
import { refreshLiveIntelligenceIfNeeded } from '@/lib/openai/refresh-live-intelligence'
import { tripAIContentSchema } from '@/lib/validations/trip-ai-content'
import { tripHealthSchema } from '@/lib/validations/trip-live-intelligence'
import { Trip } from '@/types/trip'
import Sidebar from '@/components/dashboard/Sidebar'

async function AIWorkspaceSection({ trip }: { trip: Trip }) {
  let content: ReturnType<typeof tripAIContentSchema.parse> | null = null
  let hasError = false
  try {
    const rawContent = await getOrGenerateTripContent(trip)
    const parsed = tripAIContentSchema.safeParse(rawContent)
    if (!parsed.success) {
      console.error('Zod validation failed:', parsed.error)
      hasError = true
    } else {
      content = parsed.data
    }
  } catch (err) {
    console.error('AI content generation failed:', err)
    hasError = true
  }
  if (hasError || !content) {
    return <WorkspaceGridSkeleton status="error" />
  }
  return <WorkspaceGrid content={content} tripId={trip.id} sourceMeta={trip.source_meta} destinationMeta={trip.destination_meta} />
}

export default async function TripWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: initialTrip, error } = await supabase.from('trips').select('*').eq('id', id).single()
  if (error || !initialTrip) notFound()
  await refreshLiveIntelligenceIfNeeded(initialTrip as Trip)
  const { data: trip } = await supabase.from('trips').select('*').eq('id', id).single()
  const finalTrip = (trip ?? initialTrip) as Trip
  const healthParsed = finalTrip.trip_health ? tripHealthSchema.safeParse(finalTrip.trip_health) : null
  if (finalTrip.trip_health && !healthParsed?.success) {
    console.error('Trip health validation failed:', healthParsed?.error)
  }
  const { data: latestUpdate } = await supabase
    .from('trip_update_log')
    .select('*')
    .eq('trip_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return (
    <ChatPanelProvider>
      <div className="flex flex-col min-h-screen bg-[#DEEDFC] lg:flex-row">
        <Sidebar />
        <TripContentShell>
          <CompletionProvider>
            <TripHeroHeader
              trip={finalTrip}
              health={healthParsed?.success ? healthParsed.data : null}
              updateSummary={latestUpdate?.summary}
              updateAffectedCards={latestUpdate?.affected_cards}
            />
            <div className="p-8 pt-0">
              <Suspense fallback={<WorkspaceGridSkeleton status="loading" />}>
                <AIWorkspaceSection trip={finalTrip} />
              </Suspense>
            </div>
          </CompletionProvider>
        </TripContentShell>
      </div>
    </ChatPanelProvider>
  )
}