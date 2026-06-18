'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dumbbell,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Ruler,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clientApi } from '@/lib/client-api'
import { useI18n, type Translations } from '@/lib/i18n'

interface ClientLoginProps {
  onLogin: (client: Record<string, unknown>) => void
  onBack: () => void
}

// ============ Validation Types ============

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword' | 'phone' | 'age' | 'gender' | 'weight' | 'height' | 'goal'

interface FieldValidation {
  error: string
  isValid: boolean
}

// ============ Component ============

export default function ClientLogin({ onLogin, onBack }: ClientLoginProps) {
  const { t, lang, toggleLang, dir } = useI18n()
  const [activeTab, setActiveTab] = useState('signin')

  // ============ Translated Options ============

  const GENDERS = [
    { value: 'Male', label: t.clientLogin.male },
    { value: 'Female', label: t.clientLogin.female },
    { value: 'Other', label: t.clientLogin.other },
  ]

  const GOALS = [
    { value: 'Weight Loss', label: t.clientLogin.weightLoss },
    { value: 'Muscle Gain', label: t.clientLogin.muscleGain },
    { value: 'Body Recomposition', label: t.clientLogin.bodyRecomposition },
    { value: 'Strength', label: t.clientLogin.strength },
    { value: 'Endurance', label: t.clientLogin.endurance },
    { value: 'Flexibility', label: t.clientLogin.flexibility },
    { value: 'General Fitness', label: t.clientLogin.generalFitness },
    { value: 'Sports Performance', label: t.clientLogin.sportsPerformance },
  ]

  // ============ Validation Functions (inside component for i18n access) ============

  function validateName(value: string): FieldValidation {
    if (!value.trim()) return { error: t.clientLogin.nameRequired, isValid: false }
    if (value.trim().length < 2) return { error: t.clientLogin.nameMinLength, isValid: false }
    return { error: '', isValid: true }
  }

  function validateEmail(value: string): FieldValidation {
    if (!value.trim()) return { error: t.clientLogin.emailRequired, isValid: false }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return { error: t.clientLogin.emailInvalid, isValid: false }
    return { error: '', isValid: true }
  }

  function validatePassword(value: string): FieldValidation {
    if (!value) return { error: t.clientLogin.passwordRequired, isValid: false }
    if (value.length < 8) return { error: t.clientLogin.passwordMinLength, isValid: false }
    if (!/[A-Z]/.test(value)) return { error: t.clientLogin.passwordUppercase, isValid: false }
    if (!/[a-z]/.test(value)) return { error: t.clientLogin.passwordLowercase, isValid: false }
    if (!/[0-9]/.test(value)) return { error: t.clientLogin.passwordNumber, isValid: false }
    if (!/[^A-Za-z0-9]/.test(value)) return { error: t.clientLogin.passwordSpecial, isValid: false }
    return { error: '', isValid: true }
  }

  function validateConfirmPassword(value: string, password: string): FieldValidation {
    if (!value) return { error: t.clientLogin.confirmRequired, isValid: false }
    if (value !== password) return { error: t.clientLogin.confirmNoMatch, isValid: false }
    return { error: '', isValid: true }
  }

  function validateAge(value: string): FieldValidation {
    if (!value) return { error: '', isValid: true } // optional
    const num = Number(value)
    if (isNaN(num) || !Number.isInteger(num)) return { error: t.clientLogin.ageInvalid, isValid: false }
    if (num < 1 || num > 150) return { error: t.clientLogin.ageInvalid, isValid: false }
    return { error: '', isValid: true }
  }

  function validateWeight(value: string): FieldValidation {
    if (!value) return { error: '', isValid: true } // optional
    const num = Number(value)
    if (isNaN(num)) return { error: t.clientLogin.weightInvalid, isValid: false }
    if (num < 0 || num > 1000) return { error: t.clientLogin.weightInvalid, isValid: false }
    return { error: '', isValid: true }
  }

  function validateHeight(value: string): FieldValidation {
    if (!value) return { error: '', isValid: true } // optional
    const num = Number(value)
    if (isNaN(num)) return { error: t.clientLogin.heightInvalid, isValid: false }
    if (num < 0 || num > 500) return { error: t.clientLogin.heightInvalid, isValid: false }
    return { error: '', isValid: true }
  }

  // ============ Password Requirements ============

  function getPasswordRequirements(password: string, tr: Translations) {
    return [
      { label: tr.clientLogin.minChars, test: password.length >= 8 },
      { label: tr.clientLogin.uppercase, test: /[A-Z]/.test(password) },
      { label: tr.clientLogin.lowercase, test: /[a-z]/.test(password) },
      { label: tr.clientLogin.number, test: /[0-9]/.test(password) },
      { label: tr.clientLogin.specialChar, test: /[^A-Za-z0-9]/.test(password) },
    ]
  }

  // Sign In state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAge, setRegAge] = useState('')
  const [regGender, setRegGender] = useState('')
  const [regWeight, setRegWeight] = useState('')
  const [regHeight, setRegHeight] = useState('')
  const [regGoal, setRegGoal] = useState('')

  // Touched state tracking
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    age: false,
    gender: false,
    weight: false,
    height: false,
    goal: false,
  })

  // Shared state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Ref for scrolling to first error
  const formRef = useRef<HTMLFormElement>(null)
  const errorRefs = useRef<Record<FieldName, HTMLDivElement | null>>({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
    phone: null,
    age: null,
    gender: null,
    weight: null,
    height: null,
    goal: null,
  })

  // ============ Touch Handler ============

  const handleTouch = useCallback((field: FieldName) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  // ============ Field Validation (respects touched state) ============

  const getFieldValidation = useCallback((field: FieldName): FieldValidation => {
    switch (field) {
      case 'name': return validateName(regName)
      case 'email': return validateEmail(regEmail)
      case 'password': return validatePassword(regPassword)
      case 'confirmPassword': return validateConfirmPassword(regConfirmPassword, regPassword)
      case 'age': return validateAge(regAge)
      case 'weight': return validateWeight(regWeight)
      case 'height': return validateHeight(regHeight)
      case 'phone': return { error: '', isValid: true }
      case 'gender': return { error: '', isValid: true }
      case 'goal': return { error: '', isValid: true }
      default: return { error: '', isValid: true }
    }
  }, [regName, regEmail, regPassword, regConfirmPassword, regAge, regWeight, regHeight, t])

  // ============ Check if form has any errors (regardless of touched) ============

  const hasValidationErrors = useCallback((): boolean => {
    const requiredFields: FieldName[] = ['name', 'email', 'password', 'confirmPassword']
    for (const field of requiredFields) {
      if (!getFieldValidation(field).isValid) return true
    }
    // Also check optional fields that have values
    const optionalFieldsWithValues: FieldName[] = ['age', 'weight', 'height']
    for (const field of optionalFieldsWithValues) {
      const val = field === 'age' ? regAge : field === 'weight' ? regWeight : regHeight
      if (val && !getFieldValidation(field).isValid) return true
    }
    return false
  }, [getFieldValidation, regAge, regWeight, regHeight])

  // ============ Get field border class ============

  const getFieldBorderClass = useCallback((field: FieldName): string => {
    if (!touched[field]) return 'border-white/10 focus:border-red-600/50'
    const validation = getFieldValidation(field)
    if (validation.isValid) return 'border-green-500/50 focus:border-green-500'
    return 'border-red-500/50 focus:border-red-500'
  }, [touched, getFieldValidation])

  // ============ Sign In Handler ============

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatusMessage('')
    try {
      const res = await clientApi.login(email, password)
      const client = res.client as Record<string, unknown>

      if (client && client.status === 'pending') {
        setStatusMessage(t.clientLogin.pendingApproval)
        setLoading(false)
        return
      }

      if (client && client.status === 'rejected') {
        setStatusMessage(t.clientLogin.accountRejected)
        setLoading(false)
        return
      }

      clientApi.setToken(res.token as string)
      onLogin(client)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.clientLogin.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  // ============ Register Handler (with pre-submit validation) ============

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatusMessage('')

    // Touch all fields to show all validation errors
    const allFields: FieldName[] = ['name', 'email', 'password', 'confirmPassword', 'age', 'weight', 'height']
    setTouched(prev => {
      const next = { ...prev }
      for (const field of allFields) {
        next[field] = true
      }
      return next
    })

    // Validate all fields
    const errors: { field: FieldName; message: string }[] = []
    for (const field of allFields) {
      const validation = getFieldValidation(field)
      if (!validation.isValid && validation.error) {
        errors.push({ field, message: validation.error })
      }
    }

    if (errors.length > 0) {
      // Build error message
      const errorLines = errors.map(e => `• ${e.field === 'confirmPassword' ? t.clientLogin.confirmPassword : e.field.charAt(0).toUpperCase() + e.field.slice(1)}: ${e.message}`)
      setError(`${t.clientLogin.fixErrors}\n${errorLines.join('\n')}`)

      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = errors[0].field
        const errorEl = errorRefs.current[firstErrorField]
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      return
    }

    setLoading(true)
    try {
      await clientApi.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
        age: regAge ? Number(regAge) : undefined,
        gender: regGender || undefined,
        weight: regWeight ? Number(regWeight) : undefined,
        height: regHeight ? Number(regHeight) : undefined,
        goal: regGoal || undefined,
      })
      setStatusMessage(t.clientLogin.registrationSuccess)
    } catch (err) {
      // Parse backend validation errors with details array
      const errMsg = err instanceof Error ? err.message : 'Registration failed'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // ============ Password match status ============

  const getPasswordMatchStatus = (): { match: boolean; show: boolean } => {
    if (!touched.confirmPassword) return { match: false, show: false }
    if (!regConfirmPassword) return { match: false, show: false }
    return { match: regPassword === regConfirmPassword, show: true }
  }

  const passwordMatchStatus = getPasswordMatchStatus()

  // ============ Compute if submit should be disabled ============

  const submitDisabled = loading || hasValidationErrors()

  return (
    <div dir={dir} className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative">
        <div className="flex justify-end mb-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">{t.nav.langToggle}</span>
          </button>
        </div>
        <div className="glass rounded-3xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                COACH <span className="gradient-text">CONAN</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{t.dashboard.clientPortal}</p>
            </div>
          </div>

          {/* Status Messages */}
          {statusMessage && (
            <div className={`rounded-xl p-3 text-sm border ${
              statusMessage === t.clientLogin.pendingApproval
                ? 'bg-amber-600/10 border-amber-600/20 text-amber-400'
                : statusMessage === t.clientLogin.accountRejected
                ? 'bg-red-600/10 border-red-600/20 text-red-400'
                : 'bg-green-600/10 border-green-600/20 text-green-400'
            }`}>
              {statusMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3 text-sm text-red-400 whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(''); setStatusMessage('') }}>
            <TabsList className="w-full bg-white/5 border border-white/10">
              <TabsTrigger value="signin" className="flex-1 data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
                {t.clientLogin.signIn}
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
                {t.clientLogin.register}
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t.clientLogin.email}</Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.clientLogin.emailPlaceholder}
                      required
                      autoComplete="email"
                      className="ps-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t.clientLogin.password}</Label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.clientLogin.passwordPlaceholder}
                      required
                      autoComplete="current-password"
                      className="ps-10 pe-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50"
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 h-12 text-base"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.clientLogin.signIn}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form ref={formRef} onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t.clientLogin.fullName} *</Label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      onBlur={() => handleTouch('name')}
                      placeholder={t.clientLogin.fullNamePlaceholder}
                      required
                      className={`ps-10 bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('name')}`}
                    />
                  </div>
                  {touched.name && !getFieldValidation('name').isValid && (
                    <div ref={el => { errorRefs.current.name = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {getFieldValidation('name').error}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t.clientLogin.email} *</Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      onBlur={() => handleTouch('email')}
                      placeholder={t.clientLogin.emailPlaceholder}
                      required
                      className={`ps-10 bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('email')}`}
                    />
                  </div>
                  {touched.email && !getFieldValidation('email').isValid && (
                    <div ref={el => { errorRefs.current.email = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {getFieldValidation('email').error}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">{t.clientLogin.password} *</Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        onBlur={() => handleTouch('password')}
                        placeholder={t.clientLogin.passwordPlaceholder}
                        required
                        className={`ps-10 bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('password')}`}
                      />
                    </div>
                    {touched.password && !getFieldValidation('password').isValid && (
                      <div ref={el => { errorRefs.current.password = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {getFieldValidation('password').error}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">{t.clientLogin.confirmPassword} *</Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        onBlur={() => handleTouch('confirmPassword')}
                        placeholder={t.clientLogin.confirmPlaceholder}
                        required
                        className={`ps-10 bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('confirmPassword')}`}
                      />
                    </div>
                    {touched.confirmPassword && !getFieldValidation('confirmPassword').isValid && (
                      <div ref={el => { errorRefs.current.confirmPassword = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {getFieldValidation('confirmPassword').error}
                      </div>
                    )}
                    {passwordMatchStatus.show && (
                      <div className={`flex items-center gap-1.5 text-xs ${passwordMatchStatus.match ? 'text-green-400' : 'text-red-400'}`}>
                        {passwordMatchStatus.match ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3 h-3 shrink-0" />
                        )}
                        {passwordMatchStatus.match ? t.clientLogin.passwordMatch : t.clientLogin.passwordNoMatch}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Requirements - ALWAYS visible on register tab */}
                {activeTab === 'register' && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{t.clientLogin.passwordRequirements}</p>
                    <div className="grid grid-cols-1 gap-1">
                      {getPasswordRequirements(regPassword, t).map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {req.test ? (
                            <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                          )}
                          <span className={req.test ? 'text-green-400' : 'text-muted-foreground/60'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t.clientLogin.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      onBlur={() => handleTouch('phone')}
                      placeholder={t.clientLogin.phonePlaceholder}
                      className="ps-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50"
                    />
                  </div>
                </div>

                {/* Age, Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">{t.clientLogin.age}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={150}
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      onBlur={() => handleTouch('age')}
                      placeholder={t.clientLogin.agePlaceholder}
                      className={`bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('age')}`}
                    />
                    {touched.age && !getFieldValidation('age').isValid && (
                      <div ref={el => { errorRefs.current.age = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {getFieldValidation('age').error}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">{t.clientLogin.gender}</Label>
                    <Select value={regGender} onValueChange={(v) => { setRegGender(v); handleTouch('gender') }}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder={t.clientLogin.genderPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Weight, Height */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">{t.clientLogin.weight}</Label>
                    <div className="relative">
                      <Ruler className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={1000}
                        value={regWeight}
                        onChange={(e) => setRegWeight(e.target.value)}
                        onBlur={() => handleTouch('weight')}
                        placeholder={t.clientLogin.weightPlaceholder}
                        className={`ps-10 bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('weight')}`}
                      />
                    </div>
                    {touched.weight && !getFieldValidation('weight').isValid && (
                      <div ref={el => { errorRefs.current.weight = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {getFieldValidation('weight').error}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">{t.clientLogin.height}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={500}
                      value={regHeight}
                      onChange={(e) => setRegHeight(e.target.value)}
                      onBlur={() => handleTouch('height')}
                      placeholder={t.clientLogin.heightPlaceholder}
                      className={`bg-white/5 text-white placeholder:text-muted-foreground ${getFieldBorderClass('height')}`}
                    />
                    {touched.height && !getFieldValidation('height').isValid && (
                      <div ref={el => { errorRefs.current.height = el }} className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {getFieldValidation('height').error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t.clientLogin.goal}</Label>
                  <Select value={regGoal} onValueChange={(v) => { setRegGoal(v); handleTouch('goal') }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder={t.clientLogin.goalPlaceholder} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {GOALS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitDisabled}
                  className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.clientLogin.createAccount}
                </Button>

                {/* Disabled message */}
                {submitDisabled && !loading && (
                  <p className="text-xs text-center text-muted-foreground/60">
                    {t.clientLogin.fixErrors}
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>

          {/* Back to Website */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" /> {t.dashboard.backToWebsite}
          </button>
        </div>
      </div>
    </div>
  )
}
