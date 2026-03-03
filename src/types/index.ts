// Auth
export interface User {
  id: string
  email: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
}

// Projects
export interface Project {
  id: string
  name: string
  createdAt: string
  userId: string
}

// API Keys
export interface ApiKey {
  id: string
  projectId: string
  label: string
  publicPart: string
  revoked: boolean
  createdAt: string
  key?: string // only present at creation
}

// Services
export interface Service {
  id: string
  projectId: string
  name: string
  publicPart: string
  revokedAt: string | null
  createdAt: string
  key?: string // only present at creation
}

// Stats
export interface DailyStats {
  date: string
  success: number
  error: number
}

export interface TopKey {
  keyId: string
  label: string
  count: number
}

export interface TopService {
  serviceId: string
  name: string
  count: number
}

export interface ProjectStats {
  totalRequests: number
  successRate: number
  rateLimitHits: number
  avgLatencyMs: number
  daily: DailyStats[]
  topKeys: TopKey[]
  topServices: TopService[]
}

// API Response
export interface ApiError {
  message: string
  code?: string
}
