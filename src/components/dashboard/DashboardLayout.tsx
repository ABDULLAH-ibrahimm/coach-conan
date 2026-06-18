'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Utensils,
  TrendingUp,
  Calendar,
  LogOut,
  Menu,
  ChevronLeft,
  DollarSign,
  Settings,
  ArrowLeft,
  FileSpreadsheet,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n'
import DashboardHome from './DashboardHome'
import ClientManager from './ClientManager'
import WorkoutManager from './WorkoutManager'
import NutritionManager from './NutritionManager'
import ProgressTracker from './ProgressTracker'
import SessionScheduler from './SessionScheduler'
import PaymentManager from './PaymentManager'
import CoachSettings from './CoachSettings'
import ClientSpreadsheet from './ClientSpreadsheet'

export type Section =
  | 'dashboard'
  | 'clients'
  | 'client-data'
  | 'workouts'
  | 'nutrition'
  | 'progress'
  | 'sessions'
  | 'payments'
  | 'settings'

interface CoachInfo {
  id: string
  name: string
  email: string
  profileImage?: string
}

interface DashboardLayoutProps {
  coach: CoachInfo | null
  onLogout: () => void
  onBackToSite?: () => void
}

const NAV_ITEMS: { id: Section; icon: React.ElementType }[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'clients', icon: Users },
  { id: 'client-data', icon: FileSpreadsheet },
  { id: 'workouts', icon: Dumbbell },
  { id: 'nutrition', icon: Utensils },
  { id: 'progress', icon: TrendingUp },
  { id: 'sessions', icon: Calendar },
  { id: 'payments', icon: DollarSign },
  { id: 'settings', icon: Settings },
]

function SidebarContent({
  activeSection,
  onSectionChange,
  collapsed,
  coach,
  onLogout,
  onBackToSite,
}: {
  activeSection: Section
  onSectionChange: (s: Section) => void
  collapsed: boolean
  coach: CoachInfo | null
  onLogout: () => void
  onBackToSite?: () => void
}) {
  const { t, lang, toggleLang } = useI18n()

  const sectionLabels: Record<Section, string> = {
    'dashboard': t.dashboard.dashboard,
    'clients': t.dashboard.clients,
    'client-data': t.dashboard.clientData,
    'workouts': t.dashboard.workouts,
    'nutrition': t.dashboard.nutrition,
    'progress': t.dashboard.progress,
    'sessions': t.dashboard.sessions,
    'payments': t.dashboard.payments,
    'settings': t.dashboard.settings,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Dumbbell className="w-8 h-8 text-red-500" />
          <div className="absolute inset-0 w-8 h-8 bg-red-500/20 rounded-full blur-lg" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
            COACH <span className="gradient-text">CONAN</span>
          </span>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 shadow-lg shadow-red-600/5'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{sectionLabels[item.id]}</span>}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/10" />

      {/* User section */}
      <div className="p-3">
        {!collapsed && coach && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="w-9 h-9 border border-red-600/30">
              <AvatarFallback className="bg-red-600/20 text-red-400 text-sm font-bold">
                {(coach.name || '')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{coach.name || ''}</p>
              <p className="text-xs text-muted-foreground truncate">{coach.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleLang}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-all w-full mb-1"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t.nav.langToggle}</span>}
        </button>
        {onBackToSite && (
          <button
            onClick={onBackToSite}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-all w-full mb-1"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0 rtl:rotate-180" />
            {!collapsed && <span>{t.dashboard.backToWebsite}</span>}
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-600/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t.dashboard.signOut}</span>}
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ coach, onLogout, onBackToSite }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, dir } = useI18n()

  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    setMobileOpen(false)
  }

  const handleProfileUpdate = (updatedCoach: { id: string; name: string; email: string; profileImage?: string }) => {
    // The parent component manages coach state, so we'd need to propagate this
    // For now, the settings component handles its own state internally
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome onNavigate={setActiveSection} />
      case 'clients':
        return <ClientManager />
      case 'client-data':
        return <ClientSpreadsheet />
      case 'workouts':
        return <WorkoutManager />
      case 'nutrition':
        return <NutritionManager />
      case 'progress':
        return <ProgressTracker />
      case 'sessions':
        return <SessionScheduler />
      case 'payments':
        return <PaymentManager />
      case 'settings':
        return <CoachSettings coach={coach} onProfileUpdate={handleProfileUpdate} />
      default:
        return <DashboardHome onNavigate={setActiveSection} />
    }
  }

  const sectionLabels: Record<Section, string> = {
    'dashboard': t.dashboard.dashboard,
    'clients': t.dashboard.clients,
    'client-data': t.dashboard.clientData,
    'workouts': t.dashboard.workouts,
    'nutrition': t.dashboard.nutrition,
    'progress': t.dashboard.progress,
    'sessions': t.dashboard.sessions,
    'payments': t.dashboard.payments,
    'settings': t.dashboard.settings,
  }
  const sectionTitle = sectionLabels[activeSection] || t.dashboard.dashboard

  return (
    <div className="min-h-screen bg-background flex" dir={dir}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/10 bg-card/50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          coach={coach}
          onLogout={onLogout}
          onBackToSite={onBackToSite}
        />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center py-3 border-t border-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4 rtl:rotate-180" />}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 bg-card/95 border-white/10">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SidebarContent
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    collapsed={false}
                    coach={coach}
                    onLogout={onLogout}
                    onBackToSite={onBackToSite}
                  />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-semibold text-white">{sectionTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              {coach && (
                <div className="hidden sm:flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-red-600/30">
                    <AvatarFallback className="bg-red-600/20 text-red-400 text-xs font-bold">
                      {(coach.name || '')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{coach.name || ''}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
