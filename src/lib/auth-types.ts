// Custom authentication types
export interface LoginRequest {
  email: string
  password: string
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status?: string
  isVerified?: boolean
}

export interface AuthResponse {
  success: boolean
  message: string
  code?: string
  data?: {
    user: User
    accessToken: string
    refreshToken: string
    requiresPasswordSetup?: boolean
    newCodeSent?: boolean
    message?: string
  }
  errors?: Array<{
    field: string
    message: string
  }>
  details?: string
}

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
}