import { z } from 'zod'

export const TRIP_INTERESTS = [
  'Budget Friendly',
  'Luxury',
  'Adventure',
  'Photography',
  'Hidden Gems',
  'Food Tour',
  'Nature',
  'Trekking',
  'Shopping',
  'Relaxation',
  'History',
  'Family Friendly',
] as const

export const TRANSPORT_MODES = ['Car', 'Bike', 'Train', 'Bus', 'Flight'] as const

export const TRANSPORT_PREFERENCES = [
  'Prefer Flights',
  'Prefer Trains',
  'Prefer Road Trips',
  'Budget Friendly Transport',
  'Avoid Overnight Travel',
  'Minimize Transfers',
  'Public Transport Friendly',
] as const

export const FOOD_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Jain',
  'Halal',
  'Kosher',
  'Eggetarian',
  'No Beef',
  'No Pork',
  'No Seafood',
  'Gluten-Free',
  'Lactose-Free',
] as const

export const ACCESSIBILITY_NEEDS = [
  'Senior Citizens',
  'Children',
  'Motion Sickness',
  'Wheelchair Accessibility',
] as const

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'] as const

export const destinationCardSchema = z.object({
  name: z.string().min(2),
  country: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
  note: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
})

export const tripFormSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title must be under 80 characters'),
    description: z.string().max(500, 'Keep it under 500 characters').optional().default(''),
    source: z.string().min(2, 'Starting location is required'),
    destinations: z.array(destinationCardSchema).min(1, 'At least one destination is required'),
    useExactDates: z.boolean().default(false),
    startDate: z.string().optional().default(''),
    endDate: z.string().optional().default(''),
    durationDays: z.coerce.number().int().min(1).max(60).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    travelers: z.coerce.number().int('Must be a whole number').min(1, 'At least 1 traveler is required').max(50, 'Max 50 travelers'),
    budget: z.coerce.number().min(0, 'Budget cannot be negative'),
    currency: z.enum(CURRENCIES),
    transportPreferences: z.array(z.enum(TRANSPORT_PREFERENCES)).default([]),
    interests: z.array(z.enum(TRIP_INTERESTS)).default([]),
    foodPreferences: z.array(z.enum(FOOD_PREFERENCES)).default([]),
    accessibilityNeeds: z.array(z.enum(ACCESSIBILITY_NEEDS)).default([]),
    autoSequence: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.useExactDates) {
      if (!data.startDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start date is required', path: ['startDate'] })
      }
      if (!data.endDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date is required', path: ['endDate'] })
      }
      if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date must be on or after the start date', path: ['endDate'] })
      }
    } else if (!data.durationDays) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Trip length is required', path: ['durationDays'] })
    }
  })

export type TripFormValues = z.infer<typeof tripFormSchema>
export type DestinationCard = z.infer<typeof destinationCardSchema>