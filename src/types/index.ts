// User types
export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  avatar?: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Form types
export interface FormErrors {
  [key: string]: string
}

// API types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

// Component prop types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type InputSize = 'sm' | 'md' | 'lg'

