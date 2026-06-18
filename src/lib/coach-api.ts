// API client for Coach Conan platform
// Uses /api/coach/ prefix which can be handled by:
// 1. Caddy gateway (with XTransformPort=3003) - preferred for production
// 2. Next.js proxy (/api/coach/[...path]) - fallback for local dev
const API_BASE = '/api/coach'
const API_PORT = '3003'

// ============ Type Definitions ============

export interface Coach {
  id: string
  name: string
  email: string
  profileImage?: string
  createdAt?: string
}

export interface Client {
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
  startDate?: string
  approvalStatus?: string
  createdAt: string
  updatedAt: string
  _count?: {
    workoutPrograms: number
    nutritionPlans: number
    progress: number
    sessions: number
  }
}

export interface Exercise {
  id?: string
  order: number
  name: string
  muscleGroup: string
  sets: number
  reps: number
  weightKg: number
  restSeconds: number
  tempo: string
  notes: string
  isSuperset: boolean
  supersetGroup: number
}

export interface ProgramDay {
  id?: string
  dayNumber: number
  dayName: string
  isRestDay: boolean
  notes: string
  exercises: Exercise[]
}

export interface ProgramWeek {
  id?: string
  weekNumber: number
  name: string
  notes: string
  days: ProgramDay[]
}

export interface WorkoutProgram {
  id: string
  name: string
  clientId: string
  coachId: string
  description: string
  frequency: string
  durationWeeks: number
  status: string
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string }
  weeks: ProgramWeek[]
}

export interface FoodItem {
  id?: string
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fats: number
  notes: string
  order: number
}

export interface Meal {
  id?: string
  mealType: string
  name: string
  time: string
  notes: string
  order: number
  foodItems: FoodItem[]
}

export interface NutritionPlan {
  id: string
  name: string
  clientId: string
  coachId: string
  description: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  waterMl: number
  status: string
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string }
  meals: Meal[]
}

export interface ProgressEntry {
  id: string
  clientId: string
  weight: number
  bodyFat: number
  muscleMass: number
  waist: number
  chest: number
  arms: number
  thighs: number
  hips: number
  notes: string
  recordedAt: string
  createdAt: string
  client?: { id: string; name: string }
}

export interface Session {
  id: string
  clientId: string
  coachId: string
  title: string
  date: string
  duration: number
  type: string
  status: string
  location: string
  notes: string
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string }
}

export interface Payment {
  id: string
  clientId: string
  coachId: string
  amount: number
  currency: string
  status: string
  method: string
  description: string
  dueDate?: string | null
  paidDate?: string | null
  invoiceNumber: string
  notes: string
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string }
}

export interface CreateSessionInput {
  clientId: string
  title?: string
  date: string
  duration?: number
  type?: string
  status?: string
  location?: string
  notes?: string
}

export interface DashboardStats {
  totalClients: number
  activeClients: number
  inactiveClients: number
  sessionsThisWeek: number
  upcomingSessions: (Session & { client?: { id: string; name: string } })[]
  recentActivity: {
    id: string
    action: string
    entity: string
    entityId: string
    details: string
    createdAt: string
  }[]
  revenue: {
    totalPaid: number
    thisMonthPaid: number
    pendingAmount: number
  }
}

// ============ API Client ============

