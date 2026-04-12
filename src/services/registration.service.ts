// Registration configuration (in-app defaults only — no remote /registration/config API)
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

let registrationConfigCache: RegistrationConfig | null = null

/**
 * Registration screen copy and structure (defaults embedded in the app).
 */
export async function getRegistrationConfig(): Promise<RegistrationConfig> {
  if (registrationConfigCache) {
    return registrationConfigCache
  }
  registrationConfigCache = getDefaultConfig()
  return registrationConfigCache
}

function getDefaultConfig(): RegistrationConfig {
  return {
    student: {
      title: 'نموذج التسجيل',
      subtitle: 'برنامجان نوعيان لحفظ وإتقان القرآن',
      batch_number: '',
      conditions: [],
      programs: [],
      field_hints: {},
      help_text: {
        title: 'هل تحتاج مساعدة في التسجيل؟',
        description: 'إذا واجهت أي صعوبة أثناء التسجيل أو لديك أي استفسار، لا تتردد في التواصل معنا.',
        contact_button_text: 'اتصل بنا',
      },
      journey_text: 'انضم إلى برنامج شامل مصمم خصيصاً لمساعدتك في حفظ وإتقان القرآن الكريم.',
    },
    teacher: {
      step1: {
        title: 'نموذج تسجيل المقرئين',
        subtitle: 'برنامجان نوعيان لحفظ وإتقان القرآن',
      },
      step2: {
        title: 'نموذج التسجيل في المقرئين',
        subtitle: 'برنامجان نوعيان لحفظ وإتقان القرآن',
      },
      field_hints: {},
      help_text: {
        title: 'هل تحتاج مساعدة في التسجيل؟',
        description: 'إذا واجهت أي صعوبة أثناء التسجيل أو لديك أي استفسار، لا تتردد في التواصل معنا.',
        contact_button_text: 'اتصل بنا',
      },
      journey_text: 'انضم إلى برنامج شامل مصمم خصيصاً لمساعدتك في حفظ وإتقان القرآن الكريم.',
    },
    common: {
      success_message: 'تم تسجيل طلبك بنجاح. سنتواصل معك قريباً لتأكيد موعد المقابلة.',
      error_message: 'حدث خطأ أثناء التسجيل',
      confirmation_note:
        'ستتلقى بريدًا إلكترونيًا للتأكيد يحتوي على تفاصيل المقابلة ورابط للانضمام عبر الإنترنت.',
      interview_confirmation_text: 'تم جدولة المقابلة لـ',
    },
  }
}

export function clearRegistrationConfigCache(): void {
  registrationConfigCache = null
}
