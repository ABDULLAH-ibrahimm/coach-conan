'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api, type Client } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

type SortField =
  | 'name'
  | 'email'
  | 'phone'
  | 'age'
  | 'gender'
  | 'weight'
  | 'height'
  | 'goal'
  | 'status'
  | 'approvalStatus'
  | 'startDate'
  | 'createdAt'

type SortDirection = 'asc' | 'desc'

export default function ClientSpreadsheet() {
  const { t, dir, lang } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [approvalFilter, setApprovalFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.getClients()
      setClients(res.clients as Client[])
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.dashboard.failedToLoadClientsError
      console.error('[ClientSpreadsheet] Failed to load clients:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [t.dashboard.failedToLoadClientsError])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Computed stats
  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter((c) => c.status === 'active').length
    const pending = clients.filter((c) => c.approvalStatus === 'pending').length
    const weights = clients.filter((c) => c.weight != null).map((c) => c.weight as number)
    const avgWeight = weights.length > 0 ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : 0
    return { total, active, pending, avgWeight }
  }, [clients])

  // Filter + sort
  const filteredClients = useMemo(() => {
    let result = [...clients]

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    // Approval filter
    if (approvalFilter !== 'all') {
      result = result.filter((c) => (c.approvalStatus || 'approved') === approvalFilter)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''

      let cmp: number
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [clients, search, statusFilter, approvalFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-red-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-red-400" />
    )
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
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

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge variant="outline" className="text-xs bg-green-400/10 text-green-400 border-green-400/20">
          <CheckCircle className="w-3 h-3 me-1" />
          {t.dashboard.active}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-xs bg-red-400/10 text-red-400 border-red-400/20">
        <XCircle className="w-3 h-3 me-1" />
        {t.dashboard.inactive}
      </Badge>
    )
  }

  const getApprovalBadge = (approvalStatus?: string) => {
    const status = approvalStatus || 'approved'
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-xs bg-amber-400/10 text-amber-400 border-amber-400/20">
            <Clock className="w-3 h-3 me-1" />
            {t.dashboard.pendingApprovalLabel}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="text-xs bg-red-400/10 text-red-400 border-red-400/20">
            <XCircle className="w-3 h-3 me-1" />
            {t.dashboard.rejectedLabel}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs bg-green-400/10 text-green-400 border-green-400/20">
            <CheckCircle className="w-3 h-3 me-1" />
            {t.dashboard.approvedLabel}
          </Badge>
        )
    }
  }

  const exportCSV = () => {
    const headers = [
      t.dashboard.numberHeader,
      t.dashboard.fullNameHeader,
      t.dashboard.emailHeader,
      t.dashboard.phoneHeader,
      t.dashboard.ageHeader,
      t.dashboard.genderHeader,
      t.dashboard.weightKgHeader,
      t.dashboard.heightCmHeader,
      t.dashboard.goalHeader,
      t.dashboard.statusHeader,
      t.dashboard.approvalHeader,
      t.dashboard.startDateHeader,
      t.dashboard.registeredHeader,
    ]

    const escapeCSV = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }

    const rows = filteredClients.map((c, i) => [
      String(i + 1),
      escapeCSV(c.name),
      escapeCSV(c.email),
      escapeCSV(c.phone || ''),
      c.age != null ? String(c.age) : '',
      escapeCSV(c.gender || ''),
      c.weight != null ? String(c.weight) : '',
      c.height != null ? String(c.height) : '',
      escapeCSV(c.goal || ''),
      escapeCSV(c.status),
      escapeCSV(c.approvalStatus || 'approved'),
      escapeCSV(formatDate(c.startDate)),
      escapeCSV(formatDate(c.createdAt)),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `coach-conan-clients-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(t.dashboard.csvExported)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96" dir={dir}>
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t.dashboard.failedToLoadClients}</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={loadClients}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t.dashboard.tryAgainBtn}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 end-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success'
                ? 'bg-green-600/20 border-green-600/30 text-green-400'
                : 'bg-red-600/20 border-red-600/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-red-400" />
            {t.dashboard.clientSpreadsheet}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t.dashboard.fullClientDetails}
          </p>
        </div>
        <Button
          onClick={exportCSV}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <Download className="w-4 h-4 me-2" />
          {t.dashboard.exportCSVLabel}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.totalClientsLabel}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.activeClientsLabel}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.pendingApprovalLabel}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.avgWeight > 0 ? `${stats.avgWeight}` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">{t.dashboard.avgWeightKg}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.dashboard.searchByNameEmailPhone}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-[130px]">
              <SelectValue placeholder={t.dashboard.statusFilter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.dashboard.allStatus}</SelectItem>
              <SelectItem value="active">{t.dashboard.active}</SelectItem>
              <SelectItem value="inactive">{t.dashboard.inactive}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-[140px]">
              <SelectValue placeholder={t.dashboard.approvalFilter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.dashboard.allApproval}</SelectItem>
              <SelectItem value="pending">{t.dashboard.pendingApprovalLabel}</SelectItem>
              <SelectItem value="approved">{t.dashboard.approvedLabel}</SelectItem>
              <SelectItem value="rejected">{t.dashboard.rejectedLabel}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row Count */}
      <div className="text-sm text-muted-foreground">
        {dir === 'rtl' ? (
          <>
            عرض <span className="text-white font-medium">{filteredClients.length}</span> من <span className="text-white font-medium">{clients.length}</span> {t.dashboard.showingOfClients}
          </>
        ) : (
          <>
            Showing <span className="text-white font-medium">{filteredClients.length}</span> of <span className="text-white font-medium">{clients.length}</span> {t.dashboard.showingOfClients}
          </>
        )}
      </div>

      {/* Spreadsheet Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-card border-b border-white/10">
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                  {t.dashboard.numberHeader}
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.fullNameHeader}
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.emailHeader}
                    <SortIcon field="email" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.phoneHeader}
                    <SortIcon field="phone" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.ageHeader}
                    <SortIcon field="age" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('gender')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.genderHeader}
                    <SortIcon field="gender" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('weight')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.weightKgHeader}
                    <SortIcon field="weight" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('height')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.heightCmHeader}
                    <SortIcon field="height" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('goal')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.goalHeader}
                    <SortIcon field="goal" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.statusHeader}
                    <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('approvalStatus')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.approvalHeader}
                    <SortIcon field="approvalStatus" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.startDateHeader}
                    <SortIcon field="startDate" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    {t.dashboard.registeredHeader}
                    <SortIcon field="createdAt" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{t.dashboard.noClientsFoundTable}</p>
                    <p className="text-muted-foreground/50 text-xs mt-1">
                      {t.dashboard.adjustSearchFilter}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                      i % 2 === 0 ? 'bg-white/[0.02]' : ''
                    }`}
                    onClick={() => console.log('Navigate to client:', client.id, client.name)}
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{client.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{client.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{client.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                      {client.age ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                      {client.gender || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                      {client.weight ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                      {client.height ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[150px] truncate">
                      {client.goal || '—'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(client.status)}</td>
                    <td className="px-4 py-3">{getApprovalBadge(client.approvalStatus)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(client.startDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(client.createdAt)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
