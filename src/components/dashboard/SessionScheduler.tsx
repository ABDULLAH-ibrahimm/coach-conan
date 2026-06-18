'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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
import { api, type Client, type Session } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'

const emptySession = {
  clientId: '',
  date: '',
  duration: 60,
  type: '',
  notes: '',
  status: 'scheduled',
}

// Internal values stored in the database — must remain English for API compatibility
const SESSION_TYPE_VALUES = [
  'Personal Training',
  'Online Coaching',
  'Group Training',
  'Assessment',
  'Consultation',
  'Follow-up',
] as const

export default function SessionScheduler() {
  const { t, dir, lang } = useI18n()

  const [sessions, setSessions] = useState<Session[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptySession)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Locale for date/time formatting
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US'

  // Session type value → translated label mapping
  const sessionTypeMap: Record<string, string> = {
    'Personal Training': t.dashboard.personalTrainingSession,
    'Online Coaching': t.dashboard.onlineCoachingSession,
    'Group Training': t.dashboard.groupTraining,
    'Assessment': t.dashboard.assessment,
    'Consultation': t.dashboard.consultation,
    'Follow-up': t.dashboard.followUp,
  }

  const getSessionTypeLabel = (type: string) => sessionTypeMap[type] || type

  // Status config with translated labels
  const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    scheduled: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', label: t.dashboard.scheduledLabel },
    completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: t.dashboard.completedLabel },
    cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: t.dashboard.cancelledLabel },
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [sRes, cRes] = await Promise.allSettled([
        api.getSessions(),
        api.getClients(),
      ])
      if (sRes.status === 'fulfilled') {
        const sessionData = sRes.value.sessions as Session[]
        setSessions(
          sessionData.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        )
      }
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

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || t.dashboard.unknown
  }

  const filteredSessions = sessions.filter((s) => {
    if (clientFilter !== 'all' && s.clientId !== clientFilter) return false
    if (statusFilter !== 'all' && (s.status || 'scheduled') !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        getClientName(s.clientId).toLowerCase().includes(q) ||
        (s.type && s.type.toLowerCase().includes(q))
      )
    }
    return true
  })

  // Group sessions by date for calendar-like view
  const groupedSessions: Record<string, Session[]> = {}
  filteredSessions.forEach((s) => {
    const dateKey = new Date(s.date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groupedSessions[dateKey]) groupedSessions[dateKey] = []
    groupedSessions[dateKey].push(s)
  })

  const handleSubmit = async () => {
    setError('')
    if (!formData.clientId || !formData.date) {
      setError(t.dashboard.clientDateRequired)
      return
    }
    setSubmitting(true)
    try {
      if (editingSession) {
        await api.updateSession(editingSession.id, formData)
      } else {
        await api.createSession(formData)
      }
      closeDialog()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.saveSessionFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSession(id)
      setDeleteConfirm(null)
      loadData()
    } catch {
      // silently handle
    }
  }

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        await api.updateSession(sessionId, {
          status: newStatus,
        })
        loadData()
      }
    } catch {
      // silently handle
    }
  }

  const openEdit = (session: Session) => {
    setEditingSession(session)
    const dateStr = new Date(session.date).toISOString().slice(0, 16)
    setFormData({
      clientId: session.clientId,
      date: dateStr,
      duration: session.duration || 60,
      type: session.type || '',
      notes: session.notes || '',
      status: session.status || 'scheduled',
    })
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingSession(null)
    setFormData(emptySession)
    setError('')
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t.dashboard.sessionsTitle}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.dashboard.manageSessions}</p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptySession)
            setEditingSession(null)
            setShowAddDialog(true)
          }}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 me-2" />
          {t.dashboard.scheduleSessionBtn}
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.dashboard.searchSessions}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
            />
          </div>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={t.dashboard.filterByClient} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.dashboard.allClients}</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={t.dashboard.statusLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.dashboard.allStatus}</SelectItem>
              <SelectItem value="scheduled">{t.dashboard.scheduledLabel}</SelectItem>
              <SelectItem value="completed">{t.dashboard.completedLabel}</SelectItem>
              <SelectItem value="cancelled">{t.dashboard.cancelledLabel}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upcoming Sessions Summary */}
      {sessions.filter((s) => isUpcoming(s.date) && (s.status === 'scheduled' || !s.status)).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-400" />
            {t.dashboard.upcomingSessionsTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions
              .filter((s) => isUpcoming(s.date) && (s.status === 'scheduled' || !s.status))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 6)
              .map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-600/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white" onClick={() => openEdit(session)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-green-400" onClick={() => handleStatusChange(session.id, 'completed')}>
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white">{session.client?.name || getClientName(session.clientId)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(session.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    {' · '}
                    {formatTime(session.date)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {session.type && <span className="text-xs text-red-400">{getSessionTypeLabel(session.type)}</span>}
                    {session.duration && <span className="text-xs text-muted-foreground">{session.duration} min</span>}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* All Sessions - Grouped by Date */}
      {Object.keys(groupedSessions).length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">{t.dashboard.noSessionsTitle}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">{t.dashboard.scheduleFirstSession}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSessions).map(([dateStr, daySessions]) => (
            <div key={dateStr} className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {dateStr}
              </h3>
              <div className="space-y-2">
                {daySessions.map((session) => {
                  const status = (session.status || 'scheduled') as keyof typeof STATUS_CONFIG
                  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled
                  const StatusIcon = statusCfg.icon
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-400 text-xs font-bold">
                          {(session.client?.name || getClientName(session.clientId)).split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {session.client?.name || getClientName(session.clientId)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTime(session.date)}</span>
                            {session.duration && <span>· {session.duration} min</span>}
                            {session.type && <span>· {getSessionTypeLabel(session.type)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={session.status || 'scheduled'}
                          onValueChange={(v) => handleStatusChange(session.id, v)}
                        >
                          <SelectTrigger className={`h-7 text-xs ${statusCfg.bg} ${statusCfg.color} border-0 w-28`}>
                            <StatusIcon className="w-3 h-3 me-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">
                              <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-400" /> {t.dashboard.scheduledLabel}</span>
                            </SelectItem>
                            <SelectItem value="completed">
                              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> {t.dashboard.completedLabel}</span>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> {t.dashboard.cancelledLabel}</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => openEdit(session)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => setDeleteConfirm(session.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent className="bg-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSession ? t.dashboard.editSessionTitle : t.dashboard.scheduleSessionTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingSession ? t.dashboard.updateSessionDesc : t.dashboard.bookSessionDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.clientRequiredSession} *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(v) => setFormData({ ...formData, clientId: v })}
              >
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.dateTimeRequired} *</Label>
                <Input
                  type="datetime-local"
                  value={formData.date ? formData.date.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.durationMin}</Label>
                <Input
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) || undefined })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.typeLabel}</Label>
                <Select value={formData.type || ''} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                    <SelectValue placeholder={t.dashboard.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPE_VALUES.map((typeVal) => (
                      <SelectItem key={typeVal} value={typeVal}>{getSessionTypeLabel(typeVal)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingSession && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t.dashboard.statusLabel}</Label>
                  <Select value={formData.status || 'scheduled'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">{t.dashboard.scheduledLabel}</SelectItem>
                      <SelectItem value="completed">{t.dashboard.completedLabel}</SelectItem>
                      <SelectItem value="cancelled">{t.dashboard.cancelledLabel}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.sessionNotes.replace(/\.\.\.+$/, '')}</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
                placeholder={t.dashboard.sessionNotes}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="text-muted-foreground">{t.dashboard.cancel}</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? t.dashboard.saving : editingSession ? t.dashboard.update : t.dashboard.scheduleBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.deleteSessionTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.deleteSessionConfirm}
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
