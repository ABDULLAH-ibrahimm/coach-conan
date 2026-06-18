'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/coach-api'
import type { Coach } from '@/lib/coach-api'
import { useI18n, I18nProvider } from '@/lib/i18n'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Dumbbell, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ── Login Screen ────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (coach: Coach, token: string) => void }) {
  const { t, lang } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isRTL = lang === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await api.login(email.trim(), password) as Record<string, unknown>
      const token = res.token as string
      const coach = res.coach as Coach

      if (!token || !coach) {
        setError(t.coachLogin.loginFailed)
        return
      }

      api.setToken(token)
      onLogin(coach, token)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.coachLogin.loginFailed
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Website */}
        <Button
          variant="ghost"
          onClick={() => { window.location.href = '/' }}
          className="mb-6 text-muted-foreground hover:text-white gap-2 -ml-2"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t.coachLogin.backToWebsite}</span>
        </Button>

        {/* Login Card */}
        <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/20">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-red-500/20 rounded-2xl blur-xl" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              COACH <span className="gradient-text">CONAN</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {t.coachLogin.subtitle}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                {t.coachLogin.email}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.coachLogin.emailPlaceholder}
                autoComplete="email"
                disabled={loading}
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-red-600/50 focus:ring-red-600/20 h-11"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                {t.coachLogin.password}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.coachLogin.passwordPlaceholder}
                  autoComplete="current-password"
                  disabled={loading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-red-600/50 focus:ring-red-600/20 h-11 pr-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
                </span>
              ) : (
                t.coachLogin.signIn
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          &copy; {new Date().getFullYear()} Coach Conan. All rights reserved.
        </p>
      </div>
    </div>
  )
}

// ── Dashboard Page ──────────────────────────────────────────────────────
function DashboardPageInner() {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return !!localStorage.getItem('coach_token')
  })
  // Check for existing token on mount
  useEffect(() => {
    const token = api.getToken()
    if (token) {
      api.getMe()
        .then((data) => {
          const resp = data as Record<string, unknown>
          // The API returns { coach: { id, name, email, ... } }
          const user = (resp.coach as Record<string, unknown>) || resp
          setCoach({
            id: user.id as string,
            name: (user.name as string) || '',
            email: (user.email as string) || '',
            profileImage: user.profileImage as string | undefined,
          })
        })
        .catch(() => {
          api.clearToken()
          setCoach(null)
        })
        .finally(() => setAuthLoading(false))
    } else {
      queueMicrotask(() => setAuthLoading(false))
    }
  }, [])

  const handleLogin = useCallback((_coach: Coach, _token: string) => {
    setCoach(_coach)
  }, [])

  const handleLogout = useCallback(() => {
    api.clearToken()
    setCoach(null)
  }, [])

  const handleBackToSite = useCallback(() => {
    window.location.href = '/'
  }, [])

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Dumbbell className="w-10 h-10 text-red-500 animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 bg-red-500/20 rounded-full blur-xl" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!coach) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Show dashboard layout when authenticated
  return (
    <DashboardLayout
      coach={coach}
      onLogout={handleLogout}
      onBackToSite={handleBackToSite}
    />
  )
}

// Wrap with I18nProvider since dashboard uses useI18n
export default function DashboardPage() {
  return (
    <I18nProvider>
      <DashboardPageInner />
    </I18nProvider>
  )
}
