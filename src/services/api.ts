// API service with token management and error handling
import { API_BASE_URL, API_VERSION } from '@/config/api'

// API Exception class
export class ApiException extends Error {
  public errors?: Record<string, string[]>
  
  constructor(
    message: string,
    public code?: number,
    validator?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiException'
    // Map validator to errors for easier access
    this.errors = validator
  }
}

// Token management
export const tokenManager = {
  get(): string | null {
    return localStorage.getItem('access_token')
  },
  set(token: string): void {
    localStorage.setItem('access_token', token)
  },
  remove(): void {
    localStorage.removeItem('access_token')
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  code?: number
  data?: T
  error?: {
    message: string
    code?: number
  }
  validator?: Record<string, string[]>
}

/**
 * Make API request with automatic token handling
 */
export async function apiRequest<T = any>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: any
  headers?: Record<string, string>
}): Promise<ApiResponse<T>> {
  const { method, url, data, headers = {} } = options

  // Get token
  const token = tokenManager.get()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Set content type
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${API_VERSION}${url}`, {
      method,
      headers,
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    })

    // Parse response
    const responseData = await response.json()

    // Handle non-2xx responses
    if (!response.ok) {
      throw new ApiException(
        responseData.error?.message || responseData.message || 'حدث خطأ في الطلب',
        responseData.error?.code || response.status,
        responseData.validator
      )
    }

    return responseData
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }
    throw new ApiException(
      error instanceof Error ? error.message : 'حدث خطأ في الاتصال بالخادم',
      500
    )
  }
}

/**
 * POST FormData (for file uploads)
 */
export async function postFormData<T = any>(
  url: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'POST',
    url,
    data: formData,
  })
}
