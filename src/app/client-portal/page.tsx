'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n, I18nProvider } from '@/lib/i18n'
import { clientApi } from '@/lib/client-api'
import type {
  ClientUser,
  ClientWorkoutProgram,
  ClientNutritionPlan,
  ClientProgressEntry,
  ClientSession,
  ClientPayment,
} from '@/lib/client-api'
import {
  Phone, Globe, LogOut, Dumbbell, Utensils, TrendingUp,
  Calendar, CreditCard, User, Scale, Target, Clock, MapPin,
  Timer, Droplets, Plus, Edit, Camera, CheckCircle, Loader2,
  Activity, Flame, Ruler, Moon, Sun, RefreshCw, ChevronDown,
  ChevronUp, Wallet, Receipt, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'

// ============ Types ============

interface DashboardData {
  profile: ClientUser & { profileImage?: string }
  workoutPrograms: ClientWorkoutProgram[]
  nutritionPlans: ClientNutritionPlan[]
  progress: ClientProgressEntry[]
  upcomingSessions: ClientSession[]
  paymentSummary: {
    totalPayments: number
    totalAmount: number
    pendingPayments: number
  }
}

// ============ Helpers ============

function formatDate(d: string, isRTL: boolean) {
  try {
    return new Date(d).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch { return d }
}

function formatTime(d: string, isRTL: boolean) {
  try {
    return new Date(d).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return '' }
}

function formatCurrency(n: number, isRTL: boolean) {
  return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
    style: 'currency', currency: 'EGP', minimumFractionDigits: 0
  }).format(n)
}

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('') || 'C'
}

function mealIcon(type: string) {
  switch (type) {
    case 'breakfast': return <Sun className="w-4 h-4 text-amber-400" />
    case 'lunch': return <Sun className="w-4 h-4 text-orange-400" />
    case 'dinner': return <Moon className="w-4 h-4 text-blue-400" />
    default: return <Utensils className="w-4 h-4 text-green-400" />
  }
}

