'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Scale,
  Dumbbell,
  Utensils,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  Moon,
  Timer,
  Target,
  Clock,
  MapPin,
  Droplets,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { clientApi } from '@/lib/client-api'
import type {
  ClientUser,
  ClientWorkoutProgram,
  ClientNutritionPlan,
  ClientProgressEntry,
  ClientSession,
  ClientPayment,
} from '@/lib/client-api'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useI18n } from '@/lib/i18n'

// ============ Animation variants ============

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

// ============ Constants ============

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Snack: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Lunch: 'bg-green-500/10 text-green-400 border-green-500/20',
  Dinner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Pre-Workout': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Post-Workout': 'bg-red-500/10 text-red-400 border-red-500/20',
  Custom: 'bg-white/5 text-white/70 border-white/10',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-400/10 text-green-400 border-green-400/20',
  pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  overdue: 'bg-red-400/10 text-red-400 border-red-400/20',
  cancelled: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
}

const SESSION_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  completed: 'bg-green-400/10 text-green-400 border-green-400/20',
  cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
  'no-show': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
}

// ============ Progress Form ============

const emptyProgressForm = {
  weight: '',
  bodyFat: '',
  muscleMass: '',
  waist: '',
  chest: '',
  arms: '',
  thighs: '',
  hips: '',
  notes: '',
}

// ============ Main Component ============

interface ClientDashboardProps {
  client: ClientUser
}

