import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ExploreClient from '@/components/explore/ExploreClient'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen bg-cream lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="mb-6 font-serif text-xl font-semibold text-navy-dark">Explore</h1>
        <ExploreClient />
      </div>
    </div>
  )
}