import { z } from 'zod'
import { TRIP_INTERESTS, TRANSPORT_MODES } from './trip'
import { TEMPLATE_TAGS } from './trip-template-ai'

export const templateDraftSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  destinations: z.array(z.string()),
  transportMode: z.enum(TRANSPORT_MODES).nullable(),
  interests: z.array(z.enum(TRIP_INTERESTS)),
  tags: z.array(z.enum(TEMPLATE_TAGS)),
  durationDaysMin: z.number().int().nullable(),
  durationDaysMax: z.number().int().nullable(),
  isInternational: z.boolean().nullable(),
})

export const templateChatResponseSchema = z.object({
  draft: templateDraftSchema,
  clarifyingQuestion: z.string().nullable(),
  readyToCreate: z.boolean(),
})

export type TemplateDraft = z.infer<typeof templateDraftSchema>
export type TemplateChatResponse = z.infer<typeof templateChatResponseSchema>