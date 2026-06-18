'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Plus,
  Dumbbell,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Activity,
  Eye,
} from 'lucide-react'
import { api, type DashboardStats } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Section =
  | 'dashboard'
  | 'clients'
  | 'workouts'
  | 'nutrition'
  | 'progress'
  | 'sessions'
  | 'payments'
  | 'settings'

interface DashboardHomeProps {
  onNavigate: (section: Section) => void
}

interface PaymentSummary {
  totalPaid: number
  pendingAmount: number
  thisMonthPaid: number
  lastMonthPaid: number
  monthOverMonthChange: number
  overdueCount: number
}

// ─── Helpers ────────────────────────────────────────────────

const formatCurrency = (amount: number, lang: string) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const formatDateTime = (dateStr: string, lang: string) => {
  try {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

const formatRelativeTime = (dateStr: string, t: any, lang: string) => {
  try {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t.dashboard.justNow
    if (diffMins < 60) return `${diffMins}${t.dashboard.minutesAgo}`
    if (diffHours < 24) return `${diffHours}${t.dashboard.hoursAgo}`
    if (diffDays < 7) return `${diffDays}${t.dashboard.daysAgo}`
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const getActionIcon = (action: string) => {
  const lower = action.toLowerCase()
  if (lower.includes('create') || lower.includes('add')) return <Plus className="w-3.5 h-3.5" />
  if (lower.includes('update') || lower.includes('edit')) return <Eye className="w-3.5 h-3.5" />
  if (lower.includes('delete') || lower.includes('remove')) return <AlertCircle className="w-3.5 h-3.5" />
  return <Activity className="w-3.5 h-3.5" />
}

const getActionColor = (action: string) => {
  const lower = action.toLowerCase()
  if (lower.includes('create') || lower.includes('add')) return 'text-green-400 bg-green-400/10'
  if (lower.includes('update') || lower.includes('edit')) return 'text-blue-400 bg-blue-400/10'
  if (lower.includes('delete') || lower.includes('remove')) return 'text-red-400 bg-red-400/10'
  return 'text-amber-400 bg-amber-400/10'
}

// ─── Animation variants ─────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ─── Custom Tooltip for Recharts ────────────────────────────

function CustomTooltip({ active, payload, label, t }: {
  active?: boolean
  payload?: { value: number; dataKey: string; color: string }[]
  label?: string
  t: any
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-3 text-xs" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.dataKey === 'thisMonth' ? t.dashboard.thisMonth : t.dashboard.lastMonth}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { t, lang, dir } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, paymentRes] = await Promise.allSettled([
        api.getStats(),
        api.getPaymentSummary(),
      ])

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.stats as DashboardStats)
      }
      if (paymentRes.status === 'fulfilled') {
        setPaymentSummary((paymentRes.value as { summary: PaymentSummary }).summary)
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  // ─── Derived data ───────────────────────────────────────

  const revenueThisMonth = stats?.revenue?.thisMonthPaid ?? paymentSummary?.thisMonthPaid ?? 0
  const totalRevenue = stats?.revenue?.totalPaid ?? paymentSummary?.totalPaid ?? 0
  const pendingPayments = stats?.revenue?.pendingAmount ?? paymentSummary?.pendingAmount ?? 0
  const overdueCount = paymentSummary?.overdueCount ?? 0

  const chartData = [
    {
      name: t.dashboard.revenue,
      thisMonth: revenueThisMonth,
      lastMonth: paymentSummary?.lastMonthPaid ?? 0,
    },
  ]

  const statCards = [
    {
      title: t.dashboard.totalClients,
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/15',
    },
    {
      title: t.dashboard.activeClients,
      value: stats?.activeClients ?? 0,
      icon: UserCheck,
      color: 'text-green-400',
      bg: 'bg-green-400/15',
    },
    {
      title: t.dashboard.sessionsThisWeek,
      value: stats?.sessionsThisWeek ?? 0,
      icon: Calendar,
      color: 'text-red-400',
      bg: 'bg-red-400/15',
    },
    {
      title: t.dashboard.revenueThisMonth,
      value: formatCurrency(revenueThisMonth, lang),
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-400/15',
    },
  ]

  // ─── Loading state ──────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>

        {/* Revenue skeleton */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Quick actions skeleton */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Upcoming sessions skeleton */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Stats Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.title}</p>
            </motion.div>
          )
        })}
      </div>

      {/* ── Revenue Overview ────────────────────────────── */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t.dashboard.revenueOverview}</h2>

        {/* Mini stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">{t.dashboard.totalRevenue}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue, lang)}</p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">{t.dashboard.pendingPayments}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(pendingPayments, lang)}</p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground">{t.dashboard.overdue}</span>
            </div>
            <p className="text-xl font-bold text-white">{overdueCount}</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fill: '#888', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#888', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip t={t} />} />
              <Bar dataKey="thisMonth" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={60} />
              <Bar dataKey="lastMonth" fill="#6b7280" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Month-over-month badge */}
        {paymentSummary?.monthOverMonthChange !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                paymentSummary.monthOverMonthChange >= 0
                  ? 'text-green-400 bg-green-400/10'
                  : 'text-red-400 bg-red-400/10'
              }`}
            >
              {paymentSummary.monthOverMonthChange >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(paymentSummary.monthOverMonthChange).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">{t.dashboard.vsLastMonth}</span>
          </div>
        )}
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────── */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t.dashboard.quickActions}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('clients')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-start group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-400/15 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">
                {t.dashboard.addClient}
              </p>
              <p className="text-xs text-muted-foreground">{t.dashboard.registerNewClient}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('workouts')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-start group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-400/15 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
                {t.dashboard.createWorkout}
              </p>
              <p className="text-xs text-muted-foreground">{t.dashboard.designWorkoutPlan}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('sessions')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-start group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                {t.dashboard.scheduleSession}
              </p>
              <p className="text-xs text-muted-foreground">{t.dashboard.bookTrainingSession}</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* ── Upcoming Sessions ──────────────────────────── */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t.dashboard.upcomingSessions}</h2>
          <button
            onClick={() => onNavigate('sessions')}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            {t.dashboard.viewAll} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {!stats?.upcomingSessions || stats.upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t.dashboard.noUpcomingSessions}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {t.dashboard.scheduledSessionsWillAppear}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.upcomingSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {session.client?.name || t.dashboard.clientFallback}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.type || t.dashboard.trainingFallback}
                      {session.duration ? ` · ${session.duration} ${t.dashboard.durationMin}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ms-3">
                  {formatDateTime(session.date, lang)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Recent Activity ────────────────────────────── */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t.dashboard.recentActivity}</h2>
          <button
            onClick={() => onNavigate('settings')}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            {t.dashboard.viewAll} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t.dashboard.noRecentActivity}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {t.dashboard.activityLogsWillAppear}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.recentActivity.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(entry.action)}`}
                  >
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      <span className="capitalize">{entry.action}</span>{' '}
                      <span className="text-muted-foreground">{entry.entity}</span>
                    </p>
                    {entry.details && (
                      <p className="text-xs text-muted-foreground/70 truncate">
                        {entry.details.slice(0, 60)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ms-3">
                  {formatRelativeTime(entry.createdAt, t, lang)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
