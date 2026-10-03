'use client'

import { useState } from 'react'
import { TripAIContent } from '@/lib/validations/trip-ai-content'
import { DestinationMeta } from '@/types/trip'
import JourneyCard from '@/components/workspace/cards/JourneyCard'
import OverviewCard from '@/components/workspace/cards/OverviewCard'
import TimelineCard from '@/components/workspace/cards/TimelineCard'
import PackingChecklistCard from '@/components/workspace/cards/PackingChecklistCard'
import WorthItAnalysisCard from '@/components/workspace/cards/WorthItAnalysisCard'
import CrowdIntelligenceCard from '@/components/workspace/cards/CrowdIntelligenceCard'
import SmartChecklistCard from '@/components/workspace/cards/SmartChecklistCard'
import MobilityIntelligenceCard from '@/components/workspace/cards/MobilityIntelligenceCard'
import AccommodationIntelligenceCard from '@/components/workspace/cards/AccommodationIntelligenceCard'
import RestaurantRecommendationsCard from '@/components/workspace/cards/RestaurantRecommendationsCard'
import LocalWisdomCard from '@/components/workspace/cards/LocalWisdomCard'
import LocalRegulationsCard from '@/components/workspace/cards/LocalRegulationsCard'
import WeatherCard from '@/components/workspace/cards/WeatherCard'
import MedicalRecommendationsCard from '@/components/workspace/cards/MedicalRecommendationsCard'
import EmergencyInfoCard from '@/components/workspace/cards/EmergencyInfoCard'
import CurrencyInfoCard from '@/components/workspace/cards/CurrencyInfoCard'
import OfflineLanguageCard from '@/components/workspace/cards/OfflineLanguageCard'

const TABS = ['Overview', 'Planning', 'Food', 'Safety', 'Utilities'] as const
type Tab = (typeof TABS)[number]

export default function WorkspaceSections({
  content,
  sourceMeta,
  destinationMeta,
}: {
  content: TripAIContent
  sourceMeta: DestinationMeta | null
  destinationMeta: DestinationMeta[] | null
}) {
  const [tab, setTab] = useState<Tab>('Overview')
  const hasUtilities = content.tripType === 'international' && (content.currencyInfo || content.offlineLanguage)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,1fr)_2fr] print:grid-cols-1">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <TimelineCard data={content.timeline} />
      </div>

      <div>
        <div className="mb-5">
          <JourneyCard journeyPlan={content.journeyPlan} sourceMeta={sourceMeta} destinationMeta={destinationMeta} />
        </div>

        <div className="mb-5 flex flex-wrap gap-1 rounded-2xl border border-sand bg-cream/80 p-1.5 shadow-sm backdrop-blur print:hidden">
          {TABS.filter((t) => t !== 'Utilities' || hasUtilities).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t ? 'bg-brass text-navy-dark' : 'text-navy-dark/60 hover:bg-sand/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={tab === 'Overview' ? 'block' : 'hidden print:block'}>
          <div className="mb-5"><OverviewCard data={content.overview} /></div>
        </div>
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-1 ${tab === 'Planning' ? 'grid' : 'hidden print:grid'}`}>
          <PackingChecklistCard data={content.packingChecklist} />
          <WorthItAnalysisCard data={content.worthItAnalysis} />
          <CrowdIntelligenceCard data={content.crowdIntelligence} />
          <SmartChecklistCard data={content.smartChecklist} />
          <MobilityIntelligenceCard data={content.mobilityIntelligence} />
          <AccommodationIntelligenceCard data={content.accommodationIntelligence} />
        </div>
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-1 ${tab === 'Food' ? 'grid' : 'hidden print:grid'}`}>
          <RestaurantRecommendationsCard data={content.restaurantRecommendations} />
        </div>
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-1 ${tab === 'Safety' ? 'grid' : 'hidden print:grid'}`}>
          <LocalWisdomCard data={content.localWisdom} />
          <LocalRegulationsCard data={content.localRegulations} />
          <WeatherCard data={content.weather} />
          <MedicalRecommendationsCard data={content.medicalRecommendations} />
          <EmergencyInfoCard data={content.emergencyInfo} />
        </div>
        {hasUtilities && (
          <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-1 ${tab === 'Utilities' ? 'grid' : 'hidden print:grid'}`}>
            {content.currencyInfo && <CurrencyInfoCard data={content.currencyInfo} />}
            {content.offlineLanguage && <OfflineLanguageCard data={content.offlineLanguage} />}
          </div>
        )}
      </div>
    </div>
  )
}