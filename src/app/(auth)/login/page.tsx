'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import CompassSpinner from '@/components/shared/CompassSpinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setMessage(null)
  setLoading(true)

  if (mode === 'forgot') {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setMessage('Check your email for a password reset link.')
    return
  }

  const { error } =
    mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { username } } })
      : await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    setLoading(false)
    setError(error.message)
    return
  }

  router.push('/dashboard')
  router.refresh()
}

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1832] px-4">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/world-map.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1832]/40 via-[#0B1832]/70 to-[#0B1832]" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo height={32} />
          <h1 className="mt-3 text-xl font-semibold text-gray-900">Welcome to Voya</h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'signup'
              ? 'Create your account to start planning'
              : mode === 'forgot'
              ? 'Enter your email to reset your password'
              : 'Sign in to continue your adventures'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'forgot' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required={mode === 'signup'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(null); setMessage(null) }}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
  type="submit"
  disabled={loading}
  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
>
    {loading && <CompassSpinner className="h-4 w-4" />}
  {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : mode === 'forgot' ? 'Send reset link' : 'Sign In'}
</button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setMessage(null) }}
          className="mt-4 w-full text-center text-sm text-blue-600 hover:underline"
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
        {mode === 'forgot' && (
          <button
            onClick={() => { setMode('signin'); setError(null); setMessage(null) }}
            className="mt-2 w-full text-center text-sm text-gray-500 hover:underline"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  )
}