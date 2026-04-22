// Auth API service
import { api } from './api'
import { API_BASE_URL, API_VERSION } from '@/config/api'
import type { User, LoginCredentials } from '@/types'

// Auth API endpoints
export const AUTH_API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
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
  refresh_token?: string
}

// Shape of refresh token response
export interface RefreshTokenResponseData {
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
  refreshToken?: string
}

/** Successful login vs account pending manager approval */
export type LoginRequestOutcome =
  | { type: 'authenticated'; user: User; token: string; refreshToken?: string }
  | { type: 'waiting'; message: string }

function isWaitingLoginPayload(data: unknown): data is { status: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    (data as { status: unknown }).status === 'waiting'
  )
}

/**
 * Call backend login API
 */
export async function loginRequest(
  credentials: LoginCredentials
): Promise<LoginRequestOutcome> {
  const response = await api.post<LoginResponseData | { status: string }>(
    AUTH_API_ENDPOINTS.LOGIN,
    {
      email: credentials.email,
      password: credentials.password,
    }
  )

  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || 'فشل تسجيل الدخول')
  }

  const data = response.data

  if (isWaitingLoginPayload(data)) {
    return {
      type: 'waiting',
      message: response.message || 'حسابك قيد الموافقة من قبل المدير',
    }
  }

  const loginData = data as LoginResponseData
  if (!loginData.access_token) {
    throw new Error(response.message || 'فشل تسجيل الدخول')
  }

  const user: User = {
    id: loginData.id,
    email: loginData.email,
    name: loginData.full_name,
    role: loginData.role,
  }

  return {
    type: 'authenticated',
    user,
    token: loginData.access_token,
    refreshToken: loginData.refresh_token,
  }
}

/**
 * Call refresh token API - uses raw fetch to avoid circular dependency and 401 loops.
 * Supports both: (1) Cookie-based refresh (credentials: 'include'), (2) Body-based refresh_token.
 * Does NOT use api client to avoid intercepting this request.
 */
export async function refreshTokenRequest(): Promise<{
  access_token: string
  user?: RefreshTokenResponseData
}> {
  const url = `${API_BASE_URL}/${API_VERSION}${AUTH_API_ENDPOINTS.REFRESH_TOKEN}`

  // Use refresh_token from storage if login returned it; otherwise rely on cookies
  const refreshToken = typeof localStorage !== 'undefined'
    ? localStorage.getItem('refresh_token')
    : null

  const body = refreshToken
    ? JSON.stringify({ refresh_token: refreshToken })
    : JSON.stringify({})

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include', // Send cookies for cookie-based refresh
    body,
  })

  const data = await response.json()

  if (!response.ok || !data.success || !data.data?.access_token) {
    throw new Error(data.message || 'فشل تجديد الجلسة')
  }

  return {
    access_token: data.data.access_token,
    user: data.data,
  }
}