export default function ClientDashboard({ client }: ClientDashboardProps) {
  const { t, lang, dir } = useI18n()
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [workouts, setWorkouts] = useState<ClientWorkoutProgram[]>([])
  const [nutritionPlans, setNutritionPlans] = useState<ClientNutritionPlan[]>([])
  const [progressEntries, setProgressEntries] = useState<ClientProgressEntry[]>([])
  const [sessions, setSessions] = useState<ClientSession[]>([])
  const [payments, setPayments] = useState<ClientPayment[]>([])
  const [loading, setLoading] = useState(true)

  // Progress dialog
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [progressForm, setProgressForm] = useState(emptyProgressForm)
  const [submitting, setSubmitting] = useState(false)
  const [progressError, setProgressError] = useState('')

  // Workout detail
  const [viewingWorkout, setViewingWorkout] = useState<ClientWorkoutProgram | null>(null)
  const [viewingNutrition, setViewingNutrition] = useState<ClientNutritionPlan | null>(null)

  // ============ Helpers (use lang) ============

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string) => {
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  // Session status label mapper
  const sessionStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return t.clientDash.scheduled
      case 'completed': return t.clientDash.completed
      case 'cancelled': return t.clientDash.cancelled
      case 'no-show': return t.clientDash.noShow
      default: return status
    }
  }

  // Payment status label mapper
  const paymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return t.clientDash.paid
      case 'pending': return t.clientDash.pending
      case 'overdue': return t.clientDash.overdue
      default: return status
    }
  }

  // ============ Custom Chart Tooltip ============

  function ChartTooltip({ active, payload, label }: {
    active?: boolean
    payload?: { value: number; dataKey: string; color: string }[]
    label?: string
  }) {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg p-3 text-xs" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {t.clientDash.weight}: {entry.value} kg
          </p>
        ))}
      </div>
    )
  }

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [wRes, nRes, pRes, sRes, payRes] = await Promise.allSettled([
        clientApi.getWorkouts(),
        clientApi.getNutritionPlans(),
        clientApi.getProgress(),
        clientApi.getSessions(),
        clientApi.getPayments(),
      ])
      if (wRes.status === 'fulfilled') setWorkouts((wRes.value.workouts as ClientWorkoutProgram[]) || [])
      if (nRes.status === 'fulfilled') setNutritionPlans((nRes.value.nutritionPlans as ClientNutritionPlan[]) || [])
      if (pRes.status === 'fulfilled') setProgressEntries(
        ((pRes.value.progress as ClientProgressEntry[]) || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
      if (sRes.status === 'fulfilled') setSessions((sRes.value.sessions as ClientSession[]) || [])
      if (payRes.status === 'fulfilled') setPayments((payRes.value.payments as ClientPayment[]) || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddProgress = async () => {
    setProgressError('')
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        weight: progressForm.weight ? Number(progressForm.weight) : undefined,
        bodyFat: progressForm.bodyFat ? Number(progressForm.bodyFat) : undefined,
        muscleMass: progressForm.muscleMass ? Number(progressForm.muscleMass) : undefined,
        waist: progressForm.waist ? Number(progressForm.waist) : undefined,
        chest: progressForm.chest ? Number(progressForm.chest) : undefined,
        arms: progressForm.arms ? Number(progressForm.arms) : undefined,
        thighs: progressForm.thighs ? Number(progressForm.thighs) : undefined,
        hips: progressForm.hips ? Number(progressForm.hips) : undefined,
        notes: progressForm.notes || undefined,
      }
      await clientApi.addProgress(payload)
      setShowProgressDialog(false)
      setProgressForm(emptyProgressForm)
      loadData()
    } catch (err) {
      setProgressError(err instanceof Error ? err.message : t.clientDash.failedAddProgress)
    } finally {
      setSubmitting(false)
    }
  }

  const loadWorkoutDetail = async (id: string) => {
    try {
      const res = await clientApi.getWorkout(id)
      if (res.workout) setViewingWorkout(res.workout as ClientWorkoutProgram)
    } catch {
      // silently handle
    }
  }

  const loadNutritionDetail = async (id: string) => {
    try {
      const res = await clientApi.getNutritionPlan(id)
      if (res.nutritionPlan) setViewingNutrition(res.nutritionPlan as ClientNutritionPlan)
    } catch {
      // silently handle
    }
  }

  // Derived data
  const activeWorkout = workouts.find(w => w.status === 'active') || workouts[0]
  const activeNutrition = nutritionPlans.find(n => n.status === 'active') || nutritionPlans[0]
  const latestProgress = progressEntries[0]
  const upcomingSessions = sessions
    .filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Chart data
  const chartData = progressEntries
    .filter(e => e.weight)
    .slice(0, 30)
    .reverse()
    .map(e => ({
      date: formatDate(e.createdAt),
      weight: e.weight,
    }))

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // ============ OVERVIEW TAB ============

  const renderOverview = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white">
          {t.clientDash.welcomeBack}, <span className="gradient-text">{client.name?.split(' ')[0] || t.clientDash.client}</span>!
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{t.clientDash.trainingOverview}</p>
      </motion.div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div key="weight" variants={itemVariants} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/15 flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{latestProgress?.weight || client.weight || '—'}</p>
          <p className="text-sm text-muted-foreground mt-1">{t.clientDash.weight}</p>
        </motion.div>

        <motion.div key="goal" variants={itemVariants} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-400/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white">{client.goal || '—'}</p>
          <p className="text-sm text-muted-foreground mt-1">{t.clientDash.goalLabel}</p>
        </motion.div>

        <motion.div key="workout" variants={itemVariants} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/15 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white truncate">{activeWorkout?.name || t.clientDash.none}</p>
          <p className="text-sm text-muted-foreground mt-1">{t.clientDash.activeProgram}</p>
        </motion.div>

        <motion.div key="session" variants={itemVariants} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white">
            {upcomingSessions[0] ? formatDateTime(upcomingSessions[0].date) : t.clientDash.none}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{t.clientDash.nextSession}</p>
        </motion.div>
      </div>

      {/* Progress summary */}
      {latestProgress && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t.clientDash.latestMeasurements}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {latestProgress.weight > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <p className="text-xl font-bold text-white">{latestProgress.weight} kg</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.weight}</p>
              </div>
            )}
            {latestProgress.bodyFat > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <p className="text-xl font-bold text-white">{latestProgress.bodyFat}%</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.bodyFat}</p>
              </div>
            )}
            {latestProgress.muscleMass > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <p className="text-xl font-bold text-white">{latestProgress.muscleMass} kg</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.muscleMass}</p>
              </div>
            )}
            {latestProgress.waist > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <p className="text-xl font-bold text-white">{latestProgress.waist} cm</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.waist}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t.clientDash.recordedOn} {formatDate(latestProgress.createdAt || latestProgress.recordedAt)}
          </p>
        </motion.div>
      )}
    </motion.div>
  )

  // ============ WORKOUTS TAB ============

  const renderWorkouts = () => {
    if (viewingWorkout) {
      const w = viewingWorkout
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewingWorkout(null)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{w.name}</h2>
              <p className="text-muted-foreground text-sm">
                {w.frequency && `${w.frequency} · `}
                {w.durationWeeks ? `${w.durationWeeks} ${t.clientDash.week}${w.durationWeeks > 1 ? (lang === 'ar' ? '' : 's') : ''}` : ''}
                {w.status && ` · ${w.status}`}
              </p>
            </div>
          </div>

          {w.description && (
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">{w.description}</p>
            </div>
          )}

          {w.weeks && w.weeks.length > 0 ? (
            <Accordion type="multiple" defaultValue={w.weeks.map((_, i) => `week-${i}`)} className="space-y-3">
              {w.weeks.map((week, wi) => (
                <AccordionItem key={week.id || wi} value={`week-${wi}`} className="glass rounded-2xl border-none px-6">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-400">{week.weekNumber}</span>
                      </div>
                      <div className="text-start">
                        <span className="text-white font-semibold">{t.clientDash.week} {week.weekNumber}</span>
                        {week.name && <span className="text-muted-foreground ms-2">– {week.name}</span>}
                      </div>
                      <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-muted-foreground ms-2">
                        {week.days?.length || 0} {week.days?.length === 1 ? t.clientDash.day : t.clientDash.days}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4">
                    {week.days && week.days.length > 0 ? (
                      week.days.map((day, di) => (
                        <div key={day.id || di} className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{day.dayNumber}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white flex-1">
                              {day.dayName || `${t.clientDash.day} ${day.dayNumber}`}
                            </h4>
                            {day.isRestDay && (
                              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                                <Moon className="w-3 h-3 me-1" />{t.clientDash.restDay}
                              </Badge>
                            )}
                          </div>
                          {day.isRestDay ? (
                            <p className="text-sm text-muted-foreground italic ps-10">{t.clientDash.restRecovery}</p>
                          ) : day.exercises && day.exercises.length > 0 ? (
                            <div className="space-y-2 ps-10">
                              {day.exercises.map((ex, exi) => (
                                <div key={ex.id || exi} className="p-3 rounded-xl bg-white/5 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-white">{ex.name}</span>
                                      {ex.muscleGroup && (
                                        <Badge variant="outline" className="text-xs bg-red-600/10 text-red-400 border-red-600/20">
                                          {ex.muscleGroup}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      {ex.sets > 0 && ex.reps > 0 && (
                                        <span className="font-medium text-white/80">{ex.sets} × {ex.reps}</span>
                                      )}
                                      {ex.weightKg > 0 && <span>{ex.weightKg} kg</span>}
                                      {ex.restSeconds > 0 && (
                                        <span className="flex items-center gap-1">
                                          <Timer className="w-3 h-3" />{ex.restSeconds}s
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {ex.tempo && (
                                    <div className="text-xs text-muted-foreground">{t.clientDash.tempo}: {ex.tempo}</div>
                                  )}
                                  {ex.notes && (
                                    <p className="text-xs text-muted-foreground/70 italic">{ex.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground ps-10 italic">{t.clientDash.noExercises}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{t.clientDash.noProgramDetails}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
              {t.clientDash.noProgramDetails}
            </div>
          )}
        </div>
      )
    }

    return (
      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white">{t.clientDash.workoutPrograms}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.clientDash.assignedPrograms}</p>
        </motion.div>

        {workouts.length === 0 ? (
          <motion.div variants={itemVariants} className="glass rounded-2xl p-12 text-center">
            <Dumbbell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">{t.clientDash.noWorkouts}</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">{t.clientDash.noWorkoutsDesc}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                variants={itemVariants}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6 cursor-pointer hover:border-red-600/20 transition-all group"
                onClick={() => loadWorkoutDetail(workout.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-red-400" />
                  </div>
                  {workout.status && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        workout.status === 'active'
                          ? 'bg-green-400/10 text-green-400 border-green-400/20'
                          : workout.status === 'completed'
                          ? 'bg-blue-400/10 text-blue-400 border-blue-400/20'
                          : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      }`}
                    >
                      {workout.status}
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                  {workout.name}
                </h3>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  {workout.frequency && <span>{workout.frequency}</span>}
                  {workout.durationWeeks > 0 && (
                    <span>{workout.frequency && '· '}{workout.durationWeeks} {t.clientDash.week}{workout.durationWeeks !== 1 ? (lang === 'ar' ? '' : 's') : ''}</span>
                  )}
                </div>
                {workout.weeks && workout.weeks.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-muted-foreground mt-3">
                    {workout.weeks.length} {t.clientDash.week}{workout.weeks.length !== 1 ? (lang === 'ar' ? '' : 's') : ''}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  // ============ NUTRITION TAB ============

  const renderNutrition = () => {
    if (viewingNutrition) {
      const plan = viewingNutrition
      const meals = plan.meals || []

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewingNutrition(null)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{plan.name}</h2>
              {plan.description && <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>}
            </div>
          </div>

          {/* Macro Summary */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{t.clientDash.dailyMacros}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-2xl font-bold text-white">{plan.calories || 0}</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.calories}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-600/10 text-center">
                <p className="text-2xl font-bold text-red-400">{plan.protein || 0}g</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.protein}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-600/10 text-center">
                <p className="text-2xl font-bold text-amber-400">{plan.carbs || 0}g</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.carbs}</p>
              </div>
              <div className="p-4 rounded-xl bg-green-600/10 text-center">
                <p className="text-2xl font-bold text-green-400">{plan.fats || 0}g</p>
                <p className="text-xs text-muted-foreground">{t.clientDash.fats}</p>
              </div>
            </div>
          </div>

          {/* Water & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plan.waterMl ? (
              <div className="glass rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Droplets className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{plan.waterMl} ml</p>
                  <p className="text-xs text-muted-foreground">{t.clientDash.dailyWater}</p>
                </div>
              </div>
            ) : null}
            {(plan.startDate || plan.endDate) ? (
              <div className="glass rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {plan.startDate ? formatDate(plan.startDate) : '—'} – {plan.endDate ? formatDate(plan.endDate) : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.clientDash.planDuration}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Meals */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{t.clientDash.meals}</h3>
            {meals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.clientDash.noMeals}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meals.map((meal, i) => (
                  <div key={meal.id || i} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant="outline"
                        className={MEAL_TYPE_COLORS[meal.mealType] || MEAL_TYPE_COLORS.Custom}
                      >
                        {meal.mealType}
                      </Badge>
                      <span className="text-sm font-semibold text-white">{meal.name}</span>
                      {meal.time && <span className="text-xs text-muted-foreground ms-auto">{meal.time}</span>}
                    </div>
                    {meal.notes && <p className="text-xs text-muted-foreground mb-3">{meal.notes}</p>}
                    {meal.foodItems && meal.foodItems.length > 0 ? (
                      <div className="space-y-2">
                        {meal.foodItems.map((fi, j) => (
                          <div key={fi.id || j} className="p-3 rounded-xl bg-white/5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-white">{fi.name}</span>
                              <span className="text-xs text-muted-foreground">{fi.quantity}{fi.unit}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-white/70">{fi.calories} kcal</span>
                              <span className="text-red-400">P: {fi.protein}g</span>
                              <span className="text-amber-400">C: {fi.carbs}g</span>
                              <span className="text-green-400">F: {fi.fats}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/50">{t.clientDash.noFoodItems}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white">{t.clientDash.nutritionPlans}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.clientDash.assignedPlans}</p>
        </motion.div>

        {nutritionPlans.length === 0 ? (
          <motion.div variants={itemVariants} className="glass rounded-2xl p-12 text-center">
            <Utensils className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">{t.clientDash.noNutrition}</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">{t.clientDash.noNutritionDesc}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutritionPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6 cursor-pointer hover:border-green-600/20 transition-all group"
                onClick={() => loadNutritionDetail(plan.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-green-400" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      plan.status === 'active'
                        ? 'bg-green-400/10 text-green-400 border-green-400/20'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    }`}
                  >
                    {plan.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">
                  {plan.name}
                </h3>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground flex-wrap">
                  {plan.calories ? <span className="text-white/70">{plan.calories} kcal</span> : null}
                  {plan.protein ? <span className="text-red-400">P: {plan.protein}g</span> : null}
                  {plan.carbs ? <span className="text-amber-400">C: {plan.carbs}g</span> : null}
                  {plan.fats ? <span className="text-green-400">F: {plan.fats}g</span> : null}
                </div>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {plan.meals?.length || 0} {plan.meals?.length === 1 ? t.clientDash.meal : t.clientDash.meals}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  // ============ PROGRESS TAB ============

  const renderProgress = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white">{t.clientDash.progressTracking}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.clientDash.trackMeasurements}</p>
        </motion.div>
        <Button
          onClick={() => { setProgressForm(emptyProgressForm); setProgressError(''); setShowProgressDialog(true) }}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 me-2" />
          {t.clientDash.addProgress}
        </Button>
      </div>

      {/* Weight Chart */}
      {chartData.length > 1 && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{t.clientDash.weightProgress}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              {t.clientDash.weight}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#888', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#1a1a2e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Progress History */}
      <motion.div variants={itemVariants} className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{t.clientDash.progressHistory}</h3>
        </div>
        {progressEntries.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t.clientDash.noProgress}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">{t.clientDash.noProgressDesc}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="p-4 space-y-3">
              {progressEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-white">
                        {formatDate(entry.createdAt || entry.recordedAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {entry.weight > 0 && <span>{t.clientDash.weight}: {entry.weight} kg</span>}
                      {entry.bodyFat > 0 && <span>{t.clientDash.bodyFat}: {entry.bodyFat}%</span>}
                      {entry.muscleMass > 0 && <span>{t.clientDash.muscleMass}: {entry.muscleMass} kg</span>}
                      {entry.waist > 0 && <span>{t.clientDash.waist}: {entry.waist} cm</span>}
                      {entry.chest > 0 && <span>{t.clientDash.chest}: {entry.chest} cm</span>}
                      {entry.arms > 0 && <span>{t.clientDash.arms}: {entry.arms} cm</span>}
                      {entry.thighs > 0 && <span>{t.clientDash.thighs}: {entry.thighs} cm</span>}
                      {entry.hips > 0 && <span>{t.clientDash.hips}: {entry.hips} cm</span>}
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground/60 mt-1 truncate">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </motion.div>

      {/* Add Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="bg-card border-white/10 max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{t.clientDash.addEntry}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.clientDash.recordMeasurements}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {progressError && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {progressError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.weight}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.weight}
                  onChange={(e) => setProgressForm({ ...progressForm, weight: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="kg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.bodyFat}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.bodyFat}
                  onChange={(e) => setProgressForm({ ...progressForm, bodyFat: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="%"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.muscleMass}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.muscleMass}
                  onChange={(e) => setProgressForm({ ...progressForm, muscleMass: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="kg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.waist}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.waist}
                  onChange={(e) => setProgressForm({ ...progressForm, waist: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.chest}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.chest}
                  onChange={(e) => setProgressForm({ ...progressForm, chest: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.arms}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.arms}
                  onChange={(e) => setProgressForm({ ...progressForm, arms: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.thighs}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.thighs}
                  onChange={(e) => setProgressForm({ ...progressForm, thighs: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.clientDash.hips}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressForm.hips}
                  onChange={(e) => setProgressForm({ ...progressForm, hips: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.clientDash.notes}</Label>
              <Textarea
                value={progressForm.notes}
                onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
                placeholder={t.clientDash.notesPlaceholder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowProgressDialog(false)} className="text-muted-foreground">{t.clientDash.cancel}</Button>
            <Button onClick={handleAddProgress} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
              {submitting ? t.clientDash.saving : t.clientDash.addEntry}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )

  // ============ SESSIONS TAB ============

  const renderSessions = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white">{t.clientDash.sessionsTab}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t.clientDash.noSessions}</p>
      </motion.div>

      {sessions.length === 0 ? (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">{t.clientDash.noSessions}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">{t.clientDash.noSessions}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sessions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((session, i) => (
              <motion.div
                key={session.id}
                variants={itemVariants}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        {session.title || t.clientDash.trainingSession}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${SESSION_STATUS_COLORS[session.status] || SESSION_STATUS_COLORS.scheduled}`}
                      >
                        {sessionStatusLabel(session.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(session.date)}
                      </span>
                      {session.duration > 0 && <span>{session.duration} min</span>}
                      {session.type && <span>{session.type}</span>}
                      {session.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-xs text-muted-foreground/70 mt-2">{session.notes}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </motion.div>
  )

  // ============ PAYMENTS TAB ============

  const renderPayments = () => {
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

    return (
      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white">{t.clientDash.paymentsTab}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.clientDash.noPayments}</p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-400/15 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs text-muted-foreground">{t.clientDash.paid}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalPaid)}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs text-muted-foreground">{t.clientDash.pending}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalPending)}</p>
          </motion.div>
        </div>

        {payments.length === 0 ? (
          <motion.div variants={itemVariants} className="glass rounded-2xl p-12 text-center">
            <DollarSign className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">{t.clientDash.noPayments}</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">{t.clientDash.noPayments}</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">{t.clientDash.paymentsTab}</h3>
            </div>
            <ScrollArea className="max-h-[500px]">
              <div className="p-4 space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {payment.description || payment.invoiceNumber || t.clientDash.payment}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${PAYMENT_STATUS_COLORS[payment.status] || PAYMENT_STATUS_COLORS.pending}`}
                        >
                          {paymentStatusLabel(payment.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {payment.dueDate && <span>{t.clientDash.due}: {formatDate(payment.dueDate)}</span>}
                        {payment.paidDate && <span>{t.clientDash.paidLabel}: {formatDate(payment.paidDate)}</span>}
                        {payment.method && <span>{t.clientDash.method}: {payment.method}</span>}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white ms-4">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </motion.div>
    )
  }

  // ============ MAIN RENDER ============

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={dir}>
      <TabsList className="w-full bg-white/5 border border-white/10 mb-6 overflow-x-auto flex-nowrap justify-start sm:justify-center">
        <TabsTrigger value="overview" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 whitespace-nowrap">
          {t.clientDash.overview}
        </TabsTrigger>
        <TabsTrigger value="workouts" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 whitespace-nowrap">
          {t.clientDash.workouts}
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 whitespace-nowrap">
          {t.clientDash.nutrition}
        </TabsTrigger>
        <TabsTrigger value="progress" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 whitespace-nowrap">
          {t.clientDash.progress}
        </TabsTrigger>
        <TabsTrigger value="sessions" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 whitespace-nowrap">
          {t.clientDash.sessions}
        </TabsTrigger>
        <TabsTrigger value="payments" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 whitespace-nowrap">
          {t.clientDash.payments}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{renderOverview()}</TabsContent>
      <TabsContent value="workouts">{renderWorkouts()}</TabsContent>
      <TabsContent value="nutrition">{renderNutrition()}</TabsContent>
      <TabsContent value="progress">{renderProgress()}</TabsContent>
      <TabsContent value="sessions">{renderSessions()}</TabsContent>
      <TabsContent value="payments">{renderPayments()}</TabsContent>
    </Tabs>
  )
}
