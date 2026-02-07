import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types'
import { tokenManager } from '@/services/api'
import { loginRequest } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(loadUserFromStorage())
  const token = ref<string | null>(tokenManager.get())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load user from localStorage on initialization
  function loadUserFromStorage(): User | null {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        return JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    }
    return null
  }

  function saveUserToStorage(userData: User | null): void {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // Actions
  async function login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    loading.value = true
    error.value = null
    
    try {
      // Real API call
      const result = await loginRequest(credentials)

      user.value = result.user
      token.value = result.token

      // Persist token and user for all API calls and router guards
      tokenManager.set(result.token)
      if (result.refreshToken) {
        tokenManager.setRefreshToken(result.refreshToken)
      }
      saveUserToStorage(result.user)
      
      if (credentials.rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      return { success: true, user: result.user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول'
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    tokenManager.remove()
    saveUserToStorage(null)
  }

  function clearError(): void {
    error.value = null
  }

  function initializeUser(): void {
    if (token.value && !user.value) {
      const loadedUser = loadUserFromStorage()
      if (loadedUser) {
        user.value = loadedUser
      }
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    login,
    logout,
    clearError,
    initializeUser
  }
})

