'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Trash2,
  TrendingUp,
  Scale,
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
import { api, type Client as ClientType } from '@/lib/coach-api'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

interface ProgressEntry {
  id: string
  clientId: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  waist?: number
  chest?: number
  arms?: number
  thighs?: number
  notes?: string
  createdAt: string
}

const emptyForm = {
  weight: '',
  bodyFat: '',
  muscleMass: '',
  waist: '',
  chest: '',
  arms: '',
  thighs: '',
  notes: '',
}

export default function ProgressTracker() {
  const { t, dir } = useI18n()
  const [clients, setClients] = useState<ClientType[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getClients()
      setClients((res.clients as ClientType[]).filter((c) => c.status === 'active'))
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const loadProgress = useCallback(async () => {
    if (!selectedClientId) {
      setProgressEntries([])
      return
    }
    try {
      setLoadingProgress(true)
      const res = await api.getProgress(selectedClientId)
      setProgressEntries(
        (res.progress as ProgressEntry[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
    } catch {
      // silently handle
    } finally {
      setLoadingProgress(false)
    }
  }, [selectedClientId])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  const handleSubmit = async () => {
    setError('')
    if (!selectedClientId) {
      setError(t.dashboard.selectClientFirst)
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        clientId: selectedClientId,
        weight: formData.weight ? Number(formData.weight) : undefined,
        bodyFat: formData.bodyFat ? Number(formData.bodyFat) : undefined,
        muscleMass: formData.muscleMass ? Number(formData.muscleMass) : undefined,
        waist: formData.waist ? Number(formData.waist) : undefined,
        chest: formData.chest ? Number(formData.chest) : undefined,
        arms: formData.arms ? Number(formData.arms) : undefined,
        thighs: formData.thighs ? Number(formData.thighs) : undefined,
        notes: formData.notes || undefined,
      }
      await api.addProgress(payload)
      setShowAddDialog(false)
      setFormData(emptyForm)
      loadProgress()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.saveProgressFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProgress(id)
      setDeleteConfirm(null)
      loadProgress()
    } catch {
      // silently handle
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Weight chart data
  const chartData = progressEntries
    .filter((e) => e.weight)
    .slice(0, 20)
    .reverse()

  const weightMin = chartData.length > 0 ? Math.min(...chartData.map((d) => d.weight!)) - 2 : 0
  const weightMax = chartData.length > 0 ? Math.max(...chartData.map((d) => d.weight!)) + 2 : 100

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
          <h2 className="text-2xl font-bold text-white">{t.dashboard.progressTracker}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.dashboard.trackProgress}</p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm)
            setShowAddDialog(true)
          }}
          disabled={!selectedClientId}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 me-2" />
          {t.dashboard.addEntry}
        </Button>
      </div>

      {/* Client Selector */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Label className="text-muted-foreground text-sm whitespace-nowrap">{t.dashboard.selectClientLabel}</Label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-full sm:w-64">
              <SelectValue placeholder={t.dashboard.chooseClient} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedClientId ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Scale className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">{t.dashboard.selectClientTitle}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {t.dashboard.chooseClientProgress}
          </p>
        </div>
      ) : loadingProgress ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Weight Chart */}
          {chartData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{t.dashboard.weightProgress}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  {t.dashboard.weightKgChart}
                </div>
              </div>
              <div className="relative h-48 flex items-end gap-1">
                {chartData.map((entry, i) => {
                  const pct = ((entry.weight! - weightMin) / (weightMax - weightMin)) * 100
                  return (
                    <div key={entry.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-6 start-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10">
                        {entry.weight} kg
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, 5)}%` }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t min-h-[4px]"
                      />
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.createdAt).replace(',', '')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Progress History - Scrollable List */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">{t.dashboard.progressHistory}</h3>
            </div>
            {progressEntries.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t.dashboard.noProgressEntries}</p>
                <p className="text-sm text-muted-foreground/60 mt-1">{t.dashboard.addFirstEntry}</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {progressEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-white">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {entry.weight && <span>{t.dashboard.weightLabel}: {entry.weight} kg</span>}
                        {entry.bodyFat && <span>{t.dashboard.bodyFatLabel}: {entry.bodyFat}%</span>}
                        {entry.muscleMass && <span>{t.dashboard.muscleLabel}: {entry.muscleMass} kg</span>}
                        {entry.waist && <span>{t.dashboard.waistLabel}: {entry.waist} cm</span>}
                        {entry.chest && <span>{t.dashboard.chestLabel}: {entry.chest} cm</span>}
                        {entry.arms && <span>{t.dashboard.armsLabel}: {entry.arms} cm</span>}
                        {entry.thighs && <span>{t.dashboard.thighsLabel}: {entry.thighs} cm</span>}
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground/60 mt-1 truncate">{entry.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 flex-shrink-0 ms-2"
                      onClick={() => setDeleteConfirm(entry.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card border-white/10 max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.addProgressTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.recordMeasurementsFor} {clients.find((c) => c.id === selectedClientId)?.name || t.dashboard.clientFallback}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.weightKgField}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="kg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.bodyFatPercent}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="%"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.muscleMassKg}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="kg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.waistCm}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.chestCm}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.armsCm}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.arms}
                  onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-muted-foreground">{t.dashboard.thighsCm}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.thighs}
                  onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="cm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.additionalNotes}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
                placeholder={t.dashboard.additionalNotes}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="text-muted-foreground">{t.dashboard.cancel}</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? t.dashboard.saving : t.dashboard.addEntry}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.deleteEntryTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.deleteEntryConfirm}
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
