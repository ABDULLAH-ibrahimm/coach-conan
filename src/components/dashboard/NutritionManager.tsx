'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Utensils,
  ChevronLeft,
  Eye,
  ChevronDown,
  ChevronUp,
  Droplets,
  Calendar,
  X,
  Calculator,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/lib/coach-api'
import type { NutritionPlan, Meal, FoodItem, Client } from '@/lib/coach-api'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

// ============ Meal Type Helpers ============

const MEAL_TYPES = [
  'Breakfast',
  'Snack',
  'Lunch',
  'Dinner',
  'Pre-Workout',
  'Post-Workout',
  'Custom',
] as const

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Snack: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Lunch: 'bg-green-500/10 text-green-400 border-green-500/20',
  Dinner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Pre-Workout': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Post-Workout': 'bg-red-500/10 text-red-400 border-red-500/20',
  Custom: 'bg-white/5 text-white/70 border-white/10',
}

const FOOD_UNITS = ['g', 'oz', 'ml', 'cup', 'tbsp', 'piece', 'serving'] as const

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-400/10 text-green-400 border-green-400/20',
  draft: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  completed: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  paused: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
}

// ============ Default Meals Builder ============

function createDefaultMeals(): MealForm[] {
  return [
    { mealType: 'Breakfast', name: 'Breakfast', time: '8:00 AM', notes: '', order: 0, foodItems: [], open: true },
  ]
}

function createEmptyFoodItem(): FoodItemForm {
  return { name: '', quantity: 0, unit: 'g', calories: 0, protein: 0, carbs: 0, fats: 0, notes: '' }
}

// ============ Form Types ============

interface FoodItemForm {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fats: number
  notes: string
}

interface MealForm {
  mealType: string
  name: string
  time: string
  notes: string
  order: number
  foodItems: FoodItemForm[]
  open: boolean
}

interface FormState {
  name: string
  clientId: string
  description: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  waterMl: number
  status: string
  startDate: string
  endDate: string
  meals: MealForm[]
}

const emptyFormState: FormState = {
  name: '',
  clientId: '',
  description: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  waterMl: 2500,
  status: 'active',
  startDate: '',
  endDate: '',
  meals: createDefaultMeals(),
}

// ============ Component ============