function statusBadge(status: string, isRTL: boolean) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    active: { bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-400/20', label: isRTL ? 'نشط' : 'Active' },
    completed: { bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-400/20', label: isRTL ? 'مكتمل' : 'Completed' },
    scheduled: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20', label: isRTL ? 'مجدول' : 'Scheduled' },
    pending: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20', label: isRTL ? 'معلق' : 'Pending' },
    paid: { bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-400/20', label: isRTL ? 'مدفوع' : 'Paid' },
    overdue: { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/20', label: isRTL ? 'متأخر' : 'Overdue' },
    cancelled: { bg: 'bg-white/5', text: 'text-muted-foreground', border: 'border-white/10', label: isRTL ? 'ملغى' : 'Cancelled' },
    draft: { bg: 'bg-white/5', text: 'text-muted-foreground', border: 'border-white/10', label: isRTL ? 'مسودة' : 'Draft' },
    paused: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20', label: isRTL ? 'متوقف' : 'Paused' },
    expired: { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/20', label: isRTL ? 'منتهي' : 'Expired' },
  }
  const s = map[status] || { bg: 'bg-white/5', text: 'text-muted-foreground', border: 'border-white/10', label: status }
  return (
    <Badge variant="outline" className={`text-[10px] h-5 ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </Badge>
  )
}

// ============ Phone Login Screen ============

function PhoneLoginScreen({ onLogin }: { onLogin: (client: Record<string, unknown>, token: string) => void }) {
  const { lang, dir, toggleLang } = useI18n()
  const isRTL = lang === 'ar'
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone.trim()) {
      setError(isRTL ? 'يرجى كتابة رقم التليفون' : 'Please enter your phone number')
      return
    }
    setLoading(true)
    try {
      const res = await clientApi.phoneLogin(phone.trim()) as Record<string, unknown>
      const token = res.token as string
      const client = res.client as Record<string, unknown>
      if (!token || !client) {
        setError(isRTL ? 'رقم التليفون غير مسجل. تواصل مع كوتشك.' : 'Your phone number is not registered. Please contact your coach.')
        return
      }
      clientApi.setToken(token)
      onLogin(client, token)
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isRTL ? 'فشل تسجيل الدخول' : 'Login failed')
      if (msg.includes('not found') || msg.includes('No account')) {
        setError(isRTL ? 'رقم التليفون غير مسجل. تواصل مع كوتشك.' : 'Your phone number is not registered. Please contact your coach.')
      } else if (msg.includes('inactive') || msg.includes('not yet approved') || msg.includes('not approved')) {
        setError(isRTL ? 'حسابك غير مفعل أو غير موافق عليه بعد. تواصل مع كوتشك.' : 'Your account is inactive or not yet approved. Please contact your coach.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" dir={dir}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <a href="/" className="text-muted-foreground hover:text-white gap-2 flex items-center text-sm transition-colors">
            <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            <span>{isRTL ? 'الرجوع للموقع' : 'Back to Website'}</span>
          </a>
          <Button variant="ghost" onClick={toggleLang} className="text-muted-foreground hover:text-white gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm">{isRTL ? 'English' : 'عربي'}</span>
          </Button>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/20"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/30 mb-4">
              <Dumbbell className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              COACH <span className="gradient-text">CONAN</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {isRTL ? 'بوابة العميل' : 'Client Portal'}
            </p>
          </div>

          <h2 className="text-lg font-semibold text-white text-center mb-2">
            {isRTL ? 'مرحباً بعودتك' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isRTL ? 'سجل دخولك برقم التليفون' : 'Sign in with your phone number'}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 text-sm text-center flex items-center gap-2 justify-center"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {isRTL ? 'رقم التليفون' : 'Phone Number'}
              </Label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isRTL ? 'اكتب رقم تليفونك' : 'Enter your phone number'}
                  disabled={loading}
                  className="ps-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-red-600/50 focus:ring-red-600/20 h-12 text-base"
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isRTL ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
                </span>
              ) : (
                isRTL ? 'تسجيل الدخول' : 'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            {isRTL ? 'ممعكش حساب؟ تواصل مع كوتشك عشان يسجلك.' : "Don't have an account? Contact your coach to register."}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// ============ Profile Edit Dialog ============

function ProfileEditDialog({
  open,
  onClose,
  profile,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  profile: DashboardData['profile']
  onSaved: () => void
}) {
  const { lang } = useI18n()
  const isRTL = lang === 'ar'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    phone: profile.phone || '',
    age: profile.age?.toString() || '',
    gender: profile.gender || '',
    weight: profile.weight?.toString() || '',
    height: profile.height?.toString() || '',
    goal: profile.goal || '',
    profileImage: profile.profileImage || '',
  })

  useEffect(() => {
    setForm({
      phone: profile.phone || '',
      age: profile.age?.toString() || '',
      gender: profile.gender || '',
      weight: profile.weight?.toString() || '',
      height: profile.height?.toString() || '',
      goal: profile.goal || '',
      profileImage: profile.profileImage || '',
    })
  }, [profile])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert(isRTL ? 'الصورة كبيرة جداً (أقصى 2MB)' : 'Image too large (max 2MB)')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(f => ({ ...f, profileImage: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await clientApi.updateProfile({
        phone: form.phone,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        goal: form.goal,
        profileImage: form.profileImage,
      })
      onSaved()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-white">{isRTL ? 'تعديل البيانات' : 'Edit Profile'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isRTL ? 'عدل بياناتك الشخصية' : 'Update your personal information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-red-600/30">
                <AvatarImage src={form.profileImage} />
                <AvatarFallback className="bg-red-600/20 text-red-400 text-2xl font-bold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold text-white">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <label className="text-xs text-red-400 cursor-pointer hover:text-red-300 mt-1 inline-flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {isRTL ? 'تغيير الصورة' : 'Change Photo'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'رقم التليفون' : 'Phone'}</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'العمر' : 'Age'}</Label>
              <Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الجنس' : 'Gender'}</Label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="">{isRTL ? 'اختر' : 'Select'}</option>
                <option value="Male">{isRTL ? 'ذكر' : 'Male'}</option>
                <option value="Female">{isRTL ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الهدف' : 'Goal'}</Label>
              <Input value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}</Label>
              <Input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الطول (سم)' : 'Height (cm)'}</Label>
              <Input type="number" step="0.1" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <CheckCircle className="w-4 h-4 me-2" />}
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Add Progress Dialog ============

function AddProgressDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const { lang } = useI18n()
  const isRTL = lang === 'ar'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    waist: '',
    chest: '',
    arms: '',
    thighs: '',
    hips: '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      setForm({ weight: '', bodyFat: '', muscleMass: '', waist: '', chest: '', arms: '', thighs: '', hips: '', notes: '' })
    }
  }, [open])

  const handleSave = async () => {
    setLoading(true)
    try {
      const data: Record<string, unknown> = { notes: form.notes }
      if (form.weight) data.weight = parseFloat(form.weight)
      if (form.bodyFat) data.bodyFat = parseFloat(form.bodyFat)
      if (form.muscleMass) data.muscleMass = parseFloat(form.muscleMass)
      if (form.waist) data.waist = parseFloat(form.waist)
      if (form.chest) data.chest = parseFloat(form.chest)
      if (form.arms) data.arms = parseFloat(form.arms)
      if (form.thighs) data.thighs = parseFloat(form.thighs)
      if (form.hips) data.hips = parseFloat(form.hips)

      await clientApi.addProgress(data)
      onSaved()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            {isRTL ? 'إضافة قياس جديد' : 'Add Progress Entry'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isRTL ? 'سجل قياساتك الجديدة' : 'Record your new measurements'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}</Label>
            <Input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'دهون الجسم (%)' : 'Body Fat (%)'}</Label>
            <Input type="number" step="0.1" value={form.bodyFat} onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'العضلات (كجم)' : 'Muscle Mass (kg)'}</Label>
            <Input type="number" step="0.1" value={form.muscleMass} onChange={e => setForm(f => ({ ...f, muscleMass: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'الخصر (سم)' : 'Waist (cm)'}</Label>
            <Input type="number" step="0.1" value={form.waist} onChange={e => setForm(f => ({ ...f, waist: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'الصدر (سم)' : 'Chest (cm)'}</Label>
            <Input type="number" step="0.1" value={form.chest} onChange={e => setForm(f => ({ ...f, chest: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'الذراعين (سم)' : 'Arms (cm)'}</Label>
            <Input type="number" step="0.1" value={form.arms} onChange={e => setForm(f => ({ ...f, arms: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'الفخذين (سم)' : 'Thighs (cm)'}</Label>
            <Input type="number" step="0.1" value={form.thighs} onChange={e => setForm(f => ({ ...f, thighs: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'الأرداف (سم)' : 'Hips (cm)'}</Label>
            <Input type="number" step="0.1" value={form.hips} onChange={e => setForm(f => ({ ...f, hips: e.target.value }))} className="bg-white/5 border-white/10 text-white h-9" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isRTL ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/5 border-white/10 text-white min-h-[60px]" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Plus className="w-4 h-4 me-2" />}
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Empty State Component ============

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06]">
      <CardContent className="py-12 text-center">
        <Icon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

// ============ Client Dashboard Content ============

function ClientDashboardContent({ client: initialClient }: { client: Record<string, unknown> }) {
  const { lang, dir } = useI18n()
  const isRTL = lang === 'ar'
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [allSessions, setAllSessions] = useState<ClientSession[]>([])
  const [allPayments, setAllPayments] = useState<ClientPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [addProgressOpen, setAddProgressOpen] = useState(false)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadData = useCallback(async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setRefreshing(true)
      else setLoading(true)

      const [dashRes, sessRes, payRes] = await Promise.all([
        clientApi.getDashboard() as Promise<Record<string, unknown>>,
        clientApi.getSessions() as Promise<Record<string, unknown>>,
        clientApi.getPayments() as Promise<Record<string, unknown>>,
      ])

      setDashboardData(dashRes as unknown as DashboardData)
      if (sessRes.sessions) setAllSessions(sessRes.sessions as ClientSession[])
      if (payRes.payments) setAllPayments(payRes.payments as ClientPayment[])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // Auto-refresh every 60 seconds for real-time updates
    refreshTimerRef.current = setInterval(() => loadData(true), 60000)
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [loadData])

  const profile = dashboardData?.profile || (initialClient as unknown as DashboardData['profile'])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" dir={dir}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          <span className="text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading your data...'}</span>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: Dumbbell, label: isRTL ? 'برامج التمرين' : 'Workout Programs', value: dashboardData?.workoutPrograms?.length || 0, color: 'text-red-400', bg: 'bg-red-400/15' },
    { icon: Utensils, label: isRTL ? 'خطط التغذية' : 'Nutrition Plans', value: dashboardData?.nutritionPlans?.length || 0, color: 'text-green-400', bg: 'bg-green-400/15' },
    { icon: Calendar, label: isRTL ? 'الجلسات القادمة' : 'Upcoming Sessions', value: dashboardData?.upcomingSessions?.length || 0, color: 'text-amber-400', bg: 'bg-amber-400/15' },
    { icon: CreditCard, label: isRTL ? 'مدفوعات معلقة' : 'Pending Payments', value: dashboardData?.paymentSummary?.pendingPayments || 0, color: 'text-blue-400', bg: 'bg-blue-400/15' },
  ]

  return (
    <div className="space-y-6" dir={dir}>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-red-600/30">
            <AvatarImage src={profile.profileImage} />
            <AvatarFallback className="bg-red-600/20 text-red-400 text-xl font-bold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.phone && <Badge variant="outline" className="text-xs bg-white/5 border-white/10"><Phone className="w-3 h-3 me-1" />{profile.phone}</Badge>}
              {profile.age ? <Badge variant="outline" className="text-xs bg-white/5 border-white/10"><User className="w-3 h-3 me-1" />{profile.age} {isRTL ? 'سنة' : 'yrs'}</Badge> : null}
              {profile.weight ? <Badge variant="outline" className="text-xs bg-white/5 border-white/10"><Scale className="w-3 h-3 me-1" />{profile.weight} kg</Badge> : null}
              {profile.height ? <Badge variant="outline" className="text-xs bg-white/5 border-white/10"><Ruler className="w-3 h-3 me-1" />{profile.height} cm</Badge> : null}
              {profile.goal ? <Badge variant="outline" className="text-xs bg-red-600/10 border-red-600/20 text-red-400"><Target className="w-3 h-3 me-1" />{profile.goal}</Badge> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => loadData(true)} variant="outline" size="icon" className="border-white/10 hover:bg-white/5 text-white h-9 w-9" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setEditOpen(true)} variant="outline" className="border-white/10 hover:bg-white/5 text-white gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'تعديل' : 'Edit'}</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 w-full overflow-x-auto flex-nowrap justify-start sm:justify-center">
          <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="workouts" className="text-xs sm:text-sm data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            {isRTL ? 'التمارين' : 'Workouts'}
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="text-xs sm:text-sm data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            {isRTL ? 'التغذية' : 'Nutrition'}
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            {isRTL ? 'التقدم' : 'Progress'}
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs sm:text-sm data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            {isRTL ? 'الجلسات' : 'Sessions'}
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            {isRTL ? 'المدفوعات' : 'Payments'}
          </TabsTrigger>
        </TabsList>

        {/* ========= Overview Tab ========= */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Upcoming Sessions */}
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-amber-400" />
                {isRTL ? 'الجلسات القادمة' : 'Upcoming Sessions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!dashboardData?.upcomingSessions?.length ? (
                <p className="text-muted-foreground text-sm text-center py-6">{isRTL ? 'مفيش جلسات قادمة' : 'No upcoming sessions'}</p>
              ) : (
                <div className="space-y-2">
                  {dashboardData.upcomingSessions.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-400/15 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.duration} {isRTL ? 'دقيقة' : 'min'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(s.date, isRTL)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Active Workout */}
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Dumbbell className="w-5 h-5 text-red-400" />
                  {isRTL ? 'برنامج التمرين النشط' : 'Active Workout Program'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dashboardData?.workoutPrograms?.filter(w => w.status === 'active').length ? (
                  <p className="text-muted-foreground text-sm text-center py-6">{isRTL ? 'مفيش برنامج تمرين نشط' : 'No active workout program'}</p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.workoutPrograms.filter(w => w.status === 'active').slice(0, 2).map(w => (
                      <div key={w.id} className="p-3 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">{w.name}</p>
                          {statusBadge('active', isRTL)}
                        </div>
                        {w.description && <p className="text-xs text-muted-foreground mt-1">{w.description}</p>}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          {w.frequency && <span>{w.frequency}</span>}
                          <span>{w.durationWeeks} {isRTL ? 'أسابيع' : 'weeks'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Nutrition */}
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Utensils className="w-5 h-5 text-green-400" />
                  {isRTL ? 'خطة التغذية النشطة' : 'Active Nutrition Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!dashboardData?.nutritionPlans?.filter(n => n.status === 'active').length ? (
                  <p className="text-muted-foreground text-sm text-center py-6">{isRTL ? 'مفيش خطة تغذية نشطة' : 'No active nutrition plan'}</p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.nutritionPlans.filter(n => n.status === 'active').slice(0, 2).map(n => (
                      <div key={n.id} className="p-3 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">{n.name}</p>
                          {statusBadge('active', isRTL)}
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          {n.calories > 0 && <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{n.calories} cal</span>}
                          {n.protein > 0 && <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />{n.protein}g P</span>}
                          {n.carbs > 0 && <span>{n.carbs}g C</span>}
                          {n.fats > 0 && <span>{n.fats}g F</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-blue-400" />
                {isRTL ? 'ملخص المدفوعات' : 'Payment Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-bold text-white">{dashboardData?.paymentSummary?.totalPayments || 0}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي المدفوعات' : 'Total Payments'}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-bold text-green-400">{formatCurrency(dashboardData?.paymentSummary?.totalAmount || 0, isRTL)}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-bold text-amber-400">{dashboardData?.paymentSummary?.pendingPayments || 0}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'معلقة' : 'Pending'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========= Workouts Tab ========= */}
        <TabsContent value="workouts" className="mt-4">
          {!dashboardData?.workoutPrograms?.length ? (
            <EmptyState icon={Dumbbell} message={isRTL ? 'مفيش برامج تمرين بعد' : 'No workout programs yet'} />
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {dashboardData.workoutPrograms.map(w => (
                <AccordionItem key={w.id} value={w.id} className="glass rounded-xl border-none px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-start">
                      <div className="w-10 h-10 rounded-xl bg-red-400/15 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{w.name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center">
                          <span>{w.durationWeeks} {isRTL ? 'أسابيع' : 'weeks'}</span>
                          {w.frequency && <span>· {w.frequency}</span>}
                          {statusBadge(w.status, isRTL)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {w.description && <p className="text-sm text-muted-foreground mb-3">{w.description}</p>}
                    {w.weeks?.map(week => (
                      <div key={week.id || week.weekNumber} className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-400" />
                          {isRTL ? `الأسبوع ${week.weekNumber}` : `Week ${week.weekNumber}`}
                          {week.name && <span className="text-muted-foreground">- {week.name}</span>}
                        </h4>
                        {week.days?.map(day => (
                          <div key={day.id || day.dayNumber} className="mb-2 ms-4">
                            <h5 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                              {isRTL ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                              {day.dayName && ` - ${day.dayName}`}
                              {day.isRestDay && <Badge variant="outline" className="text-[10px] bg-blue-400/10 text-blue-400 border-blue-400/20">{isRTL ? 'راحة' : 'Rest'}</Badge>}
                            </h5>
                            {!day.isRestDay && day.exercises?.length > 0 && (
                              <div className="space-y-1">
                                {day.exercises.map((ex, idx) => (
                                  <div key={ex.id || idx} className="p-2.5 rounded-lg bg-white/[0.03] text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-white">{ex.name}</span>
                                      <span className="text-muted-foreground font-mono">{ex.sets}×{ex.reps}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-muted-foreground mt-1">
                                      {ex.muscleGroup && <span>{ex.muscleGroup}</span>}
                                      {ex.weightKg > 0 && <span>{ex.weightKg}kg</span>}
                                      {ex.restSeconds > 0 && <span>{ex.restSeconds}s {isRTL ? 'راحة' : 'rest'}</span>}
                                      {ex.tempo && <span>{isRTL ? 'إيقاع' : 'tempo'}: {ex.tempo}</span>}
                                    </div>
                                    {ex.isSuperset && <Badge variant="outline" className="text-[10px] mt-1 bg-purple-400/10 text-purple-400 border-purple-400/20">{isRTL ? 'سوبرست' : 'Superset'} {ex.supersetGroup}</Badge>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        {/* ========= Nutrition Tab ========= */}
        <TabsContent value="nutrition" className="mt-4">
          {!dashboardData?.nutritionPlans?.length ? (
            <EmptyState icon={Utensils} message={isRTL ? 'مفيش خطط تغذية بعد' : 'No nutrition plans yet'} />
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {dashboardData.nutritionPlans.map(plan => (
                <AccordionItem key={plan.id} value={plan.id} className="glass rounded-xl border-none px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-start">
                      <div className="w-10 h-10 rounded-xl bg-green-400/15 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{plan.name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center">
                          {plan.calories > 0 && <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{plan.calories} cal</span>}
                          {plan.protein > 0 && <span>{plan.protein}g P</span>}
                          {statusBadge(plan.status, isRTL)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {plan.description && <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>}

                    {/* Macro Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {[
                        { label: isRTL ? 'سعرات' : 'Calories', value: plan.calories, unit: 'cal', icon: Flame, color: 'text-red-400' },
                        { label: isRTL ? 'بروتين' : 'Protein', value: plan.protein, unit: 'g', icon: Dumbbell, color: 'text-blue-400' },
                        { label: isRTL ? 'كربوهيدرات' : 'Carbs', value: plan.carbs, unit: 'g', icon: Activity, color: 'text-amber-400' },
                        { label: isRTL ? 'دهون' : 'Fats', value: plan.fats, unit: 'g', icon: Droplets, color: 'text-green-400' },
                      ].map(m => (
                        <div key={m.label} className="p-2 rounded-lg bg-white/[0.03] text-center">
                          <m.icon className={`w-4 h-4 ${m.color} mx-auto mb-1`} />
                          <p className="text-sm font-bold text-white">{m.value}{m.unit}</p>
                          <p className="text-[10px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {plan.fiber > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Droplets className="w-3 h-3" />
                        {isRTL ? `ألياف: ${plan.fiber}g` : `Fiber: ${plan.fiber}g`}
                      </div>
                    )}

                    {plan.waterMl > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Droplets className="w-3 h-3" />
                        {isRTL ? `ماء: ${plan.waterMl}ml` : `Water: ${plan.waterMl}ml`}
                      </div>
                    )}

                    {/* Meals */}
                    {plan.meals?.map(meal => (
                      <div key={meal.id} className="mb-3 p-3 rounded-xl bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          {mealIcon(meal.mealType)}
                          <span className="text-sm font-medium text-white capitalize">{meal.name}</span>
                          {meal.time && <span className="text-xs text-muted-foreground ms-auto">{meal.time}</span>}
                        </div>
                        {meal.notes && <p className="text-xs text-muted-foreground mb-2">{meal.notes}</p>}
                        {meal.foodItems?.length > 0 && (
                          <div className="space-y-1">
                            {meal.foodItems.map(food => (
                              <div key={food.id || food.order} className="flex items-center justify-between py-1 text-xs">
                                <span className="text-muted-foreground">
                                  {food.name}
                                  {food.quantity > 0 ? ` (${food.quantity}${food.unit})` : ''}
                                </span>
                                <div className="flex gap-2 text-muted-foreground">
                                  {food.calories > 0 && <span>{food.calories} cal</span>}
                                  {food.protein > 0 && <span>{food.protein}g P</span>}
                                  {food.carbs > 0 && <span>{food.carbs}g C</span>}
                                  {food.fats > 0 && <span>{food.fats}g F</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        {/* ========= Progress Tab ========= */}
        <TabsContent value="progress" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isRTL ? `قياسات التقدم (${dashboardData?.progress?.length || 0})` : `Progress Entries (${dashboardData?.progress?.length || 0})`}
            </h3>
            <Button onClick={() => setAddProgressOpen(true)} size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              <Plus className="w-4 h-4" />
              {isRTL ? 'إضافة قياس' : 'Add Entry'}
            </Button>
          </div>

          {!dashboardData?.progress?.length ? (
            <EmptyState icon={TrendingUp} message={isRTL ? 'مفيش قياسات تقدم بعد' : 'No progress entries yet'} />
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {dashboardData.progress.map(p => (
                <div key={p.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{formatDate(p.recordedAt, isRTL)}</span>
                    {p.notes && <span className="text-xs text-muted-foreground max-w-[200px] truncate">{p.notes}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {p.weight > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Scale className="w-4 h-4 text-red-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.weight} kg</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'وزن' : 'Weight'}</p>
                      </div>
                    )}
                    {p.bodyFat > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.bodyFat}%</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'دهون' : 'Body Fat'}</p>
                      </div>
                    )}
                    {p.muscleMass > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Dumbbell className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.muscleMass} kg</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'عضلات' : 'Muscle'}</p>
                      </div>
                    )}
                    {p.waist > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Ruler className="w-4 h-4 text-green-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.waist} cm</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'خصر' : 'Waist'}</p>
                      </div>
                    )}
                    {p.chest > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Ruler className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.chest} cm</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'صدر' : 'Chest'}</p>
                      </div>
                    )}
                    {p.arms > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Ruler className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.arms} cm</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'ذراعين' : 'Arms'}</p>
                      </div>
                    )}
                    {p.thighs > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Ruler className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.thighs} cm</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'فخذين' : 'Thighs'}</p>
                      </div>
                    )}
                    {p.hips > 0 && (
                      <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                        <Ruler className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-white">{p.hips} cm</p>
                        <p className="text-[10px] text-muted-foreground">{isRTL ? 'أرداف' : 'Hips'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========= Sessions Tab ========= */}
        <TabsContent value="sessions" className="mt-4">
          {!allSessions.length ? (
            <EmptyState icon={Calendar} message={isRTL ? 'مفيش جلسات بعد' : 'No sessions yet'} />
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {allSessions.map(s => (
                <div key={s.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{s.title}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(s.date, isRTL)} {formatTime(s.date, isRTL)}</span>
                          <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{s.duration} {isRTL ? 'دقيقة' : 'min'}</span>
                          {s.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>}
                        </div>
                        {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                      </div>
                    </div>
                    {statusBadge(s.status, isRTL)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========= Payments Tab ========= */}
        <TabsContent value="payments" className="mt-4">
          {!allPayments.length ? (
            <EmptyState icon={CreditCard} message={isRTL ? 'مفيش مدفوعات بعد' : 'No payments yet'} />
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {allPayments.map(p => (
                <div key={p.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        p.status === 'paid' ? 'bg-green-400/15' : p.status === 'overdue' ? 'bg-red-400/15' : 'bg-amber-400/15'
                      }`}>
                        {p.status === 'paid' ? <Wallet className="w-5 h-5 text-green-400" /> :
                         p.status === 'overdue' ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                         <Receipt className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{p.description || p.invoiceNumber}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{formatCurrency(p.amount, isRTL)}</span>
                          {p.method && <span>{p.method}</span>}
                          {p.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{isRTL ? 'مستحق' : 'Due'}: {formatDate(p.dueDate, isRTL)}</span>}
                          {p.paidDate && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{isRTL ? 'مدفوع' : 'Paid'}: {formatDate(p.paidDate, isRTL)}</span>}
                        </div>
                        {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {statusBadge(p.status, isRTL)}
                      <span className="text-xs text-muted-foreground">#{p.invoiceNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProfileEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={() => loadData(true)}
      />
      <AddProgressDialog
        open={addProgressOpen}
        onClose={() => setAddProgressOpen(false)}
        onSaved={() => loadData(true)}
      />
    </div>
  )
}

// ============ Main Client Portal Layout ============

function ClientPortalInner() {
  const { lang, dir, toggleLang } = useI18n()
  const isRTL = lang === 'ar'
  const [client, setClient] = useState<Record<string, unknown> | null>(null)
  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return !!clientApi.getToken()
  })

  useEffect(() => {
    const token = clientApi.getToken()
    if (token) {
      clientApi.getMe()
        .then((data) => {
          const c = (data as Record<string, unknown>).client as Record<string, unknown>
          if (c) setClient(c)
          else clientApi.clearToken()
        })
        .catch(() => clientApi.clearToken())
        .finally(() => setAuthLoading(false))
    } else {
      queueMicrotask(() => setAuthLoading(false))
    }
  }, [])

  const handleLogin = useCallback((c: Record<string, unknown>, _token: string) => {
    setClient(c)
  }, [])

  const handleLogout = useCallback(() => {
    clientApi.clearToken()
    setClient(null)
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          <span className="text-muted-foreground">{isRTL ? 'جارٍ التحقق...' : 'Verifying session...'}</span>
        </div>
      </div>
    )
  }

  if (!client) {
    return <PhoneLoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-600/30 flex-shrink-0">
              <Dumbbell className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">
              COACH <span className="gradient-text">CONAN</span>
            </span>
            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />
            <span className="text-sm text-muted-foreground hidden sm:inline">{isRTL ? 'بوابة العميل' : 'Client Portal'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-2 me-2">
              <Avatar className="w-8 h-8 border border-red-600/30">
                <AvatarImage src={client.profileImage as string} />
                <AvatarFallback className="bg-red-600/20 text-red-400 text-xs font-bold">
                  {getInitials(client.name as string || 'C')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground max-w-[120px] truncate">{client.name as string}</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />
            <Button variant="ghost" size="sm" onClick={toggleLang} className="text-muted-foreground hover:text-white gap-1.5 h-8">
              <Globe className="w-4 h-4" />
              <span className="text-xs">{isRTL ? 'English' : 'عربي'}</span>
            </Button>
            <a href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white h-8 gap-1">
                <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                <span className="hidden md:inline text-xs">{isRTL ? 'الموقع' : 'Website'}</span>
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-600/10 h-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        <ClientDashboardContent client={client} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-3 text-center">
        <p className="text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Coach Conan &middot; {isRTL ? 'بوابة العملاء' : 'Client Portal'}
        </p>
      </footer>
    </div>
  )
}

// ============ Page Export (wrapped with I18n) ============

export default function ClientPortalPage() {
  return (
    <I18nProvider>
      <ClientPortalInner />
    </I18nProvider>
  )
}
