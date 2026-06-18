'use client'

import { useState, useEffect } from 'react'
import { Dumbbell, Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff, Globe, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'

interface LoginScreenProps {
  onLogin: (coach: Record<string, unknown>) => void
  onBack: () => void
}

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const { t, lang, toggleLang, dir } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check API connectivity on mount
  // Note: /api/health is a Next.js route that checks if the Express backend is reachable
  useEffect(() => {
    let cancelled = false
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health')
        const data = await res.json()
        if (!cancelled) {
          setApiStatus(data.coachApi?.reachable ? 'online' : 'offline')
        }
      } catch {
        if (!cancelled) setApiStatus('offline')
      }
    }
    checkHealth()
    // Recheck every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.login(email, password)
      api.setToken(res.token as string)
      onLogin(res.coach as Record<string, unknown>)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.coachLogin.loginFailed
      // If the error suggests server is unreachable, update API status
      if (message.includes('Unable to connect') || message.includes('unavailable')) {
        setApiStatus('offline')
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={dir}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative">
        <div className="flex justify-between items-center mb-3">
          {/* API Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {apiStatus === 'checking' && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Checking...</span>
              </span>
            )}
            {apiStatus === 'online' && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </span>
            )}
            {apiStatus === 'offline' && (
              <span className="flex items-center gap-1 text-red-400">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">{t.nav.langToggle}</span>
          </button>
        </div>
        <div className="glass rounded-3xl p-8 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.coachLogin.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t.coachLogin.subtitle}</p>
            </div>
          </div>

          {/* Offline warning */}
          {apiStatus === 'offline' && (
            <div className="bg-amber-600/10 border border-amber-600/20 rounded-xl p-3 text-xs text-amber-400">
              Server is currently unreachable. Please try again in a moment.
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.coachLogin.email}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.coachLogin.emailPlaceholder}
                  required
                  autoComplete="email"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.coachLogin.password}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.coachLogin.passwordPlaceholder}
                  required
                  autoComplete="current-password"
                  className="pl-10 pe-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || apiStatus === 'offline'}
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 h-12 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.coachLogin.signIn}
            </Button>
          </form>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" /> {t.coachLogin.backToWebsite}
          </button>
        </div>
      </div>
    </div>
  )
}
