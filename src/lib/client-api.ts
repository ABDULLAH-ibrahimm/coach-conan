// API client for Client Portal
const API_BASE = '/api/coach'
const API_PORT = '3003'

// ============ Type Definitions ============

export interface ClientUser {
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
  createdAt: string
  updatedAt: string
}

export interface ClientWorkoutProgram {
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
  weeks: ClientProgramWeek[]
}

export interface ClientExercise {
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

export interface ClientProgramDay {
  id?: string
  dayNumber: number
  dayName: string
  isRestDay: boolean
  notes: string
  exercises: ClientExercise[]
}

export interface ClientProgramWeek {
  id?: string
  weekNumber: number
  name: string
  notes: string
  days: ClientProgramDay[]
}

export interface ClientFoodItem {
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

export interface ClientMeal {
  id?: string
  mealType: string
  name: string
  time: string
  notes: string
  order: number
  foodItems: ClientFoodItem[]
}

export interface ClientNutritionPlan {
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
  meals: ClientMeal[]
}

export interface ClientProgressEntry {
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
}

export interface ClientSession {
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
}

export interface ClientPayment {
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
}

export interface ClientDashboardData {
  client: ClientUser
  activeWorkout?: ClientWorkoutProgram | null
  activeNutrition?: ClientNutritionPlan | null
  latestProgress?: ClientProgressEntry | null
  upcomingSessions: ClientSession[]
  recentPayments: ClientPayment[]
}

// ============ API Client ============

class ClientAPI {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('client_token')
    }
  }

  private url(path: string): string {
    const separator = path.includes('?') ? '&' : '?'
    return `${API_BASE}${path}${separator}XTransformPort=${API_PORT}`
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  private async request(method: string, path: string, body?: unknown) {
    try {
      const res = await fetch(this.url(path), {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      })
      if (res.status === 401) {
        this.clearToken()
        throw new Error('Session expired. Please log in again.')
      }
      let data: Record<string, unknown>
      try {
        data = await res.json()
      } catch {
        if (res.status === 502 || res.status === 503 || !res.ok) {
          throw new Error('Server is unavailable. Please try again later.')
        }
        throw new Error('Unexpected response from server. Please try again.')
      }
      if (!res.ok) {
        const errMsg = (data.error as string) || 'Request failed'
        const details = data.details as Array<{field: string; message: string}> | undefined
        if (details && details.length > 0) {
          const detailMessages = details.map(d => `${d.field}: ${d.message}`).join(', ')
          throw new Error(`${errMsg} - ${detailMessages}`)
        }
        throw new Error(errMsg)
      }
      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.')
      }
      throw error
    }
  }

  // Token management
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') localStorage.setItem('client_token', token)
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') localStorage.removeItem('client_token')
  }

  getToken() {
    return this.token
  }

  // Auth
  register(data: {
    name: string
    email: string
    password: string
    phone?: string
    age?: number
    gender?: string
    weight?: number
    height?: number
    goal?: string
  }) {
    return this.request('POST', '/client-auth/register', data)
  }

  login(email: string, password: string) {
    return this.request('POST', '/client-auth/login', { email, password })
  }

  phoneLogin(phone: string) {
    return this.request('POST', '/client-auth/phone-login', { phone })
  }

  getMe() {
    return this.request('GET', '/client-auth/me')
  }

  // Dashboard
  getDashboard() {
    return this.request('GET', '/client/dashboard')
  }

  // Profile
  updateProfile(data: Record<string, unknown>) {
    return this.request('PUT', '/client/profile', data)
  }

  // Workouts (read-only for client)
  getWorkouts() {
    return this.request('GET', '/client/workouts')
  }

  getWorkout(id: string) {
    return this.request('GET', `/client/workouts/${id}`)
  }

  // Nutrition (read-only for client)
  getNutritionPlans() {
    return this.request('GET', '/client/nutrition')
  }

  getNutritionPlan(id: string) {
    return this.request('GET', `/client/nutrition/${id}`)
  }

  // Progress (client can add entries)
  getProgress() {
    return this.request('GET', '/client/progress')
  }

  addProgress(data: Record<string, unknown>) {
    return this.request('POST', '/client/progress', data)
  }

  // Sessions (read-only for client)
  getSessions() {
    return this.request('GET', '/client/sessions')
  }

  // Payments (read-only for client)
  getPayments() {
    return this.request('GET', '/client/payments')
  }
}

export const clientApi = new ClientAPI()
