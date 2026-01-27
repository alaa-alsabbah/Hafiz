// Error code translations to Arabic
export const ERROR_TRANSLATIONS: Record<string, string> = {
  // Validation error codes
  NAME_UNIQUE_CODE: 'هذا الاسم مسجل مسبقاً. يرجى استخدام اسم آخر',
  EMAIL_UNIQUE_CODE: 'البريد الإلكتروني مسجل مسبقاً. يرجى استخدام بريد آخر أو تسجيل الدخول',
  EMAIL_REGEX_CODE: 'يرجى إدخال بريد إلكتروني صحيح',
  PHONE_UNIQUE_CODE: 'رقم الهاتف مسجل مسبقاً. يرجى استخدام رقم آخر',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'يرجى إدخال بريد إلكتروني صحيح',
  INVALID_PHONE: 'يرجى إدخال رقم هاتف صحيح',
  INVALID_DATE: 'يرجى إدخال تاريخ صحيح',
  PASSWORD_TOO_SHORT: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  PASSWORD_WEAK: 'كلمة المرور ضعيفة. يرجى استخدام كلمة مرور أقوى',
  
  // API error codes
  '400': 'طلب غير صحيح',
  '401': 'غير مصرح لك بالوصول',
  '403': 'غير مسموح لك بهذا الإجراء',
  '404': 'الصفحة غير موجودة',
  '422': 'البيانات المدخلة غير صحيحة',
  '500': 'حدث خطأ في الخادم',
  '4005': 'البيانات المدخلة غير صحيحة',
}

/**
 * Translate error code to user-friendly Arabic message
 * @param errorCode - The error code from API (e.g., "NAME_UNIQUE_CODE", "4005")
 * @param fallback - Optional fallback message if code not found
 * @returns Translated Arabic message
 */
export function translateErrorCode(
  errorCode: string | number | undefined | null,
  fallback: string = 'حدث خطأ غير متوقع'
): string {
  if (!errorCode) return fallback
  
  const code = String(errorCode).trim()
  
  // Check exact match first
  if (ERROR_TRANSLATIONS[code]) {
    return ERROR_TRANSLATIONS[code]
  }
  
  // Check case-insensitive match
  const upperCode = code.toUpperCase()
  if (ERROR_TRANSLATIONS[upperCode]) {
    return ERROR_TRANSLATIONS[upperCode]
  }
  
  // If the code looks like an error code (contains _CODE or is all uppercase), 
  // return a more helpful fallback instead of showing the raw code
  if (code.includes('_CODE') || (code === upperCode && code.length > 3)) {
    return 'حدث خطأ في التحقق من البيانات. يرجى التحقق من الحقول المدخلة'
  }
  
  // Return fallback
  return fallback
}

/**
 * Translate array of error codes to Arabic messages
 * @param errorCodes - Array of error codes
 * @returns Array of translated Arabic messages
 */
export function translateErrorCodes(
  errorCodes: (string | number)[] | undefined | null
): string[] {
  if (!errorCodes || !Array.isArray(errorCodes)) {
    return []
  }
  
  return errorCodes.map(code => translateErrorCode(code))
}
