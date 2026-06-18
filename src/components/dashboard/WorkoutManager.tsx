'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Dumbbell,
  ChevronLeft,
  Eye,
  Copy,
  ChevronDown,
  ChevronRight,
  Moon,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/coach-api'
import type { WorkoutProgram, ProgramWeek, ProgramDay, Exercise, Client } from '@/lib/coach-api'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

// ============ Form Types ============

interface FormExercise {
  name: string
  muscleGroup: string
  sets: number
  reps: number
  weightKg: number
  restSeconds: number
  tempo: string
  notes: string
}

interface FormDay {
  dayNumber: number
  dayName: string
  isRestDay: boolean
  notes: string
  exercises: FormExercise[]
}

interface FormWeek {
  weekNumber: number
  name: string
  notes: string
  days: FormDay[]
  open: boolean
}

interface FormData {
  name: string
  clientId: string
  description: string
  frequency: string
  durationWeeks: number
  weeks: FormWeek[]
}

const makeExercise = (): FormExercise => ({
  name: '',
  muscleGroup: '',
  sets: 3,
  reps: 10,
  weightKg: 0,
  restSeconds: 60,
  tempo: '',
  notes: '',
})

const makeDay = (dayNumber: number): FormDay => ({
  dayNumber,
  dayName: `Day ${dayNumber}`,
  isRestDay: false,
  notes: '',
  exercises: [],
})

const makeWeek = (weekNumber: number): FormWeek => ({
  weekNumber,
  name: '',
  notes: '',
  days: [makeDay(1)],
  open: true,
})

const emptyForm = (): FormData => ({
  name: '',
  clientId: '',
  description: '',
  frequency: '',
  durationWeeks: 4,
  weeks: [makeWeek(1)],
})

// ============ Component ============

