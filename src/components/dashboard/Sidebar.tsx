'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Map, Calendar, Bell, Compass, Settings, LogOut, User, Menu, X, Sparkles } from 'lucide-react'
import Logo from '@/components/shared/Logo'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { icon: Sparkles, label: 'Create with AI', href: '/templates/new' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Map, label: 'Trips', href: '/dashboard' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: Bell, label: 'Alerts', href: '/alerts' },
  { icon: Compass, label: 'Explore Trips', href: '/explore' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<{ username: string; avatarUrl: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setProfile({
          username: (user.user_metadata?.username as string) || user.email?.split('@')[0] || 'traveler',
          avatarUrl: (user.user_metadata?.avatar_url as string) || '',
        })
      }
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navContent = (
    <>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === pathname || (item.label === 'Trips' && pathname.startsWith('/trips'))
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive ? 'bg-white/10 font-medium text-white' : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
            pathname === '/profile' ? 'bg-white/10 font-medium text-white' : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="truncate">{profile?.username || 'Profile'}</span>
        </Link>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
            pathname === '/settings' ? 'bg-white/10 font-medium text-white' : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-blue-100/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-[#0B1832] px-4 py-3 lg:hidden">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo height={24} />
        </Link>
        <button onClick={() => setMobileOpen(true)} className="text-white" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-[#0B1832] p-5">
            <div className="mb-8 flex items-center justify-between px-1">
              <Logo height={26} />
              <button onClick={() => setMobileOpen(false)} className="text-blue-100/60" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-[#0B1832] p-5 lg:flex">
        <div className="mb-8 px-1">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Logo height={26} />
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  )
}