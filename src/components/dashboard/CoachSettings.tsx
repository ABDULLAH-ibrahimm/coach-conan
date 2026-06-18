'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  LogOut,
  AlertTriangle,
  Save,
  Loader2,
  Mail,
  CalendarDays,
  Clock,
  Image as ImageIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { api, type Coach } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'

interface CoachSettingsProps {
  coach: Coach | null
  onProfileUpdate?: (coach: Coach) => void
}

export default function CoachSettings({ coach, onProfileUpdate }: CoachSettingsProps) {
  const { t, dir, lang } = useI18n()

  // Password requirements using i18n
  const PASSWORD_REQUIREMENTS = [
    { label: t.dashboard.atLeast8Chars, test: (pw: string) => pw.length >= 8 },
    { label: t.dashboard.oneUppercase, test: (pw: string) => /[A-Z]/.test(pw) },
    { label: t.dashboard.oneLowercase, test: (pw: string) => /[a-z]/.test(pw) },
    { label: t.dashboard.oneNumber, test: (pw: string) => /\d/.test(pw) },
    { label: t.dashboard.oneSpecialChar, test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  ]

  // Profile form state
  const [profileName, setProfileName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Coach data from API (fresh data including lastLoginAt, createdAt)
  const [coachData, setCoachData] = useState<{
    lastLoginAt?: string
    createdAt?: string
  } | null>(null)

  // Initialize profile form from coach prop
  useEffect(() => {
    if (coach) {
      setProfileName(coach.name || '')
      setProfileImage(coach.profileImage || '')
    }
  }, [coach])

  // Fetch fresh coach data (for lastLoginAt, createdAt)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.getMe()
        if (res.coach) {
          setCoachData({
            lastLoginAt: res.coach.lastLoginAt,
            createdAt: res.coach.createdAt,
          })
        }
      } catch {
        // silently handle - we still have the prop data
      }
    }
    fetchMe()
  }, [])

  // Password requirement checks
  const passwordChecks = PASSWORD_REQUIREMENTS.map((req) => ({
    label: req.label,
    met: req.test(newPassword),
  }))

  const allRequirementsMet = passwordChecks.every((c) => c.met)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  // Profile form validation
  const validateProfile = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!profileName.trim()) errors.name = t.dashboard.nameRequired
    if (profileName.trim().length < 2) errors.name = t.dashboard.nameMinLength
    if (profileImage && !/^https?:\/\/.+/.test(profileImage.trim())) {
      errors.profileImage = t.dashboard.invalidUrl
    }
    setProfileErrors(errors)
    return Object.keys(errors).length === 0
  }, [profileName, profileImage, t])

  // Save profile
  const handleSaveProfile = async () => {
    if (!validateProfile()) return

    try {
      setProfileSaving(true)
      const data: { name?: string; profileImage?: string } = {}
      if (profileName.trim() !== coach?.name) data.name = profileName.trim()
      if (profileImage.trim() !== (coach?.profileImage || '')) data.profileImage = profileImage.trim()

      const res = await api.updateProfile(data)
      toast.success(t.dashboard.profileUpdated)
      if (res.coach && onProfileUpdate) {
        onProfileUpdate(res.coach as Coach)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.dashboard.profileUpdateFailed)
    } finally {
      setProfileSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError(t.dashboard.currentPasswordRequired)
      return
    }
    if (!allRequirementsMet) {
      setPasswordError(t.dashboard.passwordNotMeetReqs)
      return
    }
    if (!passwordsMatch) {
      setPasswordError(t.dashboard.newPasswordsNoMatch)
      return
    }

    try {
      setPasswordSaving(true)
      await api.changePassword(currentPassword, newPassword)
      toast.success(t.dashboard.passwordChanged)
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : t.dashboard.passwordChangeFailed
      toast.error(errMsg)
      setPasswordError(errMsg)
    } finally {
      setPasswordSaving(false)
    }
  }

  // Sign out of all devices
  const handleSignOutAll = () => {
    api.clearToken()
    toast.success(t.dashboard.signedOutAllDevices)
    // Reload to reset app state
    window.location.reload()
  }

  // Date locale based on language
  const dateLocale = lang === 'ar' ? 'ar-EG' : 'en-US'

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t.dashboard.notAvailable
    try {
      return new Date(dateStr).toLocaleDateString(dateLocale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return t.dashboard.notAvailable
    try {
      return new Date(dateStr).toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t.dashboard.settingsTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {t.dashboard.manageProfileSecurity}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 text-muted-foreground"
            >
              <User className="w-4 h-4" />
              {t.dashboard.profileTab}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 text-muted-foreground"
            >
              <Shield className="w-4 h-4" />
              {t.dashboard.securityTab}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 border-2 border-red-600/30 mb-4">
                    {coach?.profileImage ? (
                      <AvatarImage src={coach.profileImage} alt={coach.name} />
                    ) : null}
                    <AvatarFallback className="bg-red-600/20 text-red-400 text-2xl font-bold">
                      {coach ? getInitials(coach.name) : 'CC'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-white">{coach?.name || 'Coach'}</h3>
                  <p className="text-sm text-muted-foreground">{coach?.email || ''}</p>

                  <Separator className="bg-white/10 my-4" />

                  <div className="w-full space-y-3 text-start">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs">{t.dashboard.emailInfoLabel}</p>
                        <p className="text-white truncate">{coach?.email || t.dashboard.notAvailable}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs">{t.dashboard.memberSince}</p>
                        <p className="text-white">
                          {formatDate(coachData?.createdAt || coach?.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs">{t.dashboard.lastLogin}</p>
                        <p className="text-white">
                          {formatDateTime(coachData?.lastLoginAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Edit Profile Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass rounded-2xl p-6 lg:col-span-2"
              >
                <h2 className="text-lg font-semibold text-white mb-6">{t.dashboard.editProfile}</h2>

                <div className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-white">
                      {t.dashboard.fullName}
                    </Label>
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="profile-name"
                        value={profileName}
                        onChange={(e) => {
                          setProfileName(e.target.value)
                          if (profileErrors.name) setProfileErrors((prev) => ({ ...prev, name: '' }))
                        }}
                        placeholder={t.dashboard.enterFullName}
                        className="bg-white/5 border-white/10 text-white ps-10 focus-visible:border-red-500/50 focus-visible:ring-red-500/20"
                        aria-invalid={!!profileErrors.name}
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {profileErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Profile Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-image" className="text-white">
                      {t.dashboard.profileImageUrl}
                    </Label>
                    <div className="relative">
                      <ImageIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="profile-image"
                        value={profileImage}
                        onChange={(e) => {
                          setProfileImage(e.target.value)
                          if (profileErrors.profileImage)
                            setProfileErrors((prev) => ({ ...prev, profileImage: '' }))
                        }}
                        placeholder={t.dashboard.profileImagePlaceholder}
                        className="bg-white/5 border-white/10 text-white ps-10 focus-visible:border-red-500/50 focus-visible:ring-red-500/20"
                        aria-invalid={!!profileErrors.profileImage}
                      />
                    </div>
                    {profileErrors.profileImage && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {profileErrors.profileImage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t.dashboard.pasteUrlNote}
                    </p>
                  </div>

                  {/* Image Preview */}
                  {profileImage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                    >
                      <Avatar className="w-12 h-12 border border-red-600/30">
                        <AvatarImage src={profileImage} alt={t.dashboard.imagePreview} />
                        <AvatarFallback className="bg-red-600/20 text-red-400 text-sm">
                          ?
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-white">{t.dashboard.imagePreview}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                          {profileImage}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                    >
                      {profileSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.dashboard.savingChanges}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {t.dashboard.saveChanges}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Change Password Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass rounded-2xl p-6 lg:col-span-2"
              >
                <h2 className="text-lg font-semibold text-white mb-6">{t.dashboard.changePassword}</h2>

                <div className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-white">
                      {t.dashboard.currentPassword}
                    </Label>
                    <div className="relative">
                      <Shield className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value)
                          if (passwordError) setPasswordError('')
                        }}
                        placeholder={t.dashboard.enterCurrentPassword}
                        className="bg-white/5 border-white/10 text-white ps-10 pe-10 focus-visible:border-red-500/50 focus-visible:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        aria-label={showCurrentPassword ? t.dashboard.hidePassword : t.dashboard.showPassword}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-white">
                      {t.dashboard.newPasswordLabel}
                    </Label>
                    <div className="relative">
                      <Shield className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          if (passwordError) setPasswordError('')
                        }}
                        placeholder={t.dashboard.enterNewPassword}
                        className="bg-white/5 border-white/10 text-white ps-10 pe-10 focus-visible:border-red-500/50 focus-visible:ring-red-500/20"
                        aria-invalid={!!passwordError && !allRequirementsMet}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        aria-label={showNewPassword ? t.dashboard.hidePassword : t.dashboard.showPassword}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">
                      {t.dashboard.confirmNewPassword}
                    </Label>
                    <div className="relative">
                      <Shield className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (passwordError) setPasswordError('')
                        }}
                        placeholder={t.dashboard.confirmNewPasswordPlaceholder}
                        className="bg-white/5 border-white/10 text-white ps-10 pe-10 focus-visible:border-red-500/50 focus-visible:ring-red-500/20"
                        aria-invalid={!!passwordError && confirmPassword.length > 0 && !passwordsMatch}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        aria-label={showConfirmPassword ? t.dashboard.hidePassword : t.dashboard.showPassword}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {t.dashboard.passwordsDoNotMatch}
                      </p>
                    )}
                    {confirmPassword.length > 0 && passwordsMatch && (
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {t.dashboard.passwordsMatchLabel}
                      </p>
                    )}
                  </div>

                  {/* Error message */}
                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-600/10 border border-red-600/20"
                    >
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {passwordError}
                      </p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        passwordSaving ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        !allRequirementsMet ||
                        !passwordsMatch
                      }
                      className="bg-red-600 hover:bg-red-700 text-white min-w-[160px]"
                    >
                      {passwordSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.dashboard.savingChanges}
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          {t.dashboard.changePassword}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Password Requirements Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-6"
              >
                {/* Requirements Checklist */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    {t.dashboard.passwordRequirementsLabel}
                  </h3>
                  <ul className="space-y-3">
                    {passwordChecks.map((check) => (
                      <li key={check.label} className="flex items-center gap-2 text-sm">
                        {check.met ? (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className={check.met ? 'text-green-400' : 'text-muted-foreground'}>
                          {check.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {newPassword.length > 0 && allRequirementsMet && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-green-400 mt-4 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      {t.dashboard.allRequirementsMet}
                    </motion.p>
                  )}
                </div>

                {/* Account Lockout Info */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {t.dashboard.accountLockoutPolicy}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t.dashboard.lockoutPolicyDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl p-6 border-2 border-red-600/30 bg-red-600/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{t.dashboard.dangerZone}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t.dashboard.irreversibleActions}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOutAll}
            className="border-red-600/30 text-red-400 hover:bg-red-600/10 hover:text-red-300 hover:border-red-600/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t.dashboard.signOutAllDevices}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
