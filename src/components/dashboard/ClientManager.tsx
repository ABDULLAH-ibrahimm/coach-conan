'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Target,
  ChevronLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Shield,
  KeyRound,
  Camera,
  ImageIcon,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/coach-api'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

interface Client {
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
  approvalStatus?: string
  createdAt: string
  updatedAt: string
}

interface WorkoutPlan {
  id: string
  name: string
  frequency?: string
  duration?: string
  createdAt: string
}

interface NutritionPlan {
  id: string
  name: string
  calories?: number
  createdAt: string
}

interface ProgressEntry {
  id: string
  weight?: number
  bodyFat?: number
  createdAt: string
}

interface SessionItem {
  id: string
  date: string
  duration?: number
  type?: string
  status?: string
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  profileImage: '',
  age: '',
  gender: '',
  weight: '',
  height: '',
  goal: '',
  notes: '',
}

export default function ClientManager() {
  const { t, dir } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sendCredentials, setSendCredentials] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getClients()
      setClients(res.clients as Client[])
    } catch (err) {
      console.error('[ClientManager] Failed to load clients:', err instanceof Error ? err.message : err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const pendingClients = clients.filter((c) => c.approvalStatus === 'pending')

  const filteredClients = clients
    .filter((c) => {
      // Tab filter
      if (activeTab === 'pending' && c.approvalStatus !== 'pending') return false
      // Search filter
      if (search) {
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
        )
      }
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleApprove = async (clientId: string) => {
    setActionLoading(clientId)
    try {
      await api.approveClient(clientId)
      showToast(t.dashboard.clientApproved)
      loadClients()
    } catch (err) {
      showToast(err instanceof Error ? err.message : t.dashboard.approveFailed, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (clientId: string) => {
    setActionLoading(clientId)
    try {
      await api.rejectClient(clientId)
      showToast(t.dashboard.clientRejected)
      loadClients()
    } catch (err) {
      showToast(err instanceof Error ? err.message : t.dashboard.rejectFailed, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!formData.name.trim()) {
      setError(t.dashboard.nameEmailRequired || 'Name is required')
      return
    }
    // Phone or email is required for client portal access
    if (!formData.phone.trim() && !formData.email.trim()) {
      setError(t.dashboard.phoneOrEmailRequired || 'Phone number or email is required')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        profileImage: formData.profileImage || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        goal: formData.goal || undefined,
        notes: formData.notes || undefined,
      }
      if (!editingClient && sendCredentials) {
        payload.sendCredentials = true
      }
      if (editingClient) {
        await api.updateClient(editingClient.id, payload)
        showToast(t.dashboard.clientUpdated)
      } else {
        const res = await api.createClient(payload)
        // Check if credentials were generated
        if (sendCredentials && res.email && res.generatedPassword) {
          setGeneratedCredentials({
            email: res.email as string,
            password: res.generatedPassword as string,
          })
        } else {
          showToast(t.dashboard.clientCreated)
        }
      }
      closeDialog()
      loadClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.saveClientFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteClient(id)
      setDeleteConfirm(null)
      if (selectedClient?.id === id) setSelectedClient(null)
      showToast(t.dashboard.clientDeactivated)
      loadClients()
    } catch {
      showToast(t.dashboard.deactivateFailed, 'error')
    }
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      profileImage: client.profileImage || '',
      age: client.age?.toString() || '',
      gender: client.gender || '',
      weight: client.weight?.toString() || '',
      height: client.height?.toString() || '',
      goal: client.goal || '',
      notes: client.notes || '',
    })
    setShowAddDialog(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB')
      return
    }

    setImageUploading(true)

    // Resize and compress image to reduce base64 size
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_DIM = 400 // max width/height in px
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIM)
          width = MAX_DIM
        } else {
          width = Math.round((width / height) * MAX_DIM)
          height = MAX_DIM
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('Failed to process image')
        setImageUploading(false)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      // Compress as JPEG at 0.7 quality — keeps size well under 5MB
      const base64 = canvas.toDataURL('image/jpeg', 0.7)
      setFormData(prev => ({ ...prev, profileImage: base64 }))
      setImageUploading(false)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setError('Failed to process image')
      setImageUploading(false)
    }
    img.src = url
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingClient(null)
    setFormData(emptyForm)
    setError('')
    setSendCredentials(false)
  }

  const copyCredentials = () => {
    if (generatedCredentials) {
      const text = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`
      navigator.clipboard.writeText(text).then(() => {
        showToast(t.dashboard.copiedToClipboard)
      }).catch(() => {
        showToast(t.dashboard.copyFailed, 'error')
      })
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

  const getApprovalBadge = (client: Client) => {
    const status = client.approvalStatus || 'approved'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Client Detail View
  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onEdit={() => {
          openEdit(selectedClient)
          setSelectedClient(null)
        }}
        onDelete={() => {
          setDeleteConfirm(selectedClient.id)
          setSelectedClient(null)
        }}
      />
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
          <h2 className="text-2xl font-bold text-white">{t.dashboard.clients}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t.dashboard.manageClients}
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm)
            setEditingClient(null)
            setSendCredentials(false)
            setShowAddDialog(true)
          }}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        >
          <UserPlus className="w-4 h-4 me-2" />
          {t.dashboard.addClient}
        </Button>
      </div>

      {/* Tabs: All Clients / Pending Approval */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <TabsList className="bg-white/5">
            <TabsTrigger value="all" className="gap-1.5">
              <Users className="w-4 h-4" />
              {t.dashboard.allClientsTab}
              <span className="ml-1 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                {clients.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              <Clock className="w-4 h-4" />
              {t.dashboard.pendingApprovalTab}
              {pendingClients.length > 0 && (
                <span className="ml-1 text-xs bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                  {pendingClients.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.dashboard.searchClients}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* All Clients Tab */}
        <TabsContent value="all" className="mt-4">
          {filteredClients.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t.dashboard.noClientsFound}</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {t.dashboard.addFirstClient}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass rounded-2xl p-6 cursor-pointer hover:border-red-600/20 transition-all group ${
                    client.approvalStatus === 'pending'
                      ? 'border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-400 font-bold text-sm overflow-hidden">
                      {client.profileImage ? (
                        <img src={client.profileImage} alt={client.name} className="w-full h-full object-cover" />
                      ) : (
                        client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                      )}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => openEdit(client)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => setDeleteConfirm(client.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                    {client.name}
                  </h3>

                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.goal && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="w-3 h-3" />
                        <span className="truncate">{client.goal}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        client.status === 'active'
                          ? 'bg-green-400/10 text-green-400 border-green-400/20'
                          : 'bg-red-400/10 text-red-400 border-red-400/20'
                      }`}
                    >
                      {client.status === 'active' ? t.dashboard.active : t.dashboard.inactive}
                    </Badge>
                    {getApprovalBadge(client)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="mt-4">
          {pendingClients.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t.dashboard.noPendingApprovals}</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {t.dashboard.allRegistrationsReviewed}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 border-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold flex-shrink-0 overflow-hidden">
                        {client.profileImage ? (
                          <img src={client.profileImage} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-white">{client.name}</h3>
                          <Badge variant="outline" className="text-xs bg-amber-400/10 text-amber-400 border-amber-400/20">
                            <Clock className="w-3 h-3 me-1" />
                            {t.dashboard.pendingApprovalLabel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatDate(client.createdAt)}
                        </p>
                        {client.goal && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span>{client.goal}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleApprove(client.id)}
                        disabled={actionLoading === client.id}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                      >
                        {actionLoading === client.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 me-1.5" />
                            {t.dashboard.approveBtn}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(client.id)}
                        disabled={actionLoading === client.id}
                        variant="outline"
                        className="flex-1 sm:flex-none border-red-400/30 text-red-400 hover:bg-red-600/10 hover:text-red-300"
                      >
                        {actionLoading === client.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 me-1.5" />
                            {t.dashboard.rejectBtn}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent className="bg-card border-white/10 max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingClient ? t.dashboard.editClientTitle : t.dashboard.addNewClientTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingClient ? t.dashboard.updateClientInfo : t.dashboard.registerNewClientDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.profileImage || 'Profile Image'}</Label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {formData.profileImage ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10">
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                  {imageUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-muted-foreground hover:text-white"
                      disabled={imageUploading}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>)
                        input.click()
                      }}
                    >
                      {imageUploading ? (t.dashboard.uploading || 'Uploading...') : (t.dashboard.uploadImage || 'Upload Image')}
                    </Button>
                  </label>
                  {formData.profileImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 ms-2"
                      onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                    >
                      {t.dashboard.remove || 'Remove'}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {t.dashboard.maxSize2MB || 'Max 5MB, JPG/PNG (auto-compressed)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.fullNamePlaceholder} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.fullNamePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.emailUpper?.toLowerCase() || 'email'}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.emailPlaceholderDash || 'Email (optional)'}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {t.dashboard.phonePlaceholderDash?.split(' ')[0] || 'Phone'}
                  <span className="text-[10px] text-red-400">({t.dashboard.forPortalAccess || 'for client portal login'})</span>
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.phonePlaceholderDash || 'Phone number'}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.agePlaceholderDash}</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.agePlaceholderDash}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.selectOption}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder={t.dashboard.selectOption} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.dashboard.male}</SelectItem>
                    <SelectItem value="female">{t.dashboard.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.goalPlaceholderDash.split(',')[0].replace('e.g., ', '').split(' ')[0]}</Label>
                <Input
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.goalPlaceholderDash}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.weightKg}</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.weightKg}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t.dashboard.heightCm}</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={t.dashboard.heightCm}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t.dashboard.notesLabel || 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
                placeholder={t.dashboard.notesPlaceholder || 'Additional notes about the client...'}
              />
            </div>

            {/* Portal Access Toggle - Only for new clients */}
            {!editingClient && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.dashboard.createWithPortalAccess}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.dashboard.autoGenCredentials}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={sendCredentials}
                    onCheckedChange={setSendCredentials}
                  />
                </div>
                {sendCredentials && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <div className="flex items-start gap-2 text-xs text-amber-400">
                      <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        {t.dashboard.securePasswordNote}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="text-muted-foreground">
              {t.dashboard.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? t.dashboard.saving : editingClient ? t.dashboard.update : sendCredentials ? t.dashboard.createGenerateCreds : t.dashboard.addClient}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Credentials Dialog */}
      <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-green-400" />
              {t.dashboard.clientPortalCredentials}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.shareCredentials}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-green-600/10 border border-green-600/20 p-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-green-400/80 text-xs font-medium">{t.dashboard.emailUpper}</Label>
                <div className="bg-white/5 rounded-lg px-3 py-2 text-sm text-white font-mono break-all">
                  {generatedCredentials?.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-green-400/80 text-xs font-medium">{t.dashboard.passwordUpper}</Label>
                <div className="bg-white/5 rounded-lg px-3 py-2 text-sm text-white font-mono break-all">
                  {generatedCredentials?.password}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                {t.dashboard.shareSecurely}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={copyCredentials}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Copy className="w-4 h-4 me-2" />
              {t.dashboard.copyCredentials}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setGeneratedCredentials(null)}
              className="text-muted-foreground"
            >
              {t.dashboard.done}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{t.dashboard.deleteClientTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.dashboard.deactivateClientConfirm}
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

