import { reactive, ref } from 'vue'

type ValidationRule = (value: string, form?: Record<string, string>) => true | string

interface ValidationRules {
  [key: string]: ValidationRule[]
}

export function useValidation<T extends Record<string, string>>(
  initialState: T,
  rules: ValidationRules
) {
  const form = reactive<T>({ ...initialState })
  const errors = reactive<Record<string, string>>({})
  const isValid = ref(true)

  // Initialize errors object
  Object.keys(initialState).forEach(key => {
    errors[key] = ''
  })

  function validateField(field: string): boolean {
    const value = (form as Record<string, string>)[field]
    const fieldRules = rules[field]
    
    if (!fieldRules) {
      errors[field] = ''
      return true
    }

    for (const rule of fieldRules) {
      const result = rule(value, form as Record<string, string>)
      if (result !== true) {
        errors[field] = result
        return false
      }
    }

    errors[field] = ''
    return true
  }

  function validate(): boolean {
    let valid = true
    
    Object.keys(rules).forEach(field => {
      if (!validateField(field)) {
        valid = false
      }
    })
    
    isValid.value = valid
    return valid
  }

  function reset(): void {
    Object.keys(initialState).forEach(key => {
      (form as Record<string, string>)[key] = initialState[key]
      errors[key] = ''
    })
    isValid.value = true
  }

  function clearErrors(): void {
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
    isValid.value = true
  }

  return {
    form,
    errors,
    isValid,
    validateField,
    validate,
    reset,
    clearErrors
  }
}

// Common validation rules
export const rules = {
  required: (message = 'هذا الحقل مطلوب'): ValidationRule => (value) => {
    return !!value?.trim() || message
  },

  email: (message = 'يرجى إدخال بريد إلكتروني صحيح'): ValidationRule => (value) => {
    if (!value) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || message
  },

  minLength: (min: number, message?: string): ValidationRule => (value) => {
    if (!value) return true
    const msg = message || `يجب أن يكون على الأقل ${min} أحرف`
    return value.length >= min || msg
  },

  maxLength: (max: number, message?: string): ValidationRule => (value) => {
    if (!value) return true
    const msg = message || `يجب أن لا يتجاوز ${max} حرف`
    return value.length <= max || msg
  }
}

