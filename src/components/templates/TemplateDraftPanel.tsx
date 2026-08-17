'use client'

import { Loader2, MapPin, Tag, Clock } from 'lucide-react'
import { TemplateDraft } from '@/lib/validations/template-draft-ai'

type Props = {
  draft: TemplateDraft
  readyToCreate: boolean
  creating: boolean
  onCreate: () => void
}

export default function TemplateDraftPanel({ draft, readyToCreate, creating, onCreate }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-white/[0.03] p-5">
      <h2 className="mb-4 text-sm font-medium text-blue-100/80">Draft template</h2>

      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-blue-100/40">Title</p>
          <p className={draft.title ? 'text-white' : 'text-blue-100/30'}>{draft.title || 'Not set yet'}</p>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-blue-100/40">
            <MapPin className="h-3 w-3" /> Destinations
          </p>
          {draft.destinations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {draft.destinations.map((d) => (
                <span key={d} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-50">
                  {d}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-blue-100/30">Not set yet</p>
          )}
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-blue-100/40">
            <Clock className="h-3 w-3" /> Duration
          </p>
          <p className={draft.durationDaysMin ? 'text-white' : 'text-blue-100/30'}>
            {draft.durationDaysMin
              ? `${draft.durationDaysMin}${draft.durationDaysMax && draft.durationDaysMax !== draft.durationDaysMin ? `–${draft.durationDaysMax}` : ''} days`
              : 'Not set yet'}
          </p>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-blue-100/40">
            <Tag className="h-3 w-3" /> Interests
          </p>
          {draft.interests.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {draft.interests.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-50">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-blue-100/30">Not set yet</p>
          )}
        </div>

        {draft.description && (
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-blue-100/40">Description</p>
            <p className="text-blue-50/90">{draft.description}</p>
          </div>
        )}
      </div>

      {readyToCreate && (
        <button
          onClick={onCreate}
          disabled={creating}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {creating && <Loader2 className="h-4 w-4 animate-spin" />}
          {creating ? 'Creating...' : 'Create Template'}
        </button>
      )}
    </div>
  )
}