import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen bg-cream lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <h1 className="mb-6 font-serif text-xl font-semibold text-navy-dark">Profile</h1>
        <ProfileForm
          email={user.email || ''}
          username={(user.user_metadata?.username as string) || ''}
          avatarUrl={(user.user_metadata?.avatar_url as string) || ''}
        />
      </div>
    </div>
  )
}