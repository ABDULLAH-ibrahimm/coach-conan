'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/client-api'
import { useI18n } from '@/lib/i18n'
import {
  Phone, ArrowLeft, Dumbbell, Utensils, TrendingUp,
  Calendar, DollarSign, User, Scale, Target, Clock, MapPin, Timer,
  Moon, Droplets, CheckCircle, Loader2,
  ChevronDown, ChevronUp, Activity, Flame, Ruler,
  Mail, Heart, Sun, LogOut, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'

interface ClientUser {
  id: string
  name: string
  email: string
  phone?: string
  profileImage?: string
  age?: number
  gender?: string
  weight?: number
  height?: number
  goal?: string
  status: string
  notes?: string
  startDate?: string
  createdAt: string
  updatedAt: string
}

interface ClientExercise {
  id?: string
  order: number
  name: string
  muscleGroup: string
  sets: number
  reps: number
  weightKg: number
  restSeconds: number
  tempo: string
  notes: string
  isSuperset: boolean
  supersetGroup: number
}

interface ClientProgramDay {
  id?: string
  dayNumber: number
  dayName: string
  isRestDay: boolean
  notes: string
  exercises: ClientExercise[]
}

interface ClientProgramWeek {
  id?: string
  weekNumber: number
  name: string
  notes: string
  days: ClientProgramDay[]
}

interface ClientWorkoutProgram {
  id: string
  name: string
  clientId: string
  coachId: string
  description: string
  frequency: string
  durationWeeks: number
  status: string
  createdAt: string
  updatedAt: string
  weeks: ClientProgramWeek[]
}

interface ClientFoodItem {
  id?: string
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fats: number
  notes: string
  order: number
}

interface ClientMeal {
  id?: string
  mealType: string
  name: string
  time: string
  notes: string
  order: number
  foodItems: ClientFoodItem[]
}

interface ClientNutritionPlan {
  id: string
  name: string
  clientId: string
  coachId: string
  description: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  waterMl: number
  status: string
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
  meals: ClientMeal[]
}

interface ClientProgressEntry {
  id: string
  clientId: string
  weight: number
  bodyFat: number
  muscleMass: number
  waist: number
  chest: number
  arms: number
  thighs: number
  hips: number
  notes: string
  recordedAt: string
  createdAt: string
}

interface ClientSession {
  id: string
  clientId: string
  coachId: string
  title: string
  date: string
  duration: number
  type: string
  status: string
  location: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface ClientPayment {
  id: string
  clientId: string
  coachId: string
  amount: number
  currency: string
  status: string
  method: string
  description: string
  dueDate?: string | null
  paidDate?: string | null
  invoiceNumber: string
  notes: string
  createdAt: string
  updatedAt: string
}

export default function ClientPortalView({ onLogout, onBackToSite }: { onLogout: () => void; onBackToSite: () => void }) {
  const { t, lang, toggleLang } = useI18n()
  const isRTL = lang === 'ar'

  const [dashboard, setDashboard] = useState<{
    client: ClientUser
    activeWorkout?: ClientWorkoutProgram | null
    activeNutrition?: ClientNutritionPlan | null
    latestProgress?: ClientProgressEntry | null
    upcomingSessions: ClientSession[]
    recentPayments: ClientPayment[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({})

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const raw = await clientApi.getDashboard() as Record<string, unknown>
      // Map API response to component format
      // API returns: { profile, workoutPrograms, nutritionPlans, progress, upcomingSessions, paymentSummary }
      // Component expects: { client, activeWorkout, activeNutrition, latestProgress, upcomingSessions, recentPayments }
      const workoutPrograms = (raw.workoutPrograms as ClientWorkoutProgram[]) || []
      const nutritionPlans = (raw.nutritionPlans as ClientNutritionPlan[]) || []
      const progressArr = (raw.progress as ClientProgressEntry[]) || []
      const sessions = (raw.upcomingSessions as ClientSession[]) || []
      // paymentSummary is aggregate data, not a list - we'll use empty array for recentPayments
      // since the dashboard endpoint doesn't return individual payment records
      const recentPayments: ClientPayment[] = []

      setDashboard({
        client: raw.profile as ClientUser,
        activeWorkout: workoutPrograms.length > 0 ? workoutPrograms[0] : null,
        activeNutrition: nutritionPlans.length > 0 ? nutritionPlans[0] : null,
        latestProgress: progressArr.length > 0 ? progressArr[0] : null,
        upcomingSessions: sessions,
        recentPayments,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }))
  }

  const toggleMeal = (mealId: string) => {
    setExpandedMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="w-10 h-10 text-red-500 animate-pulse" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md glass border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 mb-4">{error || (isRTL ? 'فشل تحميل البيانات' : 'Failed to load data')}</p>
            <Button onClick={onLogout} variant="outline" className="border-white/10 text-white">
              {isRTL ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const client = dashboard.client
  const initials = (client?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Dumbbell className="w-7 h-7 text-red-500" />
                <div className="absolute inset-0 w-7 h-7 bg-red-500/20 rounded-full blur-lg" />
              </div>
              <span className="text-lg font-bold text-white">
                COACH <span className="gradient-text">CONAN</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleLang} className="text-muted-foreground hover:text-white">
                <Globe className="w-4 h-4 me-1" />
                <span className="text-xs">{lang === 'en' ? 'عربي' : 'EN'}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onBackToSite} className="text-muted-foreground hover:text-white">
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-400 hover:text-red-300 hover:bg-red-600/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-red-950/30 via-background to-red-950/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-red-600/30">
              {client.profileImage ? (
                <AvatarImage src={client.profileImage} alt={client.name} />
              ) : null}
              <AvatarFallback className="bg-red-600/20 text-red-400 text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-white">{client.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {client.goal && (
                  <Badge className="bg-red-600/20 text-red-400 border border-red-600/30 gap-1">
                    <Target className="w-3 h-3" /> {client.goal}
                  </Badge>
                )}
                {client.status && (
                  <Badge className="bg-green-600/20 text-green-400 border border-green-600/30 gap-1">
                    <CheckCircle className="w-3 h-3" /> {client.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-6 w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              <User className="w-4 h-4 me-1.5" />
              {isRTL ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="workouts" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              <Dumbbell className="w-4 h-4 me-1.5" />
              {isRTL ? 'التمارين' : 'Workouts'}
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              <Utensils className="w-4 h-4 me-1.5" />
              {isRTL ? 'التغذية' : 'Nutrition'}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              <Calendar className="w-4 h-4 me-1.5" />
              {isRTL ? 'الجلسات' : 'Sessions'}
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              <TrendingUp className="w-4 h-4 me-1.5" />
              {isRTL ? 'التقدم' : 'Progress'}
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              <DollarSign className="w-4 h-4 me-1.5" />
              {isRTL ? 'المدفوعات' : 'Payments'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Profile Card */}
              <Card className="glass border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500" />
                    {isRTL ? 'البيانات الشخصية' : 'Personal Info'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {client.age > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'العمر' : 'Age'}</span><span className="text-white">{client.age}</span></div>}
                  {client.gender && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الجنس' : 'Gender'}</span><span className="text-white">{client.gender}</span></div>}
                  {client.weight > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الوزن' : 'Weight'}</span><span className="text-white">{client.weight} kg</span></div>}
                  {client.height > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الطول' : 'Height'}</span><span className="text-white">{client.height} cm</span></div>}
                  {client.phone && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الهاتف' : 'Phone'}</span><span className="text-white" dir="ltr">{client.phone}</span></div>}
                  {client.email && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'البريد' : 'Email'}</span><span className="text-white text-xs" dir="ltr">{client.email}</span></div>}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    {isRTL ? 'إحصائيات سريعة' : 'Quick Stats'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Dumbbell className="w-3 h-3" />{isRTL ? 'برامج التمارين' : 'Workout Programs'}</span>
                    <Badge className="bg-red-600/20 text-red-400">{dashboard.activeWorkout ? 1 : 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Utensils className="w-3 h-3" />{isRTL ? 'خطط التغذية' : 'Nutrition Plans'}</span>
                    <Badge className="bg-red-600/20 text-red-400">{dashboard.activeNutrition ? 1 : 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Calendar className="w-3 h-3" />{isRTL ? 'الجلسات القادمة' : 'Upcoming Sessions'}</span>
                    <Badge className="bg-red-600/20 text-red-400">{dashboard.upcomingSessions?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><DollarSign className="w-3 h-3" />{isRTL ? 'المدفوعات' : 'Payments'}</span>
                    <Badge className="bg-red-600/20 text-red-400">{dashboard.recentPayments?.length || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Progress */}
              <Card className="glass border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    {isRTL ? 'آخر تقدم' : 'Latest Progress'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard.latestProgress ? (
                    <div className="space-y-2 text-sm">
                      {dashboard.latestProgress.weight > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الوزن' : 'Weight'}</span><span className="text-white">{dashboard.latestProgress.weight} kg</span></div>}
                      {dashboard.latestProgress.bodyFat > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'دهون الجسم' : 'Body Fat'}</span><span className="text-white">{dashboard.latestProgress.bodyFat}%</span></div>}
                      {dashboard.latestProgress.muscleMass > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{isRTL ? 'الكتلة العضلية' : 'Muscle Mass'}</span><span className="text-white">{dashboard.latestProgress.muscleMass} kg</span></div>}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">{isRTL ? 'لا توجد بيانات تقدم بعد' : 'No progress data yet'}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts">
            {dashboard.activeWorkout ? (
              <div className="space-y-4">
                <Card className="glass border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-red-500" />
                        {dashboard.activeWorkout.name}
                      </CardTitle>
                      <Badge className="bg-green-600/20 text-green-400">{dashboard.activeWorkout.status}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{dashboard.activeWorkout.description}</p>
                    <div className="flex gap-3 mt-2">
                      <Badge variant="outline" className="border-white/10 text-muted-foreground">{dashboard.activeWorkout.frequency}</Badge>
                      <Badge variant="outline" className="border-white/10 text-muted-foreground">{dashboard.activeWorkout.durationWeeks} {isRTL ? 'أسابيع' : 'weeks'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.activeWorkout.weeks?.map((week) => (
                      <div key={week.id || week.weekNumber} className="space-y-2">
                        <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                          <Sun className="w-3 h-3" />
                          {isRTL ? `الأسبوع ${week.weekNumber}` : `Week ${week.weekNumber}`}
                          {week.name && ` - ${week.name}`}
                        </h3>
                        {week.days?.map((day) => (
                          <div key={day.id || day.dayNumber} className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                            <button
                              onClick={() => toggleDay(`${week.weekNumber}-${day.dayNumber}`)}
                              className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                            >
                              <span className="text-sm font-medium text-white flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-red-500" />
                                {isRTL ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                                {day.dayName && ` - ${day.dayName}`}
                              </span>
                              <div className="flex items-center gap-2">
                                {day.isRestDay && <Badge className="bg-blue-600/20 text-blue-400 text-xs">{isRTL ? 'راحة' : 'Rest'}</Badge>}
                                {!day.isRestDay && day.exercises?.length > 0 && (
                                  <Badge className="bg-red-600/20 text-red-400 text-xs">{day.exercises.length} {isRTL ? 'تمرين' : 'exercises'}</Badge>
                                )}
                                {expandedDays[`${week.weekNumber}-${day.dayNumber}`] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </button>
                            {expandedDays[`${week.weekNumber}-${day.dayNumber}`] && !day.isRestDay && day.exercises?.length > 0 && (
                              <div className="border-t border-white/5 p-3 space-y-2">
                                {day.exercises.sort((a, b) => a.order - b.order).map((ex, idx) => (
                                  <div key={ex.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
                                    <div>
                                      <span className="text-white font-medium">{ex.name}</span>
                                      {ex.muscleGroup && <span className="text-muted-foreground ms-2 text-xs">({ex.muscleGroup})</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                      <span>{ex.sets}×{ex.reps}</span>
                                      {ex.weightKg > 0 && <span>{ex.weightKg}kg</span>}
                                      {ex.restSeconds > 0 && <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{ex.restSeconds}s</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {expandedDays[`${week.weekNumber}-${day.dayNumber}`] && day.isRestDay && (
                              <div className="border-t border-white/5 p-4 text-center">
                                <Moon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                <p className="text-muted-foreground text-sm">{isRTL ? 'يوم راحة - استرح واستعد!' : 'Rest day - recover and recharge!'}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="glass border-white/10">
                <CardContent className="p-12 text-center">
                  <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد برامج تمارين حالياً' : 'No workout programs assigned yet'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition">
            {dashboard.activeNutrition ? (
              <Card className="glass border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-red-500" />
                      {dashboard.activeNutrition.name}
                    </CardTitle>
                    <Badge className="bg-green-600/20 text-green-400">{dashboard.activeNutrition.status}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{dashboard.activeNutrition.description}</p>
                  {/* Macro overview */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                    <div className="text-center p-2 rounded-lg bg-orange-600/10 border border-orange-600/20">
                      <Flame className="w-4 h-4 text-orange-400 mx-auto" />
                      <p className="text-white font-bold text-sm">{dashboard.activeNutrition.calories}</p>
                      <p className="text-muted-foreground text-xs">{isRTL ? 'سعرة' : 'kcal'}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-600/10 border border-red-600/20">
                      <Dumbbell className="w-4 h-4 text-red-400 mx-auto" />
                      <p className="text-white font-bold text-sm">{dashboard.activeNutrition.protein}g</p>
                      <p className="text-muted-foreground text-xs">{isRTL ? 'بروتين' : 'Protein'}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
                      <Sun className="w-4 h-4 text-yellow-400 mx-auto" />
                      <p className="text-white font-bold text-sm">{dashboard.activeNutrition.carbs}g</p>
                      <p className="text-muted-foreground text-xs">{isRTL ? 'كربوهيدرات' : 'Carbs'}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-600/10 border border-blue-600/20">
                      <Droplets className="w-4 h-4 text-blue-400 mx-auto" />
                      <p className="text-white font-bold text-sm">{dashboard.activeNutrition.fats}g</p>
                      <p className="text-muted-foreground text-xs">{isRTL ? 'دهون' : 'Fats'}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-600/10 border border-green-600/20">
                      <Heart className="w-4 h-4 text-green-400 mx-auto" />
                      <p className="text-white font-bold text-sm">{dashboard.activeNutrition.fiber}g</p>
                      <p className="text-muted-foreground text-xs">{isRTL ? 'ألياف' : 'Fiber'}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-cyan-600/10 border border-cyan-600/20">
                      <Droplets className="w-4 h-4 text-cyan-400 mx-auto" />
                      <p className="text-white font-bold text-sm">{dashboard.activeNutrition.waterMl}ml</p>
                      <p className="text-muted-foreground text-xs">{isRTL ? 'ماء' : 'Water'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboard.activeNutrition.meals?.sort((a, b) => a.order - b.order).map((meal) => (
                    <div key={meal.id || meal.order} className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                      <button
                        onClick={() => toggleMeal(meal.id || `meal-${meal.order}`)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                          <Utensils className="w-3 h-3 text-red-500" />
                          {meal.name}
                          {meal.mealType && <span className="text-muted-foreground text-xs">({meal.mealType})</span>}
                          {meal.time && <span className="text-muted-foreground text-xs">{meal.time}</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          {meal.foodItems?.length > 0 && (
                            <Badge className="bg-red-600/20 text-red-400 text-xs">{meal.foodItems.length} {isRTL ? 'عناصر' : 'items'}</Badge>
                          )}
                          {expandedMeals[meal.id || `meal-${meal.order}`] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedMeals[meal.id || `meal-${meal.order}`] && meal.foodItems?.length > 0 && (
                        <div className="border-t border-white/5 p-3 space-y-2">
                          {meal.foodItems.sort((a, b) => a.order - b.order).map((food, idx) => (
                            <div key={food.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
                              <div>
                                <span className="text-white">{food.name}</span>
                                <span className="text-muted-foreground ms-2 text-xs">{food.quantity} {food.unit}</span>
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                {food.calories > 0 && <span>{food.calories} kcal</span>}
                                {food.protein > 0 && <span>P: {food.protein}g</span>}
                                {food.carbs > 0 && <span>C: {food.carbs}g</span>}
                                {food.fats > 0 && <span>F: {food.fats}g</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-white/10">
                <CardContent className="p-12 text-center">
                  <Utensils className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد خطط تغذية حالياً' : 'No nutrition plans assigned yet'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            {dashboard.upcomingSessions?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.upcomingSessions.map((session) => (
                  <Card key={session.id} className="glass border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-500" />
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(session.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{session.duration}min</span>
                            {session.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>}
                          </div>
                          {session.notes && <p className="text-muted-foreground text-xs mt-2">{session.notes}</p>}
                        </div>
                        <Badge className={session.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' : session.status === 'completed' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass border-white/10">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد جلسات قادمة' : 'No upcoming sessions'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            {dashboard.latestProgress ? (
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    {isRTL ? 'آخر قياسات' : 'Latest Measurements'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {dashboard.latestProgress.weight > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Scale className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.weight} kg</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'الوزن' : 'Weight'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.bodyFat > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.bodyFat}%</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'دهون الجسم' : 'Body Fat'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.muscleMass > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Dumbbell className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.muscleMass} kg</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'العضلات' : 'Muscle'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.waist > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Ruler className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.waist} cm</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'الخصر' : 'Waist'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.chest > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Ruler className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.chest} cm</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'الصدر' : 'Chest'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.arms > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Ruler className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.arms} cm</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'الذراعين' : 'Arms'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.thighs > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Ruler className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.thighs} cm</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'الفخذين' : 'Thighs'}</p>
                      </div>
                    )}
                    {dashboard.latestProgress.hips > 0 && (
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Ruler className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{dashboard.latestProgress.hips} cm</p>
                        <p className="text-muted-foreground text-xs">{isRTL ? 'الوركين' : 'Hips'}</p>
                      </div>
                    )}
                  </div>
                  {dashboard.latestProgress.notes && (
                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-muted-foreground text-sm">{dashboard.latestProgress.notes}</p>
                    </div>
                  )}
                  <p className="text-muted-foreground text-xs mt-3">
                    {isRTL ? 'تاريخ القياس:' : 'Recorded:'} {new Date(dashboard.latestProgress.recordedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-white/10">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد بيانات تقدم بعد' : 'No progress data yet'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            {dashboard.recentPayments?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentPayments.map((payment) => (
                  <Card key={payment.id} className="glass border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">{payment.description || payment.invoiceNumber}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="text-lg font-bold text-white">{payment.amount} {payment.currency}</span>
                            {payment.method && <span>{payment.method}</span>}
                          </div>
                          {payment.dueDate && <p className="text-muted-foreground text-xs mt-1">{isRTL ? 'تاريخ الاستحقاق:' : 'Due:'} {new Date(payment.dueDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>}
                          {payment.paidDate && <p className="text-green-400 text-xs mt-1">{isRTL ? 'تم الدفع:' : 'Paid:'} {new Date(payment.paidDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>}
                        </div>
                        <Badge className={payment.status === 'paid' ? 'bg-green-600/20 text-green-400' : payment.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass border-white/10">
                <CardContent className="p-12 text-center">
                  <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد مدفوعات' : 'No payments'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
