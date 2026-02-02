// Auth API service
import { api } from './api'
import type { User, LoginCredentials } from '@/types'

// Auth API endpoints
const AUTH_API_ENDPOINTS = {
  LOGIN: '/auth/login',
} as const

// Shape of the user object returned by the backend
interface LoginResponseData {
  id: number
  full_name: string
  email: string
  role: User['role']
  phone_country_code: string | null
  phone_number: string | null
  access_token: string
}

export interface LoginResult {
  user: User
  token: string
}

/**
 * Call backend login API
 */
export async function loginRequest(
  credentials: LoginCredentials
): Promise<LoginResult> {
  const response = await api.post<LoginResponseData>(AUTH_API_ENDPOINTS.LOGIN, {
    email: credentials.email,
    password: credentials.password,
  })

  if (!response.success || !response.data) {
    throw new Error(response.message || 'فشل تسجيل الدخول')
  }

  const data = response.data

  const user: User = {
    id: data.id,
    email: data.email,
    name: data.full_name,
    role: data.role,
  }

  return {
    user,
    token: data.access_token,
  }
}

