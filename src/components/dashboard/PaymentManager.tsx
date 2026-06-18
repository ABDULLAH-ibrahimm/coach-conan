'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { api, Payment, Client } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'

// ============ Constants ============

const CURRENCIES = [
  { value: 'EGP', symbol: 'E\u00a3', label: 'EGP (E\u00a3) - \u062c.\u0645' },
  { value: 'USD', symbol: '$', label: 'USD ($)' },
  { value: 'EUR', symbol: '\u20ac', label: 'EUR (\u20ac)' },
  { value: 'GBP', symbol: '\u00a3', label: 'GBP (\u00a3)' },
  { value: 'AED', symbol: 'AED', label: 'AED' },
  { value: 'SAR', symbol: 'SAR', label: 'SAR' },
]

const PAYMENT_METHOD_VALUES = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Mobile Payment',
  'Online Transfer',
  'Check',
  'Other',
]

const STATUS_VISUAL: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  paid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  overdue: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  cancelled: { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20' },
}

interface PaymentFormData {
  clientId: string
  amount: string
  currency: string
  description: string
  dueDate: string
  method: string
  notes: string
  status: string
}

const emptyForm: PaymentFormData = {
  clientId: '',
  amount: '',
  currency: 'EGP',
  description: '',
  dueDate: '',
  method: '',
  notes: '',
  status: 'pending',
}

// ============ Helper ============

function getCurrencySymbol(currency: string): string {
  return CURRENCIES.find((c) => c.value === currency)?.symbol || currency
}

// ============ Component ============

