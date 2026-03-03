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
export interface RequestsByDay {
  date: string
  count: number
  errors: number
}

export interface TopKeyEntry {
  keyId: string
  keyType: 'api' | 'service'
  requests: number
}

export interface ProjectStats {
  totalRequests: number
  successRate: number
  rateLimitHits: number
  avgLatencyMs: number
  requestsByDay: RequestsByDay[]
  topKeys: TopKeyEntry[]
}

// API Response
export interface ApiError {
  message: string
  code?: string
}