export default function NutritionManager() {
  const { t, dir } = useI18n()
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null)
  const [viewingPlan, setViewingPlan] = useState<NutritionPlan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>(emptyFormState)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [autoCalc, setAutoCalc] = useState(true)

  // ---- Meal type translation helper ----

  const getMealTypeLabel = (mealType: string): string => {
    const map: Record<string, string> = {
      'Breakfast': t.dashboard.breakfast,
      'Snack': t.dashboard.snack,
      'Lunch': t.dashboard.lunch,
      'Dinner': t.dashboard.dinner,
      'Pre-Workout': t.dashboard.preWorkout,
      'Post-Workout': t.dashboard.postWorkout,
      'Custom': t.dashboard.custom,
    }
    return map[mealType] || mealType
  }

  // ---- Data loading ----

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [nRes, cRes] = await Promise.allSettled([
        api.getNutrition(),
        api.getClients(),
      ])
      if (nRes.status === 'fulfilled') setNutritionPlans(nRes.value.nutritionPlans as NutritionPlan[])
      if (cRes.status === 'fulfilled') setClients(cRes.value.clients as Client[])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ---- Helpers ----

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || t.dashboard.unknown
  }

  const filteredPlans = nutritionPlans
    .filter((p) => {
      if (clientFilter !== 'all' && p.clientId !== clientFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          getClientName(p.clientId).toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // ---- Computed macro totals from form meals ----

  const computedMacros = useCallback(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0
    for (const meal of formData.meals) {
      for (const fi of meal.foodItems) {
        cal += fi.calories || 0
        pro += fi.protein || 0
        carb += fi.carbs || 0
        fat += fi.fats || 0
      }
    }
    return { calories: cal, protein: pro, carbs: carb, fats: fat }
  }, [formData.meals])

  // ---- Auto-calculate macros from food items ----

  useEffect(() => {
    if (!autoCalc) return
    const cm = computedMacros()
    setFormData((prev) => {
      if (
        prev.calories === cm.calories &&
        prev.protein === cm.protein &&
        prev.carbs === cm.carbs &&
        prev.fats === cm.fats
      ) return prev
      return { ...prev, calories: cm.calories, protein: cm.protein, carbs: cm.carbs, fats: cm.fats }
    })
  }, [autoCalc, computedMacros])

  // ---- Submit ----

  const handleSubmit = async () => {
    setError('')
    if (!formData.name.trim() || !formData.clientId) {
      setError(t.dashboard.nameClientRequiredNutrition)
      return
    }

    const mealsPayload: Meal[] = formData.meals
      .filter((m) => m.name.trim() || m.foodItems.length > 0)
      .map((m, idx) => ({
        mealType: m.mealType,
        name: m.name,
        time: m.time,
        notes: m.notes,
        order: idx,
        foodItems: m.foodItems
          .filter((fi) => fi.name.trim())
          .map((fi, fiIdx) => ({
            name: fi.name,
            quantity: fi.quantity,
            unit: fi.unit,
            calories: fi.calories,
            protein: fi.protein,
            carbs: fi.carbs,
            fats: fi.fats,
            notes: fi.notes,
            order: fiIdx,
          })),
      }))

    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        clientId: formData.clientId,
        description: formData.description || undefined,
        calories: formData.calories || undefined,
        protein: formData.protein || undefined,
        carbs: formData.carbs || undefined,
        fats: formData.fats || undefined,
        fiber: formData.fiber || undefined,
        waterMl: formData.waterMl || undefined,
        status: formData.status || 'active',
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        meals: mealsPayload,
      }
      if (editingPlan) {
        await api.updateNutrition(editingPlan.id, payload)
      } else {
        await api.createNutrition(payload)
      }
      closeDialog()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.saveNutritionFailed)
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Delete ----

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNutrition(id)
      setDeleteConfirm(null)
      if (viewingPlan?.id === id) setViewingPlan(null)
      loadData()
    } catch {
      // silently handle
    }
  }

  // ---- Open edit ----

  const openEdit = (plan: NutritionPlan) => {
    setEditingPlan(plan)
    const mealsData =
      plan.meals && plan.meals.length > 0
        ? plan.meals.map((m, idx) => ({
            mealType: m.mealType || 'Custom',
            name: m.name,
            time: m.time || '',
            notes: m.notes || '',
            order: idx,
            foodItems: (m.foodItems || []).map((fi) => ({
              name: fi.name,
              quantity: fi.quantity || 0,
              unit: fi.unit || 'g',
              calories: fi.calories || 0,
              protein: fi.protein || 0,
              carbs: fi.carbs || 0,
              fats: fi.fats || 0,
              notes: fi.notes || '',
            })),
            open: idx === 0,
          }))
        : createDefaultMeals()
    // Compute totals from food items for auto-calc
    let cal = 0, pro = 0, carb = 0, fat = 0
    for (const m of mealsData) {
      for (const fi of m.foodItems) {
        cal += fi.calories || 0
        pro += fi.protein || 0
        carb += fi.carbs || 0
        fat += fi.fats || 0
      }
    }
    const hasFoodItems = cal > 0 || pro > 0 || carb > 0 || fat > 0
    setAutoCalc(hasFoodItems)
    setFormData({
      name: plan.name,
      clientId: plan.clientId,
      description: plan.description || '',
      calories: hasFoodItems ? cal : (plan.calories || 0),
      protein: hasFoodItems ? pro : (plan.protein || 0),
      carbs: hasFoodItems ? carb : (plan.carbs || 0),
      fats: hasFoodItems ? fat : (plan.fats || 0),
      fiber: plan.fiber || 0,
      waterMl: plan.waterMl || 2500,
      status: plan.status || 'draft',
      startDate: plan.startDate || '',
      endDate: plan.endDate || '',
      meals: mealsData,
    })
    setShowAddDialog(true)
  }

  const openCreate = () => {
    setEditingPlan(null)
    setAutoCalc(true)
    setFormData({ ...emptyFormState, meals: createDefaultMeals() })
    setError('')
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingPlan(null)
    setFormData(emptyFormState)
    setAutoCalc(true)
    setError('')
  }

  // ---- Form mutations ----

  const updateMeal = (idx: number, updates: Partial<MealForm>) => {
    setFormData((prev) => {
      const meals = [...prev.meals]
      meals[idx] = { ...meals[idx], ...updates }
      return { ...prev, meals }
    })
  }

  const addMeal = () => {
    setFormData((prev) => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          mealType: 'Custom',
          name: '',
          time: '',
          notes: '',
          order: prev.meals.length,
          foodItems: [],
          open: true,
        },
      ],
    }))
  }

  const removeMeal = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== idx),
    }))
  }

  const addFoodItem = (mealIdx: number) => {
    setFormData((prev) => {
      const meals = [...prev.meals]
      meals[mealIdx] = {
        ...meals[mealIdx],
        foodItems: [...meals[mealIdx].foodItems, createEmptyFoodItem()],
      }
      return { ...prev, meals }
    })
  }

  const updateFoodItem = (mealIdx: number, fiIdx: number, updates: Partial<FoodItemForm>) => {
    setFormData((prev) => {
      const meals = [...prev.meals]
      const foodItems = [...meals[mealIdx].foodItems]
      foodItems[fiIdx] = { ...foodItems[fiIdx], ...updates }
      meals[mealIdx] = { ...meals[mealIdx], foodItems }
      return { ...prev, meals }
    })
  }

  const removeFoodItem = (mealIdx: number, fiIdx: number) => {
    setFormData((prev) => {
      const meals = [...prev.meals]
      meals[mealIdx] = {
        ...meals[mealIdx],
        foodItems: meals[mealIdx].foodItems.filter((_, i) => i !== fiIdx),
      }
      return { ...prev, meals }
    })
  }

  // ---- Loading ----

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ============ DETAIL VIEW ============

  if (viewingPlan) {
    const plan = viewingPlan
    const meals = plan.meals || []
    const totalFoodItems = meals.reduce((sum, m) => sum + (m.foodItems?.length || 0), 0)

    return (
      <div className="space-y-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewingPlan(null)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">{plan.name}</h2>
            <p className="text-muted-foreground text-sm">{getClientName(plan.clientId)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" onClick={() => { openEdit(plan); setViewingPlan(null) }} className="text-muted-foreground hover:text-white">
              <Edit className="w-4 h-4 me-2" />
              {t.dashboard.edit}
            </Button>
            <Button variant="ghost" onClick={() => { setDeleteConfirm(plan.id); setViewingPlan(null) }} className="text-red-400 hover:text-red-300 hover:bg-red-600/10">
              <Trash2 className="w-4 h-4 me-2" />
              {t.dashboard.delete}
            </Button>
          </div>
        </div>

        {/* Description */}
        {plan.description && (
          <div className="glass rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>
        )}

        {/* Macro Summary */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.macroSummary}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-white">{plan.calories || 0}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.caloriesKcal}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-600/10 text-center">
              <p className="text-2xl font-bold text-red-400">{plan.protein || 0}g</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.proteinG}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-600/10 text-center">
              <p className="text-2xl font-bold text-amber-400">{plan.carbs || 0}g</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.carbsG}</p>
            </div>
            <div className="p-4 rounded-xl bg-green-600/10 text-center">
              <p className="text-2xl font-bold text-green-400">{plan.fats || 0}g</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.fatsG}</p>
            </div>
          </div>
        </div>

        {/* Water & Dates Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plan.waterMl ? (
            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{plan.waterMl} ml</p>
                <p className="text-xs text-muted-foreground">{t.dashboard.dailyWaterTarget}</p>
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
                  {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '—'} – {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '—'}
                </p>
                <p className="text-xs text-muted-foreground">{t.dashboard.planDuration}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Meals Section */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{t.dashboard.mealsLabel}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{meals.length} {t.dashboard.mealsLabel}</span>
              <span>·</span>
              <span>{totalFoodItems} {t.dashboard.foodItems}</span>
            </div>
          </div>

          {meals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t.dashboard.noMealsDefined}</p>
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
                      {getMealTypeLabel(meal.mealType)}
                    </Badge>
                    <span className="text-sm font-semibold text-white">{meal.name}</span>
                    {meal.time && (
                      <span className="text-xs text-muted-foreground ms-auto">{meal.time}</span>
                    )}
                  </div>

                  {meal.notes && (
                    <p className="text-xs text-muted-foreground mb-3">{meal.notes}</p>
                  )}

                  {meal.foodItems && meal.foodItems.length > 0 ? (
                    <div className="space-y-2">
                      {meal.foodItems.map((fi, j) => (
                        <div key={fi.id || j} className="p-3 rounded-xl bg-white/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{fi.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {fi.quantity}{fi.unit}
                            </span>
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
                    <p className="text-xs text-muted-foreground/50">{t.dashboard.noFoodItemsAdded}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">{t.dashboard.deleteNutritionTitle}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t.dashboard.deleteNutritionConfirm}
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
          <h2 className="text-2xl font-bold text-white">{t.dashboard.nutritionPlans}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.dashboard.manageNutrition}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 me-2" />
          {t.dashboard.createPlan}
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.dashboard.searchPlans}
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
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Nutrition Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-12 glass rounded-2xl">
            <Utensils className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t.dashboard.noNutritionPlans}</p>
            <p className="text-xs text-muted-foreground/50 mt-1">{t.dashboard.createFirstNutritionPlan}</p>
          </div>
        ) : (
          filteredPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 cursor-pointer hover:border-red-600/20 transition-all group"
              onClick={() => setViewingPlan(plan)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => setViewingPlan(plan)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => openEdit(plan)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => setDeleteConfirm(plan.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">
                {plan.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{getClientName(plan.clientId)}</p>

              {/* Macros Row */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {plan.calories ? <span className="text-white/70">{plan.calories} kcal</span> : null}
                {plan.protein ? <span className="text-red-400">P: {plan.protein}g</span> : null}
                {plan.carbs ? <span className="text-amber-400">C: {plan.carbs}g</span> : null}
                {plan.fats ? <span className="text-green-400">F: {plan.fats}g</span> : null}
              </div>

              {/* Status + Meals count */}
              <div className="flex items-center justify-between mt-3">
                <Badge
                  variant="outline"
                  className={`text-xs ${STATUS_COLORS[plan.status] || STATUS_COLORS.draft}`}
                >
                  {plan.status === 'active' ? t.dashboard.active :
                   plan.status === 'draft' ? t.dashboard.draft :
                   plan.status === 'completed' ? t.dashboard.completed :
                   plan.status || t.dashboard.draft}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {plan.meals?.length || 0} {t.dashboard.mealsLabel}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* CREATE/EDIT DIALOG */}

      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="bg-card border-white/10 max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPlan ? t.dashboard.editNutritionTitle : t.dashboard.createNutritionTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPlan ? t.dashboard.updateNutritionDesc : t.dashboard.designNutritionDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* ---- 1. Basic Info ---- */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">{t.dashboard.basicInfo}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t.dashboard.planNameLabel} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder={t.dashboard.planNamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t.dashboard.clientRequired} *</Label>
                  <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                      <SelectValue placeholder={t.dashboard.selectClient} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.descriptionOptional}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                  placeholder={t.dashboard.descriptionPlaceholder}
                />
              </div>
            </div>

            {/* ---- 2. Daily Macros ---- */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">{t.dashboard.dailyMacros}</h4>
                <div className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={autoCalc}
                      onCheckedChange={(checked) => {
                        const val = checked === true
                        setAutoCalc(val)
                        if (val) {
                          const cm = computedMacros()
                          setFormData((prev) => ({
                            ...prev,
                            calories: cm.calories,
                            protein: cm.protein,
                            carbs: cm.carbs,
                            fats: cm.fats,
                          }))
                        }
                      }}
                      className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <span className="text-xs text-muted-foreground">{t.dashboard.autoCalcFromFood}</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t.dashboard.caloriesKcal}</Label>
                  <Input
                    type="number"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white h-9"
                    placeholder="kcal"
                    readOnly={autoCalc}
                    disabled={autoCalc}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-red-400">{t.dashboard.proteinG}</Label>
                  <Input
                    type="number"
                    value={formData.protein || ''}
                    onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white h-9 focus-visible:ring-red-400/30"
                    placeholder="g"
                    readOnly={autoCalc}
                    disabled={autoCalc}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-amber-400">{t.dashboard.carbsG}</Label>
                  <Input
                    type="number"
                    value={formData.carbs || ''}
                    onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white h-9 focus-visible:ring-amber-400/30"
                    placeholder="g"
                    readOnly={autoCalc}
                    disabled={autoCalc}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-green-400">{t.dashboard.fatsG}</Label>
                  <Input
                    type="number"
                    value={formData.fats || ''}
                    onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white h-9 focus-visible:ring-green-400/30"
                    placeholder="g"
                    readOnly={autoCalc}
                    disabled={autoCalc}
                  />
                </div>
              </div>
              {autoCalc && (
                <p className="text-[11px] text-muted-foreground/60 mt-2">{t.dashboard.autoCalculated}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t.dashboard.fiberOptional}</Label>
                  <Input
                    type="number"
                    value={formData.fiber || ''}
                    onChange={(e) => setFormData({ ...formData, fiber: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white h-9"
                    placeholder="g"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-blue-400">{t.dashboard.waterMl}</Label>
                  <Input
                    type="number"
                    value={formData.waterMl || ''}
                    onChange={(e) => setFormData({ ...formData, waterMl: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white h-9"
                    placeholder="ml"
                  />
                </div>
              </div>
            </div>

            {/* ---- 3. Status ---- */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Status</h4>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 rounded-md bg-white/5 border border-white/10 text-white text-sm px-3"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* ---- 5. Date Range ---- */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">{t.dashboard.dateRangeOptional}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t.dashboard.startDate}</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t.dashboard.endDate}</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
              </div>
            </div>

            {/* ---- 4. Meals Builder ---- */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">{t.dashboard.mealsBuilder}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMeal}
                  className="bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 h-7 text-xs"
                >
                  <Plus className="w-3 h-3 me-1" />
                  {t.dashboard.addMeal}
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {formData.meals.map((meal, mIdx) => (
                    <motion.div
                      key={mIdx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Collapsible
                        open={meal.open}
                        onOpenChange={(open) => updateMeal(mIdx, { open })}
                      >
                        <div className="glass rounded-xl overflow-hidden">
                          {/* Meal Header */}
                          <div className="flex items-center gap-2 p-4">
                            <CollapsibleTrigger asChild>
                              <button className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0">
                                {meal.open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </CollapsibleTrigger>
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${MEAL_TYPE_COLORS[meal.mealType] || MEAL_TYPE_COLORS.Custom}`}
                            >
                              {getMealTypeLabel(meal.mealType)}
                            </Badge>
                            <span className="text-sm text-white font-medium truncate flex-1">
                              {meal.name || t.dashboard.untitledMeal}
                            </span>
                            {meal.foodItems.length > 0 && (
                              <span className="text-xs text-muted-foreground shrink-0">
                                {meal.foodItems.length} {meal.foodItems.length !== 1 ? t.dashboard.itemsLabel : t.dashboard.itemLabel}
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-400 shrink-0"
                              onClick={() => removeMeal(mIdx)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          {/* Meal Content */}
                          <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                              {/* Meal Info Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">{t.dashboard.mealType}</Label>
                                  <Select
                                    value={meal.mealType}
                                    onValueChange={(v) => updateMeal(mIdx, { mealType: v })}
                                  >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MEAL_TYPES.map((mt) => (
                                        <SelectItem key={mt} value={mt}>{getMealTypeLabel(mt)}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">{t.dashboard.mealName}</Label>
                                  <Input
                                    value={meal.name}
                                    onChange={(e) => updateMeal(mIdx, { name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white h-8 text-xs"
                                    placeholder={t.dashboard.mealName}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">{t.dashboard.timeLabel}</Label>
                                  <Input
                                    value={meal.time}
                                    onChange={(e) => updateMeal(mIdx, { time: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white h-8 text-xs"
                                    placeholder="8:00 AM"
                                  />
                                </div>
                              </div>

                              {/* Food Items */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs text-muted-foreground">{t.dashboard.foodItems}</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addFoodItem(mIdx)}
                                    className="h-6 text-xs text-green-400 hover:text-green-300 hover:bg-green-600/10 px-2"
                                  >
                                    <Plus className="w-3 h-3 me-1" />
                                    {t.dashboard.addFoodItem}
                                  </Button>
                                </div>

                                {meal.foodItems.length === 0 ? (
                                  <p className="text-xs text-muted-foreground/40 py-2 text-center">{t.dashboard.noFoodItemsAdded}</p>
                                ) : (
                                  <div className="space-y-3">
                                    {meal.foodItems.map((fi, fiIdx) => (
                                      <div key={fiIdx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                        {/* Row 1: Food name + delete */}
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-muted-foreground">{t.dashboard.foodNameLabel}</Label>
                                            <Input
                                              value={fi.name}
                                              onChange={(e) => updateFoodItem(mIdx, fiIdx, { name: e.target.value })}
                                              className="bg-white/5 border-white/10 text-white h-8 text-sm"
                                              placeholder={t.dashboard.foodNameLabel}
                                            />
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-400 shrink-0 mt-5"
                                            onClick={() => removeFoodItem(mIdx, fiIdx)}
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        {/* Row 2: Quantity + Unit + Macros */}
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                          <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground">{t.dashboard.quantityLabel}</Label>
                                            <Input
                                              type="number"
                                              value={fi.quantity || ''}
                                              onChange={(e) => updateFoodItem(mIdx, fiIdx, { quantity: Number(e.target.value) || 0 })}
                                              className="bg-white/5 border-white/10 text-white h-7 text-xs"
                                              placeholder="0"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground">{t.dashboard.unitLabel}</Label>
                                            <Select
                                              value={fi.unit}
                                              onValueChange={(v) => updateFoodItem(mIdx, fiIdx, { unit: v })}
                                            >
                                              <SelectTrigger className="bg-white/5 border-white/10 text-white h-7 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {FOOD_UNITS.map((u) => (
                                                  <SelectItem key={u} value={u}>{u}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground">{t.dashboard.caloriesLabel}</Label>
                                            <Input
                                              type="number"
                                              value={fi.calories || ''}
                                              onChange={(e) => updateFoodItem(mIdx, fiIdx, { calories: Number(e.target.value) || 0 })}
                                              className="bg-white/5 border-white/10 text-white h-7 text-xs"
                                              placeholder="kcal"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] text-red-400">{t.dashboard.proteinG}</Label>
                                            <Input
                                              type="number"
                                              value={fi.protein || ''}
                                              onChange={(e) => updateFoodItem(mIdx, fiIdx, { protein: Number(e.target.value) || 0 })}
                                              className="bg-white/5 border-white/10 text-white h-7 text-xs"
                                              placeholder="g"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] text-amber-400">{t.dashboard.carbsG}</Label>
                                            <Input
                                              type="number"
                                              value={fi.carbs || ''}
                                              onChange={(e) => updateFoodItem(mIdx, fiIdx, { carbs: Number(e.target.value) || 0 })}
                                              className="bg-white/5 border-white/10 text-white h-7 text-xs"
                                              placeholder="g"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] text-green-400">{t.dashboard.fatsG}</Label>
                                            <Input
                                              type="number"
                                              value={fi.fats || ''}
                                              onChange={(e) => updateFoodItem(mIdx, fiIdx, { fats: Number(e.target.value) || 0 })}
                                              className="bg-white/5 border-white/10 text-white h-7 text-xs"
                                              placeholder="g"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="text-muted-foreground">{t.dashboard.cancel}</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? t.dashboard.saving : editingPlan ? t.dashboard.update : t.dashboard.createPlan}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.deleteNutritionTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.deleteNutritionConfirm}
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
