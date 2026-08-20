'use client'

import { useState, useEffect } from 'react'
import CompassSpinner from '@/components/shared/CompassSpinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  tripFormSchema,
  TripFormValues,
  TRIP_INTERESTS,
  CURRENCIES,
  TRANSPORT_PREFERENCES,
  FOOD_PREFERENCES,
  ACCESSIBILITY_NEEDS,
} from '@/lib/validations/trip'
import { createClient } from '@/lib/supabase/client'
import { buildDestinationMeta } from '@/lib/geo/geocode'
import DestinationCardsInput from '@/components/trips/DestinationCardsInput'
import TagSelector from '@/components/trips/TagSelector'

type TagField = 'interests' | 'foodPreferences' | 'accessibilityNeeds' | 'transportPreferences'
const QUICK_DURATIONS = [1, 3, 5, 7]

export default function TripForm() {
  const router = useRouter()
  const supabase = createClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof tripFormSchema>, unknown, z.output<typeof tripFormSchema>>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: '',
      source: '',
      destinations: [],
      useExactDates: false,
      startDate: '',
      endDate: '',
      durationDays: undefined,
      startTime: '10:00',
      endTime: '19:00',
      travelers: 1,
      budget: 0,
      currency: 'USD',
      transportPreferences: [],
      interests: [],
      foodPreferences: [],
      accessibilityNeeds: [],
      autoSequence: true,
    },
  })

  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const useExactDates = watch('useExactDates')
  const durationDays = watch('durationDays')

  useEffect(() => {
    if (!templateId) return

    async function loadTemplate() {
      const { data: template } = await supabase
        .from('trip_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (!template) return

      const metas = await buildDestinationMeta(template.destinations)

      setValue('title', template.title)
      setValue(
        'destinations',
        template.destinations.map((name: string, i: number) => ({
          name,
          country: metas[i]?.country ?? null,
          countryCode: metas[i]?.countryCode ?? null,
          lat: metas[i]?.lat ?? null,
          lon: metas[i]?.lon ?? null,
          note: '',
          photoUrl: null,
        }))
      )
      setValue('interests', template.interests)
      if (template.duration_days_min) {
        setValue('durationDays', template.duration_days_min)
      }
    }

    loadTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  function toggleTag(field: TagField, value: string) {
    const current = (watch(field) as string[]) || []
    if (current.includes(value)) {
      setValue(field, current.filter((v) => v !== value) as never, { shouldValidate: true })
    } else {
      setValue(field, [...current, value] as never, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: TripFormValues) => {
    setSubmitError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError('You must be signed in to create a trip.')
      return
    }

    const [sourceMeta] = await buildDestinationMeta([data.source])

    const destinationNames = data.destinations.map((d) => d.name)
    const destinationMeta = data.destinations.map((d) => ({
      destination: d.name,
      country: d.country ?? null,
      countryCode: d.countryCode ?? null,
      lat: d.lat ?? null,
      lon: d.lon ?? null,
      note: d.note || null,
      photoUrl: d.photoUrl ?? null,
    }))

    const isSingleDay = !data.useExactDates && data.durationDays === 1

    const { error } = await supabase.from('trips').insert({
      user_id: user.id,
      title: data.title,
      source: data.source,
      destinations: destinationNames,
      destination_meta: destinationMeta,
      source_meta: sourceMeta,
      auto_sequence: data.autoSequence,
      start_date: data.useExactDates ? data.startDate : null,
      end_date: data.useExactDates ? data.endDate : null,
      duration_days: data.useExactDates ? null : data.durationDays,
      start_time: isSingleDay ? data.startTime || null : null,
      end_time: isSingleDay ? data.endTime || null : null,
      travelers: data.travelers,
      budget: data.budget,
      currency: data.currency,
      transport_preferences: data.transportPreferences,
      interests: data.interests,
      food_preferences: data.foodPreferences,
      accessibility_needs: data.accessibilityNeeds,
      status: 'planning',
    })

    if (error) {
      setSubmitError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Trip title</label>
        <input
          {...register('title')}
          type="text"
          placeholder="e.g. Summer in Japan"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Starting from</label>
        <input
          {...register('source')}
          type="text"
          placeholder="e.g. Pune, India"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>}
      </div>

      <div>
        <DestinationCardsInput
          value={watch('destinations') || []}
          onChange={(destinations) => setValue('destinations', destinations, { shouldValidate: true })}
          error={errors.destinations?.message as string | undefined}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('autoSequence')} className="h-4 w-4 rounded border-gray-300" defaultChecked />
          Let AI figure out the best order for these stops
        </label>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" {...register('useExactDates')} className="h-4 w-4 rounded border-gray-300" />
          I know my exact travel dates
        </label>

        {useExactDates ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start date</label>
              <input
                {...register('startDate')}
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End date</label>
              <input
                {...register('endDate')}
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">How many days?</label>
            <div className="mb-2 flex gap-2">
              {QUICK_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue('durationDays', d, { shouldValidate: true })}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    durationDays === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d} day{d > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <input
              {...register('durationDays')}
              type="number"
              min={1}
              max={60}
              step={1}
              placeholder="Custom number of days"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            {errors.durationDays && <p className="mt-1 text-sm text-red-600">{errors.durationDays.message}</p>}
            <p className="mt-1 text-xs text-gray-400">You can add exact dates later from the trip page.</p>

            {durationDays === 1 && (
              <div className="mt-3 grid grid-cols-2 gap-4 rounded-lg bg-blue-50/50 p-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start time</label>
                  <input
                    {...register('startTime')}
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">End time</label>
                  <input
                    {...register('endTime')}
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Travelers</label>
          <input
            {...register('travelers')}
            type="number"
            min={1}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          {errors.travelers && <p className="mt-1 text-sm text-red-600">{errors.travelers.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Budget</label>
          <input
            {...register('budget')}
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
          <select
            {...register('currency')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <TagSelector
        selected={watch('transportPreferences') || []}
        options={TRANSPORT_PREFERENCES}
        label="Transport preferences (optional)"
        onToggle={(v) => toggleTag('transportPreferences', v)}
      />
      <TagSelector
        selected={watch('interests') || []}
        options={TRIP_INTERESTS}
        label="Preferences (optional)"
        onToggle={(v) => toggleTag('interests', v)}
      />
      <TagSelector
        selected={watch('foodPreferences') || []}
        options={FOOD_PREFERENCES}
        label="Food preferences (optional)"
        onToggle={(v) => toggleTag('foodPreferences', v)}
      />
      <TagSelector
        selected={watch('accessibilityNeeds') || []}
        options={ACCESSIBILITY_NEEDS}
        label="Accessibility needs (optional)"
        onToggle={(v) => toggleTag('accessibilityNeeds', v)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
                {isSubmitting && <CompassSpinner className="h-4 w-4" />} {isSubmitting ? 'Creating...' : 'Create Trip'}
      </button>
    </form>
  )
}