'use client'

import {
  Dumbbell,
  LogOut,
  ArrowLeft,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import ClientDashboard from './ClientDashboard'
import type { ClientUser } from '@/lib/client-api'
import { useI18n } from '@/lib/i18n'

interface ClientPortalLayoutProps {
  client: Record<string, unknown>
  onLogout: () => void
  onBackToSite: () => void
}

export default function ClientPortalLayout({ client, onLogout, onBackToSite }: ClientPortalLayoutProps) {
  const { t, lang, dir, toggleLang } = useI18n()
  const clientName = (client.name as string) || t.clientDash.client
  const clientEmail = (client.email as string) || ''

  return (
    <div dir={dir} className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu placeholder - keeps alignment consistent */}
            <div className="lg:hidden w-9" />

            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Dumbbell className="w-7 h-7 text-red-500" />
                <div className="absolute inset-0 w-7 h-7 bg-red-500/20 rounded-full blur-lg" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">
                COACH <span className="gradient-text">CONAN</span>
              </span>
            </div>

            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />

            <span className="text-sm text-muted-foreground hidden sm:inline">{t.dashboard.clientPortal}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Client Info */}
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-red-600/30">
                <AvatarFallback className="bg-red-600/20 text-red-400 text-xs font-bold">
                  {clientName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white leading-tight">{clientName}</p>
                <p className="text-xs text-muted-foreground leading-tight">{clientEmail}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="text-muted-foreground hover:text-white hover:bg-white/5 gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{t.nav.langToggle}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSite}
              className="text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
              <span className="hidden md:inline">{t.dashboard.website}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
            >
              <LogOut className="w-4 h-4 me-2" />
              <span className="hidden md:inline">{t.dashboard.signOut}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        <ClientDashboard client={client as unknown as ClientUser} />
      </main>
    </div>
  )
}