export default function WorkoutManager() {
  const { t, dir } = useI18n()
  const [workouts, setWorkouts] = useState<WorkoutProgram[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<WorkoutProgram | null>(null)
  const [viewingWorkout, setViewingWorkout] = useState<WorkoutProgram | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // ---- Data Loading ----

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [wRes, cRes] = await Promise.allSettled([
        api.getWorkouts(),
        api.getClients(),
      ])
      if (wRes.status === 'fulfilled' && wRes.value.workouts) {
        setWorkouts(wRes.value.workouts as WorkoutProgram[])
      }
      if (cRes.status === 'fulfilled' && cRes.value.clients) {
        setClients(cRes.value.clients as Client[])
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadWorkoutDetail = async (id: string) => {
    try {
      const res = await api.getWorkout(id)
      if (res.workout) setViewingWorkout(res.workout as WorkoutProgram)
    } catch {
      // silently handle
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || t.dashboard.unknown
  }

  // ---- Filtering ----

  const filteredWorkouts = workouts
    .filter((w) => {
      if (clientFilter !== 'all' && w.clientId !== clientFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          w.name.toLowerCase().includes(q) ||
          getClientName(w.clientId).toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // ---- Form Helpers ----

  const updateForm = (partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }))
  }

  const updateWeek = (weekIdx: number, partial: Partial<FormWeek>) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      weeks[weekIdx] = { ...weeks[weekIdx], ...partial }
      return { ...prev, weeks }
    })
  }

  const updateDay = (weekIdx: number, dayIdx: number, partial: Partial<FormDay>) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      const days = [...weeks[weekIdx].days]
      days[dayIdx] = { ...days[dayIdx], ...partial }
      weeks[weekIdx] = { ...weeks[weekIdx], days }
      return { ...prev, weeks }
    })
  }

  const updateExercise = (weekIdx: number, dayIdx: number, exIdx: number, partial: Partial<FormExercise>) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      const days = [...weeks[weekIdx].days]
      const exercises = [...days[dayIdx].exercises]
      exercises[exIdx] = { ...exercises[exIdx], ...partial }
      days[dayIdx] = { ...days[dayIdx], exercises }
      weeks[weekIdx] = { ...weeks[weekIdx], days }
      return { ...prev, weeks }
    })
  }

  const addWeek = () => {
    setFormData((prev) => ({
      ...prev,
      weeks: [...prev.weeks, makeWeek(prev.weeks.length + 1)],
    }))
  }

  const removeWeek = (weekIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      weeks: prev.weeks
        .filter((_, i) => i !== weekIdx)
        .map((w, i) => ({ ...w, weekNumber: i + 1 })),
    }))
  }

  const addDay = (weekIdx: number) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      const days = [...weeks[weekIdx].days]
      days.push(makeDay(days.length + 1))
      weeks[weekIdx] = { ...weeks[weekIdx], days }
      return { ...prev, weeks }
    })
  }

  const removeDay = (weekIdx: number, dayIdx: number) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      const days = weeks[weekIdx].days
        .filter((_, i) => i !== dayIdx)
        .map((d, i) => ({ ...d, dayNumber: i + 1 }))
      weeks[weekIdx] = { ...weeks[weekIdx], days }
      return { ...prev, weeks }
    })
  }

  const addExercise = (weekIdx: number, dayIdx: number) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      const days = [...weeks[weekIdx].days]
      const exercises = [...days[dayIdx].exercises, makeExercise()]
      days[dayIdx] = { ...days[dayIdx], exercises }
      weeks[weekIdx] = { ...weeks[weekIdx], days }
      return { ...prev, weeks }
    })
  }

  const removeExercise = (weekIdx: number, dayIdx: number, exIdx: number) => {
    setFormData((prev) => {
      const weeks = [...prev.weeks]
      const days = [...weeks[weekIdx].days]
      const exercises = days[dayIdx].exercises.filter((_, i) => i !== exIdx)
      days[dayIdx] = { ...days[dayIdx], exercises }
      weeks[weekIdx] = { ...weeks[weekIdx], days }
      return { ...prev, weeks }
    })
  }

  // ---- Workout to Form ----

  const workoutToForm = (w: WorkoutProgram): FormData => ({
    name: w.name || '',
    clientId: w.clientId || '',
    description: w.description || '',
    frequency: w.frequency || '',
    durationWeeks: w.durationWeeks || 4,
    weeks: (w.weeks && w.weeks.length > 0)
      ? w.weeks.map((week: ProgramWeek) => ({
          weekNumber: week.weekNumber,
          name: week.name || '',
          notes: week.notes || '',
          open: true,
          days: (week.days && week.days.length > 0)
            ? week.days.map((day: ProgramDay) => ({
                dayNumber: day.dayNumber,
                dayName: day.dayName || '',
                isRestDay: day.isRestDay || false,
                notes: day.notes || '',
                exercises: (day.exercises && day.exercises.length > 0)
                  ? day.exercises.map((ex: Exercise) => ({
                      name: ex.name || '',
                      muscleGroup: ex.muscleGroup || '',
                      sets: ex.sets || 3,
                      reps: ex.reps || 10,
                      weightKg: ex.weightKg || 0,
                      restSeconds: ex.restSeconds || 60,
                      tempo: ex.tempo || '',
                      notes: ex.notes || '',
                    }))
                  : [],
              }))
            : [makeDay(1)],
        }))
      : [makeWeek(1)],
  })

  // ---- Submit ----

  const handleSubmit = async () => {
    setError('')
    if (!formData.name.trim() || !formData.clientId) {
      setError(t.dashboard.nameClientRequired)
      return
    }

    const weeksPayload = formData.weeks.map((w, wi) => ({
      weekNumber: wi + 1,
      name: w.name || '',
      notes: w.notes || '',
      days: w.days.map((d, di) => ({
        dayNumber: di + 1,
        dayName: d.dayName || `${t.dashboard.dayLabel} ${di + 1}`,
        isRestDay: d.isRestDay,
        notes: d.notes || '',
        exercises: d.isRestDay
          ? []
          : d.exercises.map((ex, exi) => ({
              order: exi + 1,
              name: ex.name,
              muscleGroup: ex.muscleGroup,
              sets: ex.sets,
              reps: ex.reps,
              weightKg: ex.weightKg,
              restSeconds: ex.restSeconds,
              tempo: ex.tempo,
              notes: ex.notes,
              isSuperset: false,
              supersetGroup: 0,
            })),
      })),
    }))

    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        clientId: formData.clientId,
        description: formData.description || undefined,
        frequency: formData.frequency || undefined,
        durationWeeks: formData.durationWeeks || undefined,
        weeks: weeksPayload,
      }
      if (editingWorkout) {
        await api.updateWorkout(editingWorkout.id, payload)
      } else {
        await api.createWorkout(payload)
      }
      closeDialog()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.saveWorkoutFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWorkout(id)
      setDeleteConfirm(null)
      if (viewingWorkout?.id === id) setViewingWorkout(null)
      loadData()
    } catch {
      // silently handle
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateWorkout(id)
      loadData()
    } catch {
      // silently handle
    }
  }

  const openCreate = () => {
    setEditingWorkout(null)
    setFormData(emptyForm())
    setError('')
    setShowFormDialog(true)
  }

  const openEdit = (workout: WorkoutProgram) => {
    setEditingWorkout(workout)
    setFormData(workoutToForm(workout))
    setError('')
    setShowFormDialog(true)
  }

  const closeDialog = () => {
    setShowFormDialog(false)
    setEditingWorkout(null)
    setFormData(emptyForm())
    setError('')
  }

  // ---- Loading State ----

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ============ DETAIL VIEW ============

  if (viewingWorkout) {
    const w = viewingWorkout
    return (
      <div className="space-y-6" dir={dir}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => setViewingWorkout(null)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">{w.name}</h2>
            <p className="text-muted-foreground text-sm">
              {w.client?.name || getClientName(w.clientId)}
              {w.frequency && ` · ${w.frequency}`}
              {w.durationWeeks ? ` · ${w.durationWeeks} ${w.durationWeeks > 1 ? t.dashboard.weekPlural : t.dashboard.weekSingular}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => { openEdit(w); setViewingWorkout(null) }}
              className="text-muted-foreground hover:text-white"
            >
              <Edit className="w-4 h-4 me-2" />
              {t.dashboard.edit}
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleDuplicate(w.id)}
              className="text-muted-foreground hover:text-white"
            >
              <Copy className="w-4 h-4 me-2" />
              {t.dashboard.duplicateBtn}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(w.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
            >
              <Trash2 className="w-4 h-4 me-2" />
              {t.dashboard.delete}
            </Button>
          </div>
        </div>

        {/* Description */}
        {w.description && (
          <div className="glass rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">{w.description}</p>
          </div>
        )}

        {/* Weeks Accordion */}
        {w.weeks && w.weeks.length > 0 ? (
          <Accordion type="multiple" defaultValue={w.weeks.map((_, i) => `week-${i}`)} className="space-y-3">
            {w.weeks.map((week, wi) => (
              <AccordionItem
                key={week.id || wi}
                value={`week-${wi}`}
                className="glass rounded-2xl border-none px-6"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-400">{week.weekNumber}</span>
                    </div>
                    <div className="text-start">
                      <span className="text-white font-semibold">
                        {t.dashboard.weekLabel} {week.weekNumber}
                      </span>
                      {week.name && (
                        <span className="text-muted-foreground ms-2">– {week.name}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-muted-foreground ms-2">
                      {week.days?.length || 0} {(week.days?.length || 0) !== 1 ? t.dashboard.dayPlural : t.dashboard.daySingular}
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
                            {day.dayName || `${t.dashboard.dayLabel} ${day.dayNumber}`}
                          </h4>
                          {day.isRestDay && (
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                              <Moon className="w-3 h-3 me-1" />
                              {t.dashboard.restAndRecovery}
                            </Badge>
                          )}
                        </div>

                        {day.isRestDay ? (
                          <p className="text-sm text-muted-foreground italic ps-10">{t.dashboard.restAndRecovery}</p>
                        ) : day.exercises && day.exercises.length > 0 ? (
                          <div className="space-y-2 ps-10">
                            {day.exercises.map((ex, exi) => (
                              <div
                                key={ex.id || exi}
                                className="p-3 rounded-xl bg-white/5 space-y-1"
                              >
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
                                      <span className="font-medium text-white/80">
                                        {ex.sets} × {ex.reps}
                                      </span>
                                    )}
                                    {ex.weightKg > 0 && (
                                      <span>{ex.weightKg} kg</span>
                                    )}
                                    {ex.restSeconds > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Timer className="w-3 h-3" />
                                        {ex.restSeconds}s
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {ex.tempo && <span>{t.dashboard.tempo}: {ex.tempo}</span>}
                                </div>
                                {ex.notes && (
                                  <p className="text-xs text-muted-foreground/70 italic">{ex.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground ps-10 italic">{t.dashboard.noExercisesDefined}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">{t.dashboard.noDaysDefined}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="glass rounded-2xl p-6 text-center text-muted-foreground">
            {t.dashboard.noWeeksDefined}
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">{t.dashboard.deleteWorkoutTitle}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t.dashboard.deleteWorkoutConfirm}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-muted-foreground">{t.dashboard.cancel}</Button>
              <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">{t.dashboard.delete}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ============ LIST VIEW ============

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t.dashboard.workoutPrograms}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.dashboard.manageWorkouts}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 me-2" />
          {t.dashboard.createProgram}
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.dashboard.searchWorkouts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
            />
          </div>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={t.dashboard.filterByClient} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.dashboard.allClients}</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workout Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkouts.length === 0 ? (
          <div className="col-span-full text-center py-12 glass rounded-2xl">
            <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t.dashboard.noWorkoutPrograms}</p>
            <Button
              variant="ghost"
              onClick={openCreate}
              className="mt-3 text-red-400 hover:text-red-300"
            >
              {t.dashboard.createFirstProgram}
            </Button>
          </div>
        ) : (
          filteredWorkouts.map((workout, i) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 cursor-pointer hover:border-red-600/20 transition-all group"
              onClick={() => loadWorkoutDetail(workout.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => loadWorkoutDetail(workout.id)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => openEdit(workout)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => handleDuplicate(workout.id)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => setDeleteConfirm(workout.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                {workout.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {workout.client?.name || getClientName(workout.clientId)}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                {workout.frequency && <span>{workout.frequency}</span>}
                {workout.durationWeeks > 0 && (
                  <span>
                    {workout.frequency && '· '}
                    {workout.durationWeeks} {workout.durationWeeks !== 1 ? t.dashboard.weekPlural : t.dashboard.weekSingular}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
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
                {workout.weeks && workout.weeks.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-muted-foreground">
                    {workout.weeks.length} {workout.weeks.length !== 1 ? t.dashboard.weekPlural : t.dashboard.weekSingular}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* CREATE / EDIT DIALOG */}

      <Dialog open={showFormDialog} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="bg-card border-white/10 max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingWorkout ? t.dashboard.editWorkoutTitle : t.dashboard.createWorkoutTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingWorkout ? t.dashboard.updateWorkoutDesc : t.dashboard.designWorkoutDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Error */}
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* ---- Basic Info ---- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">{t.dashboard.basicInfo}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">{t.dashboard.planNameLabel} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder={t.dashboard.planNamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">{t.dashboard.clientRequired} *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(v) => updateForm({ clientId: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                      <SelectValue placeholder={t.dashboard.selectClient} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">{t.dashboard.frequencyLabel}</Label>
                  <Input
                    value={formData.frequency}
                    onChange={(e) => updateForm({ frequency: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder={t.dashboard.frequencyPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">{t.dashboard.durationWeeks}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.durationWeeks}
                    onChange={(e) => updateForm({ durationWeeks: parseInt(e.target.value) || 4 })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">{t.dashboard.descriptionLabel}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white min-h-[60px]"
                  placeholder={t.dashboard.descriptionPlaceholder}
                />
              </div>
            </div>

            {/* ---- Program Builder ---- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">{t.dashboard.programBuilder}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addWeek}
                  className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                >
                  <Plus className="w-4 h-4 me-1" />
                  {t.dashboard.addWeek}
                </Button>
              </div>

              {formData.weeks.length === 0 && (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <p className="text-muted-foreground text-sm">{t.dashboard.noWeeksAdded}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addWeek}
                    className="mt-2 text-red-400 hover:text-red-300"
                  >
                    {t.dashboard.addFirstWeek}
                  </Button>
                </div>
              )}

              <AnimatePresence>
                {formData.weeks.map((week, weekIdx) => (
                  <motion.div
                    key={weekIdx}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass rounded-xl p-4"
                  >
                    {/* Week Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => updateWeek(weekIdx, { open: !week.open })}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                      >
                        {week.open ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm font-bold text-red-400">W{week.weekNumber}</span>
                        <Input
                          value={week.name}
                          onChange={(e) => updateWeek(weekIdx, { name: e.target.value })}
                          className="bg-white/5 border-white/10 text-white h-7 text-xs"
                          placeholder={t.dashboard.weekNameOptional}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-600/10"
                        onClick={() => removeWeek(weekIdx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Week Content */}
                    {week.open && (
                      <div className="space-y-3">
                        {week.days.map((day, dayIdx) => (
                          <div key={dayIdx} className="bg-white/5 rounded-xl p-4">
                            {/* Day Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{day.dayNumber}</span>
                              </div>
                              <Input
                                value={day.dayName}
                                onChange={(e) => updateDay(weekIdx, dayIdx, { dayName: e.target.value })}
                                className="bg-white/5 border-white/10 text-white h-7 text-xs flex-1"
                                placeholder={`${t.dashboard.dayLabel} ${day.dayNumber}`}
                              />
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap">{t.dashboard.restLabel}</Label>
                                <Switch
                                  checked={day.isRestDay}
                                  onCheckedChange={(checked) => updateDay(weekIdx, dayIdx, { isRestDay: checked })}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-600/10"
                                onClick={() => removeDay(weekIdx, dayIdx)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Rest Day Indicator */}
                            {day.isRestDay ? (
                              <div className="flex items-center gap-2 py-2 ps-7 text-sm text-muted-foreground italic">
                                <Moon className="w-4 h-4" />
                                {t.dashboard.restAndRecovery}
                              </div>
                            ) : (
                              <div className="space-y-2 ps-7">
                                {day.exercises.map((ex, exIdx) => (
                                  <div
                                    key={exIdx}
                                    className="p-3 rounded-xl bg-white/5 space-y-2"
                                  >
                                    {/* Exercise Row 1: Name + Muscle Group */}
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={ex.name}
                                        onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white h-7 text-xs flex-1"
                                        placeholder={t.dashboard.exerciseName}
                                      />
                                      <Input
                                        value={ex.muscleGroup}
                                        onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { muscleGroup: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white h-7 text-xs w-28"
                                        placeholder={t.dashboard.muscleGroup}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-600/10 flex-shrink-0"
                                        onClick={() => removeExercise(weekIdx, dayIdx, exIdx)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    {/* Exercise Row 2: Sets, Reps, Weight, Rest */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">{t.dashboard.sets}</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={ex.sets}
                                          onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { sets: parseInt(e.target.value) || 0 })}
                                          className="bg-white/5 border-white/10 text-white h-7 text-xs w-14"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">{t.dashboard.reps}</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={ex.reps}
                                          onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { reps: parseInt(e.target.value) || 0 })}
                                          className="bg-white/5 border-white/10 text-white h-7 text-xs w-14"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">{t.dashboard.weightKgField}</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={ex.weightKg || ''}
                                          onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { weightKg: parseFloat(e.target.value) || 0 })}
                                          className="bg-white/5 border-white/10 text-white h-7 text-xs w-16"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">{t.dashboard.restSeconds}</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={ex.restSeconds}
                                          onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { restSeconds: parseInt(e.target.value) || 0 })}
                                          className="bg-white/5 border-white/10 text-white h-7 text-xs w-16"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">{t.dashboard.tempo}</Label>
                                        <Input
                                          value={ex.tempo}
                                          onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { tempo: e.target.value })}
                                          className="bg-white/5 border-white/10 text-white h-7 text-xs w-20"
                                          placeholder="3-0-1"
                                        />
                                      </div>
                                    </div>

                                    {/* Exercise Row 3: Notes */}
                                    <Input
                                      value={ex.notes}
                                      onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, { notes: e.target.value })}
                                      className="bg-white/5 border-white/10 text-white h-7 text-xs"
                                      placeholder="Notes (optional)"
                                    />
                                  </div>
                                ))}

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addExercise(weekIdx, dayIdx)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-600/10 text-xs w-full"
                                >
                                  <Plus className="w-3 h-3 me-1" />
                                  {t.dashboard.addExercise}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addDay(weekIdx)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/10 text-xs"
                        >
                          <Plus className="w-3 h-3 me-1" />
                          {t.dashboard.addDay}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={closeDialog} className="text-muted-foreground">{t.dashboard.cancel}</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? t.dashboard.saving : editingWorkout ? t.dashboard.update : t.dashboard.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.deleteWorkoutTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.deleteWorkoutConfirm}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-muted-foreground">{t.dashboard.cancel}</Button>
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">{t.dashboard.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