export default function PaymentManager() {
  const { t, dir, lang } = useI18n()

  const [payments, setPayments] = useState<Payment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [summary, setSummary] = useState<{
    totalRevenue: number
    thisMonth: number
    pending: number
    overdue: number
    currency: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<PaymentFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // ============ i18n Helpers ============

  const paymentMethodLabels: Record<string, string> = {
    'Cash': t.dashboard.cash,
    'Bank Transfer': t.dashboard.bankTransfer,
    'Credit Card': t.dashboard.creditCard,
    'Debit Card': t.dashboard.debitCard,
    'Mobile Payment': t.dashboard.mobilePayment,
    'Online Transfer': t.dashboard.onlineTransfer,
    'Check': t.dashboard.checkPayment,
    'Other': t.dashboard.otherPayment,
  }

  const statusLabels: Record<string, string> = {
    pending: t.dashboard.pendingLabel,
    paid: t.dashboard.paidLabel,
    overdue: t.dashboard.overdueLabel,
    cancelled: t.dashboard.cancelled,
  }

  const formatCurrency = (amount: number, currency: string) => {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US'
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      const symbol = getCurrencySymbol(currency)
      return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    }
  }

  const formatDate = (date: string) => {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US'
    return new Date(date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ============ Data Loading ============

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [pRes, cRes, sRes] = await Promise.allSettled([
        api.getPayments(),
        api.getClients(),
        api.getPaymentSummary(),
      ])
      if (pRes.status === 'fulfilled') {
        setPayments(
          (pRes.value.payments || []).sort(
            (a: Payment, b: Payment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        )
      }
      if (cRes.status === 'fulfilled') setClients(cRes.value.clients || [])
      if (sRes.status === 'fulfilled') {
        const s = sRes.value.summary || sRes.value
        setSummary({
          totalRevenue: s.totalRevenue ?? s.totalPaid ?? 0,
          thisMonth: s.thisMonth ?? s.thisMonthPaid ?? 0,
          pending: s.pending ?? s.pendingAmount ?? 0,
          overdue: s.overdue ?? s.overdueAmount ?? 0,
          currency: s.currency ?? 'EGP',
        })
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

  // ============ Helpers ============

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || t.dashboard.unknown
  }

  // ============ Filtering ============

  const filteredPayments = payments.filter((p) => {
    if (clientFilter !== 'all' && p.clientId !== clientFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        getClientName(p.clientId).toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q))
      )
    }
    return true
  })

  // ============ Form Handlers ============

  const handleSubmit = async () => {
    setError('')
    if (!formData.clientId || !formData.amount) {
      setError(t.dashboard.clientAmountRequired)
      return
    }
    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t.dashboard.validAmountRequired)
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        clientId: formData.clientId,
        amount: amountNum,
        currency: formData.currency,
        description: formData.description,
        dueDate: formData.dueDate || null,
        method: formData.method || null,
        notes: formData.notes,
      }
      if (editingPayment) {
        payload.status = formData.status
        await api.updatePayment(editingPayment.id, payload)
      } else {
        payload.status = formData.status || 'pending'
        await api.createPayment(payload)
      }
      closeDialog()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.savePaymentFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await api.markPaymentPaid(id)
      loadData()
    } catch {
      // silently handle
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deletePayment(id)
      setDeleteConfirm(null)
      loadData()
    } catch {
      // silently handle
    }
  }

  const openEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setFormData({
      clientId: payment.clientId,
      amount: String(payment.amount),
      currency: payment.currency || 'EGP',
      description: payment.description || '',
      dueDate: payment.dueDate ? payment.dueDate.slice(0, 10) : '',
      method: payment.method || '',
      notes: payment.notes || '',
      status: payment.status || 'pending',
    })
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingPayment(null)
    setFormData(emptyForm)
    setError('')
  }

  // ============ Loading State ============

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" dir={dir}>
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ============ Render ============

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t.dashboard.paymentsTitle}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.dashboard.trackPayments}</p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm)
            setEditingPayment(null)
            setShowAddDialog(true)
          }}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 me-2" />
          {t.dashboard.recordPaymentBtn}
        </Button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.dashboard.totalRevenueLabel}</span>
          </div>
          <p className="text-xl font-bold text-white">
            {summary ? formatCurrency(summary.totalRevenue, summary.currency) : formatCurrency(0, 'EGP')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.dashboard.thisMonthLabel}</span>
          </div>
          <p className="text-xl font-bold text-white">
            {summary ? formatCurrency(summary.thisMonth, summary.currency) : formatCurrency(0, 'EGP')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.dashboard.pendingLabel}</span>
          </div>
          <p className="text-xl font-bold text-white">
            {summary ? formatCurrency(summary.pending, summary.currency) : formatCurrency(0, 'EGP')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.dashboard.overdueLabel}</span>
          </div>
          <p className="text-xl font-bold text-white">
            {summary ? formatCurrency(summary.overdue, summary.currency) : formatCurrency(0, 'EGP')}
          </p>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.dashboard.searchPayments}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={t.dashboard.allStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.dashboard.allStatus}</SelectItem>
              <SelectItem value="pending">{t.dashboard.pendingLabel}</SelectItem>
              <SelectItem value="paid">{t.dashboard.paidLabel}</SelectItem>
              <SelectItem value="overdue">{t.dashboard.overdueLabel}</SelectItem>
              <SelectItem value="cancelled">{t.dashboard.cancelled}</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Payment Cards Grid */}
      {filteredPayments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <DollarSign className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">{t.dashboard.noPayments}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">{t.dashboard.recordFirstPayment}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayments.map((payment, index) => {
            const status = (payment.status || 'pending') as keyof typeof STATUS_VISUAL
            const statusCfg = STATUS_VISUAL[status] || STATUS_VISUAL.pending
            const StatusIcon = statusCfg.icon
            const isPendingOrOverdue = status === 'pending' || status === 'overdue'

            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass rounded-2xl p-6 hover:border-red-600/30 transition-colors group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-400 text-sm font-bold">
                      {getClientName(payment.clientId).split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{getClientName(payment.clientId)}</p>
                      {payment.invoiceNumber && (
                        <p className="text-xs text-muted-foreground">#{payment.invoiceNumber}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${statusCfg.bg} ${statusCfg.color} border text-xs`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusLabels[status] || statusLabels.pending}
                  </Badge>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(payment.amount, payment.currency || 'USD')}
                  </p>
                </div>

                {/* Description */}
                {payment.description && (
                  <div className="flex items-start gap-2 mb-3">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">{payment.description}</p>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5 mb-4">
                  {payment.dueDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t.dashboard.dueLabel}: {formatDate(payment.dueDate)}</span>
                    </div>
                  )}
                  {payment.method && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{paymentMethodLabels[payment.method] || payment.method}</span>
                    </div>
                  )}
                  {payment.paidDate && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t.dashboard.paidLabelDate}: {formatDate(payment.paidDate)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  {isPendingOrOverdue && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkPaid(payment.id)}
                      className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3 me-1" />
                      {t.dashboard.markPaid}
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openEdit(payment)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteConfirm(payment.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent className="bg-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPayment ? t.dashboard.editPaymentTitle : t.dashboard.recordPaymentTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPayment ? t.dashboard.updatePaymentDesc : t.dashboard.recordNewPayment}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pe-1">
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Client */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.clientRequiredPayment} *</Label>
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

            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.amountLabel} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.currencyLabel}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.descriptionLabel}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder={t.dashboard.descriptionLabel}
              />
            </div>

            {/* Due Date & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.dueDateLabel}</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.paymentMethodLabel}</Label>
                <Select
                  value={formData.method || ''}
                  onValueChange={(v) => setFormData({ ...formData, method: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                    <SelectValue placeholder={t.dashboard.selectMethod} />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_VALUES.map((m) => (
                      <SelectItem key={m} value={m}>{paymentMethodLabels[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status (only when editing) */}
            {editingPayment && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.statusLabel}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.dashboard.pendingLabel}</SelectItem>
                    <SelectItem value="paid">{t.dashboard.paidLabel}</SelectItem>
                    <SelectItem value="overdue">{t.dashboard.overdueLabel}</SelectItem>
                    <SelectItem value="cancelled">{t.dashboard.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.additionalNotes.replace('...', '')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
                placeholder={t.dashboard.additionalNotes}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="text-muted-foreground">
              {t.dashboard.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? t.dashboard.saving : editingPayment ? t.dashboard.update : t.dashboard.recordPaymentBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.deletePaymentTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.deletePaymentConfirm}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-muted-foreground">
              {t.dashboard.cancel}
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t.dashboard.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
