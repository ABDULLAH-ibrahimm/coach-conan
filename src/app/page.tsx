'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import Transformations from '@/components/sections/Transformations'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import Certificates from '@/components/sections/Certificates'
import Testimonials from '@/components/sections/Testimonials'
import Feedback from '@/components/sections/Feedback'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import { I18nProvider, useI18n } from '@/lib/i18n'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { api } from '@/lib/coach-api'
import { clientApi } from '@/lib/client-api'
import type { Coach as CoachType } from '@/lib/coach-api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ClientPortalView from '@/components/ClientPortalView'
import {
  Dumbbell, Eye, EyeOff, Loader2, ArrowLeft, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ── Coach Login Screen ─────────────────────────────────────────────────
function CoachLoginScreen({ onLogin }: { onLogin: (coach: CoachType, token: string) => void }) {
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
      const coach = res.coach as CoachType
      if (!token || !coach) {
        setError(isRTL ? 'فشل تسجيل الدخول' : 'Login failed')
        return
      }
      api.setToken(token)
      onLogin(coach, token)
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRTL ? 'فشل تسجيل الدخول' : 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              COACH <span className="gradient-text">CONAN</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {isRTL ? 'لوحة تحكم المدرب' : 'Coach Dashboard'}
            </p>
          </div>
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'}
                disabled={loading}
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-red-600/50 focus:ring-red-600/20 h-11"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? 'كلمة المرور' : 'Password'}
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
                </span>
              ) : (
                isRTL ? 'تسجيل الدخول' : 'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Client Phone Login Screen ──────────────────────────────────────────
function ClientPhoneLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const { lang } = useI18n()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isRTL = lang === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone.trim()) {
      setError(isRTL ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number')
      return
    }
    setLoading(true)
    try {
      const res = await clientApi.phoneLogin(phone.trim()) as Record<string, unknown>
      const token = res.token as string
      if (!token) {
        setError(isRTL ? 'رقم الهاتف غير مسجل. تواصل مع المدرب.' : 'Phone number not registered. Contact your coach.')
        return
      }
      clientApi.setToken(token)
      onLogin(token)
    } catch {
      setError(isRTL ? 'رقم الهاتف غير مسجل. تواصل مع المدرب.' : 'Phone number not registered. Contact your coach.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/30">
                <Phone className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              COACH <span className="gradient-text">CONAN</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {isRTL ? 'بوابة العميل' : 'Client Portal'}
            </p>
          </div>
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isRTL ? 'مثال: 01012345678' : 'e.g. 01012345678'}
                disabled={loading}
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-red-600/50 focus:ring-red-600/20 h-11"
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
                </span>
              ) : (
                isRTL ? 'تسجيل الدخول' : 'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Loading Spinner ────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Dumbbell className="w-10 h-10 text-red-500 animate-pulse" />
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

// ── Main Page Content ──────────────────────────────────────────────────
function PageContent() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'home'

  // Coach auth state
  const [coach, setCoach] = useState<CoachType | null>(null)
  const [coachAuthLoading, setCoachAuthLoading] = useState(true)

  // Client auth state
  const [clientAuthenticated, setClientAuthenticated] = useState(false)
  const [clientAuthLoading, setClientAuthLoading] = useState(true)

  // Check coach auth token on mount
  useEffect(() => {
    if (view !== 'dashboard') {
      setCoachAuthLoading(false)
      return
    }
    const token = api.getToken()
    if (token) {
      // Try to restore coach data from localStorage first (avoids extra API call)
      try {
        const savedCoach = localStorage.getItem('coach_data')
        if (savedCoach) {
          setCoach(JSON.parse(savedCoach) as CoachType)
          setCoachAuthLoading(false)
          return
        }
      } catch { /* ignore parse errors */ }

      // Fallback: fetch from API
      api.getMe()
        .then((data) => {
          const resp = data as Record<string, unknown>
          const user = (resp.coach as Record<string, unknown>) || resp
          const coachData: CoachType = {
            id: user.id as string,
            name: (user.name as string) || '',
            email: (user.email as string) || '',
            profileImage: user.profileImage as string | undefined,
          }
          setCoach(coachData)
          localStorage.setItem('coach_data', JSON.stringify(coachData))
        })
        .catch(() => {
          api.clearToken()
          setCoach(null)
          localStorage.removeItem('coach_data')
        })
        .finally(() => setCoachAuthLoading(false))
    } else {
      setCoachAuthLoading(false)
    }
  }, [view])

  // Check client auth token on mount
  useEffect(() => {
    if (view !== 'client-portal') {
      setClientAuthLoading(false)
      return
    }
    const token = clientApi.getToken()
    if (token) {
      clientApi.getMe()
        .then(() => setClientAuthenticated(true))
        .catch(() => {
          clientApi.clearToken()
          setClientAuthenticated(false)
        })
        .finally(() => setClientAuthLoading(false))
    } else {
      setClientAuthLoading(false)
    }
  }, [view])

  const handleCoachLogin = useCallback((_coach: CoachType, _token: string) => {
    setCoach(_coach)
    localStorage.setItem('coach_data', JSON.stringify(_coach))
  }, [])

  const handleCoachLogout = useCallback(() => {
    api.clearToken()
    setCoach(null)
    localStorage.removeItem('coach_data')
  }, [])

  const handleClientLogin = useCallback(() => {
    setClientAuthenticated(true)
  }, [])

  const handleClientLogout = useCallback(() => {
    clientApi.clearToken()
    setClientAuthenticated(false)
  }, [])

  const navigateHome = useCallback(() => {
    window.location.href = '/'
  }, [])

  // ── Dashboard View ──
  if (view === 'dashboard') {
    if (coachAuthLoading) return <LoadingSpinner />
    if (!coach) {
      return (
        <div className="min-h-screen bg-background relative">
          <div className="absolute top-4 left-4 z-50">
            <Button variant="ghost" onClick={navigateHome} className="text-muted-foreground hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>
          <CoachLoginScreen onLogin={handleCoachLogin} />
        </div>
      )
    }
    return (
      <DashboardLayout
        coach={coach}
        onLogout={handleCoachLogout}
        onBackToSite={navigateHome}
      />
    )
  }

  // ── Client Portal View ──
  if (view === 'client-portal') {
    if (clientAuthLoading) return <LoadingSpinner />
    if (!clientAuthenticated) {
      return (
        <div className="min-h-screen bg-background relative">
          <div className="absolute top-4 left-4 z-50">
            <Button variant="ghost" onClick={navigateHome} className="text-muted-foreground hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>
          <ClientPhoneLogin onLogin={handleClientLogin} />
        </div>
      )
    }
    return (
      <ClientPortalView onLogout={handleClientLogout} onBackToSite={navigateHome} />
    )
  }

  // ── Home View (default) ──
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <Transformations />
        <Pricing />
        <FAQ />
        <Certificates />
        <Testimonials />
        <Feedback />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

// ── Export with providers ──────────────────────────────────────────────
export default function Home() {
  return (
    <I18nProvider>
      <LanguageProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <PageContent />
        </Suspense>
      </LanguageProvider>
    </I18nProvider>
  )
}
