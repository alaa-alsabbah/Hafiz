// Registration configuration API service
import type { ApiResponse } from './api'

// Registration configuration interface
export interface RegistrationConfig {
  // Student registration config
  student?: {
    title?: string
    subtitle?: string
    batch_number?: string
    conditions?: string[]
    programs?: {
      id: number
      key: string
      name_ar: string
      name_en: string
      video_url?: string
      description?: string
    }[]
    field_hints?: Record<string, string>
    help_text?: {
      title?: string
      description?: string
      contact_button_text?: string
    }
    journey_text?: string
  }
  
  // Teacher registration config
  teacher?: {
    step1?: {
      title?: string
      subtitle?: string
    }
    step2?: {
      title?: string
      subtitle?: string
    }
    field_hints?: Record<string, string>
    help_text?: {
      title?: string
      description?: string
      contact_button_text?: string
    }
    journey_text?: string
  }
  
  // Common config
  common?: {
    success_message?: string
    error_message?: string
    confirmation_note?: string
    interview_confirmation_text?: string
  }
}

// Cache for registration config
let registrationConfigCache: RegistrationConfig | null = null

/**
 * Fetch registration configuration from API
 */
export async function getRegistrationConfig(): Promise<RegistrationConfig> {
  // Return cached config if available
  if (registrationConfigCache) {
    return registrationConfigCache
  }

  try {
    const { API_BASE_URL } = await import('@/config/api')
    const { tokenManager } = await import('./api')
    const token = tokenManager.get()
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Call: http://34.247.136.158/api/registration/config (no v1)
    // Try different possible endpoints
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/registration/config`, {
        method: 'GET',
        headers,
      })
    } catch {
      // Fallback: try with version
      response = await fetch(`${API_BASE_URL}/v1/registration/config`, {
        method: 'GET',
        headers,
      })
    }
    
    const responseData: ApiResponse<RegistrationConfig> = await response.json()
    
    if (!response.ok || !responseData.success || !responseData.data) {
      // Return default config if API fails
      return getDefaultConfig()
    }
    
    // Cache the result
    registrationConfigCache = responseData.data
    return responseData.data
  } catch (error) {
    console.error('Error fetching registration config:', error)
    // Return default config on error
    return getDefaultConfig()
  }
}

/**
 * Get default configuration (fallback)
 */
function getDefaultConfig(): RegistrationConfig {
  return {
    student: {
      title: 'نموذج التسجيل',
      subtitle: 'برنامجان نوعيان لحفظ وإتقان القرآن',
      batch_number: '',
      conditions: [], // Will be loaded from API
      programs: [],
      field_hints: {},
      help_text: {
        title: 'هل تحتاج مساعدة في التسجيل؟',
        description: 'إذا واجهت أي صعوبة أثناء التسجيل أو لديك أي استفسار، لا تتردد في التواصل معنا.',
        contact_button_text: 'اتصل بنا'
      },
      journey_text: 'انضم إلى برنامج شامل مصمم خصيصاً لمساعدتك في حفظ وإتقان القرآن الكريم.'
    },
    teacher: {
      step1: {
        title: 'نموذج تسجيل المقرئين',
        subtitle: 'برنامجان نوعيان لحفظ وإتقان القرآن'
      },
      step2: {
        title: 'نموذج التسجيل في المقرئين',
        subtitle: 'برنامجان نوعيان لحفظ وإتقان القرآن'
      },
      field_hints: {},
      help_text: {
        title: 'هل تحتاج مساعدة في التسجيل؟',
        description: 'إذا واجهت أي صعوبة أثناء التسجيل أو لديك أي استفسار، لا تتردد في التواصل معنا.',
        contact_button_text: 'اتصل بنا'
      },
      journey_text: 'انضم إلى برنامج شامل مصمم خصيصاً لمساعدتك في حفظ وإتقان القرآن الكريم.'
    },
    common: {
      success_message: 'تم تسجيل طلبك بنجاح. سنتواصل معك قريباً لتأكيد موعد المقابلة.',
      error_message: 'حدث خطأ أثناء التسجيل',
      confirmation_note: 'ستتلقى بريدًا إلكترونيًا للتأكيد يحتوي على تفاصيل المقابلة ورابط للانضمام عبر الإنترنت.',
      interview_confirmation_text: 'تم جدولة المقابلة لـ'
    }
  }
}

/**
 * Clear registration config cache
 */
export function clearRegistrationConfigCache(): void {
  registrationConfigCache = null
}