class CoachAPI {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('coach_token')
    }
  }

  private url(path: string): string {
    // Add XTransformPort so Caddy routes directly to port 3003 when available.
    // Falls back to Next.js proxy when Caddy isn't in the path.
    const separator = path.includes('?') ? '&' : '?'
    return `${API_BASE}${path}${separator}XTransformPort=${API_PORT}`
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  private async request(method: string, path: string, body?: unknown, retryCount = 0) {
    const MAX_RETRIES = 2
    const RETRY_DELAY = 1000 // 1 second

    try {
      const res = await fetch(this.url(path), {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      })
      if (res.status === 401 && path !== '/auth/login') {
        this.clearToken()
        throw new Error('Session expired. Please log in again.')
      }
      // Safely parse JSON - handle cases where server returns HTML (e.g., when API is down)
      let data: Record<string, unknown>
      try {
        data = await res.json()
      } catch {
        // If server returned an error status, retry on 5xx errors
        if (res.status >= 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
          return this.request(method, path, body, retryCount + 1)
        }
        if (res.status === 502 || res.status === 503 || !res.ok) {
          throw new Error('Server is unavailable. Please try again later.')
        }
        throw new Error('Unexpected response from server. Please try again.')
      }
      if (!res.ok) {
        const errMsg = (data.error as string) || 'Request failed'
        const details = data.details as Array<{field: string; message: string}> | undefined
        if (details && details.length > 0) {
          const detailMessages = details.map(d => `${d.field}: ${d.message}`).join('\n')
          throw new Error(detailMessages)
        }
        throw new Error(errMsg)
      }
      return data
    } catch (error) {
      // Handle network errors (server down, CORS, etc.) - retry once
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
          return this.request(method, path, body, retryCount + 1)
        }
        throw new Error('Unable to connect to server. Please check your connection.')
      }
      throw error
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') localStorage.setItem('coach_token', token)
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') localStorage.removeItem('coach_token')
  }

  getToken() { return this.token }

  // Auth
  login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, password })
  }
  register(name: string, email: string, password: string) {
    return this.request('POST', '/auth/register', { name, email, password })
  }
  getMe() { return this.request('GET', '/auth/me') }
  changePassword(currentPassword: string, newPassword: string) {
    return this.request('PUT', '/auth/change-password', { currentPassword, newPassword })
  }
  updateProfile(data: { name?: string; profileImage?: string }) {
    return this.request('PUT', '/auth/profile', data)
  }

  // Dashboard
  getStats() { return this.request('GET', '/dashboard/stats') }

  // Clients
  getClients(search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    return this.request('GET', `/clients${q}`)
  }
  getClient(id: string) { return this.request('GET', `/clients/${id}`) }
  createClient(data: Record<string, unknown>) { return this.request('POST', '/clients', data) }
  updateClient(id: string, data: Record<string, unknown>) { return this.request('PUT', `/clients/${id}`, data) }
  deleteClient(id: string) { return this.request('DELETE', `/clients/${id}`) }
  approveClient(id: string) { return this.request('PUT', `/clients/${id}/approve`) }
  rejectClient(id: string) { return this.request('PUT', `/clients/${id}/reject`) }

  // Export clients as CSV
  async exportClientsCSV() {
    const res = await fetch(this.url('/clients/export'), {
      method: 'GET',
      headers: this.headers(),
    })
    if (!res.ok) {
      throw new Error('Failed to export clients')
    }
    return res.blob()
  }

  // Workouts
  getWorkouts(clientId?: string) {
    const q = clientId ? `?clientId=${clientId}` : ''
    return this.request('GET', `/workouts${q}`)
  }
  getWorkout(id: string) { return this.request('GET', `/workouts/${id}`) }
  createWorkout(data: Record<string, unknown>) { return this.request('POST', '/workouts', data) }
  updateWorkout(id: string, data: Record<string, unknown>) { return this.request('PUT', `/workouts/${id}`, data) }
  deleteWorkout(id: string) { return this.request('DELETE', `/workouts/${id}`) }
  duplicateWorkout(id: string) { return this.request('POST', `/workouts/${id}/duplicate`) }

  // Nutrition
  getNutrition(clientId?: string) {
    const q = clientId ? `?clientId=${clientId}` : ''
    return this.request('GET', `/nutrition${q}`)
  }
  getNutritionPlan(id: string) { return this.request('GET', `/nutrition/${id}`) }
  createNutrition(data: Record<string, unknown>) { return this.request('POST', '/nutrition', data) }
  updateNutrition(id: string, data: Record<string, unknown>) { return this.request('PUT', `/nutrition/${id}`, data) }
  deleteNutrition(id: string) { return this.request('DELETE', `/nutrition/${id}`) }

  // Progress
  getProgress(clientId: string) { return this.request('GET', `/progress/client/${clientId}`) }
  getProgressChart(clientId: string) { return this.request('GET', `/progress/client/${clientId}/chart`) }
  addProgress(data: Record<string, unknown>) { return this.request('POST', '/progress', data) }
  updateProgress(id: string, data: Record<string, unknown>) { return this.request('PUT', `/progress/${id}`, data) }
  deleteProgress(id: string) { return this.request('DELETE', `/progress/${id}`) }

  // Sessions
  getSessions(clientId?: string) {
    const q = clientId ? `?clientId=${clientId}` : ''
    return this.request('GET', `/sessions${q}`)
  }
  createSession(data: CreateSessionInput | Record<string, unknown>) { return this.request('POST', '/sessions', data) }
  updateSession(id: string, data: Record<string, unknown>) { return this.request('PUT', `/sessions/${id}`, data) }
  deleteSession(id: string) { return this.request('DELETE', `/sessions/${id}`) }

  // Payments
  getPayments(clientId?: string, status?: string) {
    const params: string[] = []
    if (clientId) params.push(`clientId=${clientId}`)
    if (status) params.push(`status=${status}`)
    const q = params.length ? `?${params.join('&')}` : ''
    return this.request('GET', `/payments${q}`)
  }
  getPaymentSummary() { return this.request('GET', '/payments/summary') }
  createPayment(data: Record<string, unknown>) { return this.request('POST', '/payments', data) }
  updatePayment(id: string, data: Record<string, unknown>) { return this.request('PUT', `/payments/${id}`, data) }
  markPaymentPaid(id: string) { return this.request('PUT', `/payments/${id}/mark-paid`) }
  deletePayment(id: string) { return this.request('DELETE', `/payments/${id}`) }
}

export const api = new CoachAPI()
// Also export as coachApi for compatibility
export const coachApi = api
