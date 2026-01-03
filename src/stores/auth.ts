import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // Actions
  async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser: User = {
        id: 1,
        email: credentials.email,
        name: 'مدير النظام',
        role: 'admin'
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      
      // Persist token
      localStorage.setItem('token', mockToken)
      
      if (credentials.rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      return { success: true }
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
    localStorage.removeItem('token')
  }

  function clearError(): void {
    error.value = null
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
    clearError
  }
})