// Client Detail Component
function ClientDetail({
  client,
  onBack,
  onEdit,
  onDelete,
}: {
  client: Client
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t, dir } = useI18n()
  const [clientWorkouts, setClientWorkouts] = useState<{ loading: boolean; data: WorkoutPlan[] }>({ loading: true, data: [] })
  const [clientNutrition, setClientNutrition] = useState<{ loading: boolean; data: NutritionPlan[] }>({ loading: true, data: [] })
  const [clientProgress, setClientProgress] = useState<{ loading: boolean; data: ProgressEntry[] }>({ loading: true, data: [] })
  const [clientSessions, setClientSessions] = useState<{ loading: boolean; data: SessionItem[] }>({ loading: true, data: [] })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [w, n, p, s] = await Promise.allSettled([
          api.getWorkouts(client.id),
          api.getNutrition(client.id),
          api.getProgress(client.id),
          api.getSessions(client.id),
        ])
        if (w.status === 'fulfilled') setClientWorkouts({ loading: false, data: (w.value.workouts || w.value.workoutPlans) as WorkoutPlan[] })
        if (n.status === 'fulfilled') setClientNutrition({ loading: false, data: (n.value.nutritionPlans) as NutritionPlan[] })
        if (p.status === 'fulfilled') setClientProgress({ loading: false, data: p.value.progress as ProgressEntry[] })
        if (s.status === 'fulfilled') setClientSessions({ loading: false, data: s.value.sessions as SessionItem[] })
      } catch {
        // silently handle
      }
    }
    loadData()
  }, [client.id])

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

  const getApprovalBadge = () => {
    const status = client.approvalStatus || 'approved'
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

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div className="w-14 h-14 rounded-xl bg-red-600/10 flex items-center justify-center text-red-400 font-bold text-lg overflow-hidden flex-shrink-0">
          {client.profileImage ? (
            <img src={client.profileImage} alt={client.name} className="w-full h-full object-cover" />
          ) : (
            client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white truncate">{client.name}</h2>
          <p className="text-muted-foreground text-sm">{t.dashboard.clientSince} {formatDate(client.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onEdit} className="text-muted-foreground hover:text-white">
            <Edit className="w-4 h-4 me-2" />
            {t.dashboard.edit}
          </Button>
          <Button variant="ghost" onClick={onDelete} className="text-red-400 hover:text-red-300 hover:bg-red-600/10">
            <Trash2 className="w-4 h-4 me-2" />
            {t.dashboard.delete}
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoItem icon={Mail} label={t.dashboard.emailUpper.charAt(0) + t.dashboard.emailUpper.slice(1).toLowerCase()} value={client.email} />
          {client.phone && <InfoItem icon={Phone} label={t.dashboard.phonePlaceholderDash.split(' ')[0]} value={client.phone} />}
          {client.age && <InfoItem icon={UserPlus} label={t.dashboard.agePlaceholderDash} value={`${client.age} ${t.dashboard.ageYears}`} />}
          {client.gender && <InfoItem icon={UserPlus} label={t.dashboard.selectOption} value={client.gender === 'male' ? t.dashboard.male : client.gender === 'female' ? t.dashboard.female : client.gender} />}
          {client.weight && <InfoItem icon={Target} label={t.dashboard.weightKg.replace(' (kg)', '')} value={`${client.weight} kg`} />}
          {client.height && <InfoItem icon={Target} label={t.dashboard.heightCm.replace(' (cm)', '')} value={`${client.height} cm`} />}
          {client.goal && <InfoItem icon={Target} label={t.dashboard.goalPlaceholderDash.split(',')[0].replace('e.g., ', '').split(' ')[0]} value={client.goal} />}
          {client.notes && <div className="col-span-2 sm:col-span-3 lg:col-span-4"><InfoItem icon={Target} label={t.dashboard.notesLabel || 'Notes'} value={client.notes} /></div>}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t.dashboard.statusLabel}:</span>
            <Badge
              variant="outline"
              className={`text-xs ${
                client.status === 'active'
                  ? 'bg-green-400/10 text-green-400 border-green-400/20'
                  : 'bg-red-400/10 text-red-400 border-red-400/20'
              }`}
            >
              {client.status === 'active' ? t.dashboard.active : t.dashboard.inactive}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t.dashboard.approvalLabel}:</span>
            {getApprovalBadge()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workouts">
        <TabsList className="bg-white/5">
          <TabsTrigger value="workouts">{t.dashboard.workouts}</TabsTrigger>
          <TabsTrigger value="nutrition">{t.dashboard.nutrition}</TabsTrigger>
          <TabsTrigger value="progress">{t.dashboard.progress}</TabsTrigger>
          <TabsTrigger value="sessions">{t.dashboard.sessions}</TabsTrigger>
        </TabsList>

        <TabsContent value="workouts">
          <div className="glass rounded-2xl p-6 mt-4">
            {clientWorkouts.loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : clientWorkouts.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.dashboard.noWorkoutPlansYet}</p>
            ) : (
              <div className="space-y-2">
                {clientWorkouts.data.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.frequency || t.dashboard.noFrequencySet}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nutrition">
          <div className="glass rounded-2xl p-6 mt-4">
            {clientNutrition.loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : clientNutrition.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.dashboard.noNutritionPlansYet}</p>
            ) : (
              <div className="space-y-2">
                {clientNutrition.data.map((n) => (
                  <div key={n.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{n.name}</p>
                      <p className="text-xs text-muted-foreground">{n.calories ? `${n.calories} kcal` : t.dashboard.noCaloriesSet}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="glass rounded-2xl p-6 mt-4">
            {clientProgress.loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : clientProgress.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.dashboard.noProgressEntriesYet}</p>
            ) : (
              <div className="space-y-2">
                {clientProgress.data.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {p.weight ? `${p.weight} kg` : '-'}
                        {p.bodyFat ? ` / ${p.bodyFat}% BF` : ''}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="glass rounded-2xl p-6 mt-4">
            {clientSessions.loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : clientSessions.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t.dashboard.noSessionsFoundDetail}</p>
            ) : (
              <div className="space-y-2">
                {clientSessions.data.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{s.type || t.dashboard.trainingFallback}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.date)}
                        {s.duration ? ` - ${s.duration} min` : ''}
                      </p>
                    </div>
                    {s.status && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          s.status === 'completed'
                            ? 'bg-green-400/10 text-green-400 border-green-400/20'
                            : s.status === 'cancelled'
                              ? 'bg-red-400/10 text-red-400 border-red-400/20'
                              : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        }`}
                      >
                        {s.status === 'completed' ? t.dashboard.completed : s.status === 'cancelled' ? t.dashboard.cancelled : s.status === 'scheduled' ? t.dashboard.scheduled : s.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-red-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  )
}
