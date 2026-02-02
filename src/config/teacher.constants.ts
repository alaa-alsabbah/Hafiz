// Teacher constants and configurations

export enum ProgramId {
  HAFIZA = 1,
  FURSAN = 2,
}

export enum StatCardType {
  TOTAL_STUDENTS = 'total_students',
  ACTIVE_STUDENTS = 'active_students',
  HAFIZA_PROGRAM = 'hafiza_program',
  FURSAN_PROGRAM = 'fursan_program',
}

export enum AttendanceStatus {
  PRESENT = 'حاضر',
  ABSENT = 'غائب',
  DELAYED = 'مؤجل',
  PERMISSION = 'مستأذن',
  WAITING = 'انتظار',
}

// Tag colors for stat cards
export const TAG_COLORS = {
  yellow: {
    background: 'var(--color-stat-yellow)',
    text: '#F59E0B',
  },
  red: {
    background: 'var(--color-stat-pink)',
    text: '#EF4444',
  },
  orange: {
    background: 'var(--color-stat-orange)',
    text: '#F97316',
  },
  blue: {
    background: 'var(--color-stat-blue)',
    text: '#3B82F6',
  },
  green: {
    background: 'var(--color-stat-green)',
    text: '#10B981',
  },
}

// Dashboard labels
export const DASHBOARD_LABELS = {
  PAGE_TITLE: 'لوحة التحكم',
  STATS: {
    TOTAL_STUDENTS: {
      LABEL: 'إجمالي الطلاب',
      TAG: 'إجمالي',
      TAG_COLOR: TAG_COLORS.yellow,
    },
    ACTIVE_STUDENTS: {
      LABEL: 'الطلاب النشطين',
      TAG: 'نشط',
      TAG_COLOR: TAG_COLORS.red,
    },
    HAFIZA_PROGRAM: {
      LABEL: 'برنامج حفظة',
      TAG: 'حفظة',
      TAG_COLOR: TAG_COLORS.orange,
    },
    FURSAN_PROGRAM: {
      LABEL: 'برنامج الفرسان',
      TAG: 'فرسان',
      TAG_COLOR: TAG_COLORS.blue,
    },
  },
}

// Weekly report labels
export const WEEKLY_REPORT_LABELS = {
  PAGE_TITLE: 'التقرير الأسبوعي',
  STATS: {
    TOTAL_ATTENDANCE: {
      LABEL: 'الحضور الإجمالي',
      TAG: 'حاضر',
      TAG_COLOR: TAG_COLORS.green,
    },
    TOTAL_ABSENCE: {
      LABEL: 'الغياب الإجمالي',
      TAG: 'غائب',
      TAG_COLOR: TAG_COLORS.red,
    },
    TOTAL_DELAY: {
      LABEL: 'التأخير الإجمالي',
      TAG: 'مؤجل',
      TAG_COLOR: TAG_COLORS.orange,
    },
    TOTAL_PERMISSION: {
      LABEL: 'الاستئذان الإجمالي',
      TAG: 'مستأذن',
      TAG_COLOR: TAG_COLORS.blue,
    },
  },
  TABLE: {
    STUDENT: 'طالب',
    PROGRAM: 'البرنامج',
    SESSION: 'جلسة',
    STATUS: 'الحالة',
    LAST_PAGE: 'آخر صفحة تم تسميعها',
    EVALUATION: 'التقييم',
    DATE: 'تاريخ',
    ACTIONS: 'إجراءات',
  },
}

// Student profile - Attendance log (Weekly Recitation tab)
export const ATTENDANCE_LOG_LABELS = {
  TITLE: 'سجل الحضور',
  ADD_RECORD: 'إضافة سجل',
  EMPTY: 'لا توجد سجلات حضور',
  LOADING: 'جاري التحميل...',
  DATE: 'تاريخ',
  SESSION: 'جلسة',
  STATUS: 'الحالة',
  LAST_PAGE: 'آخر صفحة تم تسميعها',
  EVALUATION: 'التقييم',
  ACTIONS: 'إجراء',
}

// Student profile - Notes tab
export const NOTE_MAX_LENGTH = 4088

export const NOTES_TAB_LABELS = {
  TITLE: 'ملاحظات',
  ADD_NOTE: 'إضافة ملاحظات',
  NORMAL_TEXT: 'نص عادي',
  EMPTY: 'لا توجد ملاحظات',
  LOADING: 'جاري التحميل...',
  PLACEHOLDER: 'أدخل الملاحظة هنا...',
  ERRORS: {
    REQUIRED: 'يرجى إدخال الملاحظة',
    MAX_LENGTH: 'الملاحظة يجب ألا تتجاوز 4088 حرفاً',
  },
  DELETE_CONFIRM: {
    TITLE: 'تأكيد الحذف',
    MESSAGE: 'هل أنت متأكد من حذف هذه الملاحظة؟',
    CANCEL: 'إلغاء',
    DELETE: 'حذف',
  },
}

// Presentation & Test tab
export const PRESENTATION_TEST_TAB_LABELS = {
  TITLE: 'العرض والاختبار',
  ADD_RECORD: 'إضافة سجل',
  TRACK: 'المسار',
  LEVEL: 'المرحلة / المستوى المعروض',
  DATE: 'تاريخ العرض',
  SCORE_PRESENTATION: 'درجة العرض (50/50)',
  SCORE_TEST: 'درجة الاختبار (50/50)',
  ACTIONS: 'إجراء',
  EMPTY: 'لا توجد سجلات عرض واختبار',
  LOADING: 'جاري التحميل...',
  DELETE_CONFIRM: {
    TITLE: 'تأكيد الحذف',
    MESSAGE: 'هل أنت متأكد من حذف سجل العرض والاختبار؟',
    CANCEL: 'إلغاء',
    DELETE: 'حذف',
  },
}

// Add Presentation Test Dialog
export const ADD_PRESENTATION_TEST_LABELS = {
  TITLE: 'إضافة سجل عرض واختبار',
  SCORE_PRESENTATION: 'درجة العرض (50/50)',
  SCORE_TEST: 'درجة الاختبار (50/50)',
  PLACEHOLDERS: {
    SCORE_PRESENTATION: '0 - 50',
    SCORE_TEST: '0 - 50',
  },
  SUBMIT: 'حفظ',
  CANCEL: 'إلغاء',
  SUBMITTING: 'جاري الحفظ...',
  ERRORS: {
    SCORE_PRESENTATION_REQUIRED: 'يرجى إدخال درجة العرض',
    SCORE_TEST_REQUIRED: 'يرجى إدخال درجة الاختبار',
    SCORE_RANGE: 'الدرجة يجب أن تكون بين 0 و 50',
  },
}

// Program track badge colors (الذهبي=golden, الفضي=silver, etc.)
export const TRACK_BADGE_COLORS: Record<string, { background: string; text: string }> = {
  ذهبي: { background: '#FFFBEB', text: '#F59E0B' },
  الذهبي: { background: '#FFFBEB', text: '#F59E0B' },
  فضي: { background: '#EFF6FF', text: '#3B82F6' },
  الفضي: { background: '#EFF6FF', text: '#3B82F6' },
  إتقان: { background: '#ECFDF5', text: '#10B981' },
  حفظ: { background: '#F3E8FF', text: '#8B5CF6' },
}

// Add Attendance Dialog
export const ADD_ATTENDANCE_LABELS = {
  TITLE: 'إضافة سجل حضور',
  DATE: 'التاريخ',
  SESSION: 'الجلسة',
  STATUS: 'الحالة',
  PAGE_NUMBER: 'آخر صفحة تم تسميعها',
  SCORE: 'التقييم',
  SESSION_OPTIONS: {
    WEEKLY: 'تسميع أسبوعي',
    PRESENTATION_TEST: 'عرض واختبار',
  },
  PLACEHOLDERS: {
    DATE: 'حدد التاريخ',
    SESSION: 'اختر نوع الجلسة',
    STATUS: 'اختر الحالة',
    PAGE_NUMBER: 'أدخل رقم الصفحة',
    SCORE: 'أدخل التقييم (0-5)',
  },
  SUBMIT: 'حفظ',
  CANCEL: 'إلغاء',
  SUBMITTING: 'جاري الحفظ...',
  ERRORS: {
    DATE_REQUIRED: 'يرجى تحديد التاريخ',
    SESSION_REQUIRED: 'يرجى اختيار نوع الجلسة',
    STATUS_REQUIRED: 'يرجى اختيار الحالة',
    SCORE_RANGE: 'التقييم يجب أن يكون بين 0 و 5',
  },
}

// Attendance status configuration
export const ATTENDANCE_STATUS_CONFIG = {
  [AttendanceStatus.PRESENT]: {
    label: 'حاضر',
    color: TAG_COLORS.green,
  },
  [AttendanceStatus.ABSENT]: {
    label: 'غائب',
    color: TAG_COLORS.red,
  },
  [AttendanceStatus.DELAYED]: {
    label: 'مؤجل',
    color: TAG_COLORS.orange,
  },
  [AttendanceStatus.PERMISSION]: {
    label: 'مستأذن',
    color: TAG_COLORS.blue,
  },
  [AttendanceStatus.WAITING]: {
    label: 'انتظار',
    color: TAG_COLORS.yellow,
  },
}

export enum TeacherRoleLabel {
  STUDENT = 'طالب',
  TEACHER = 'معلم',
  ADMIN = 'مسؤول',
}

export const TEACHER_LABELS = {
  LOGOUT: 'تسجيل الخروج',
  STUDENTS: 'الطلاب',
  PRESENTATION_TEST: 'العرض والاختبار',
  PERMISSION: 'الاستئذان',
  EVALUATIONS: 'تقييمات المقابلات',
  TEACHERS: 'المعلمين',
} as const

// Teacher menu items - only الطلاب for teacher role (links to dashboard)
export const TEACHER_MENU_ITEMS = [
  {
    label: TEACHER_LABELS.STUDENTS,
    path: '/teacher/dashboard',
    name: 'teacher-dashboard',
    icon: 'hat-sidemenu',
  },
] as const

// Student management page labels
export const STUDENT_MANAGEMENT_LABELS = {
  PAGE_TITLE: 'إدارة الطلاب',
  SECTION_TITLE: 'نظرة عامة على جميع الطلاب',
  PROGRAM_FILTER_ALL: 'الكل',
  PROGRAM_FILTER_HAFIZ: 'برنامج حفظة',
  PROGRAM_FILTER_FURSAN: 'برنامج فرسان',
  EXPORT: 'تصدير',
  SEARCH_PLACEHOLDER: 'ابحث بالاسم أو البريد الإلكتروني...',
  STATUS_ALL: 'جميع الحالات',
  STUDENT_SELECT_PLACEHOLDER: 'اختر طالباً محدداً',
  TABLE: {
    STUDENT: 'طالب',
    PROGRAM: 'البرنامج',
    TRACK: 'المسار',
    STATUS: 'حالة',
    RATING: 'تقييم',
    ACTIONS: 'إجراءات',
  },
  ACTIONS: {
    VIEW_STUDENT: 'عرض الطالب',
    SEND_EMAIL: 'إرسال بريد إلكتروني',
    SEND_WHATSAPP: 'إرسال واتساب',
  },
  PAGINATION: {
    SHOW: 'عرض',
    OF: 'من',
  },
} as const

// Student profile drawer labels (Overview tab)
export const STUDENT_PROFILE_LABELS = {
  TABS: {
    OVERVIEW: 'نظرة عامة',
    WEEKLY_RECITATION: 'التسميع الأسبوعي',
    NOTES: 'ملاحظات',
    PRESENTATION_TEST: 'العرض والاختبار',
  },
  ACTIONS: {
    SEND_WHATSAPP: 'إرسال واتساب',
    SEND_EMAIL: 'إرسال بريد إلكتروني',
    EXPORT: 'تصدير',
    COPY: 'نسخة',
  },
  OVERVIEW: {
    TITLE: 'نظرة عامة',
    COUNTRY: 'بلد الإقامة',
    EDUCATION_LEVEL: 'المستوى التعليمي',
    HOW_DID_YOU_KNOW: 'كيف سمعت عن البرنامج',
    EMAIL: 'البريد الإلكتروني',
    QURAN_LEVEL: 'كم جزء من كتاب الله تحفظ؟',
    WATCHED_VIDEO: 'شاهدت الفيديو التقديمي للبرنامجين',
    INTERVIEW_TIME: 'الوقت المناسب للمقابلة',
    CURRENT_LEVEL: 'المستوى الحالي',
    TEACHER: 'المعلم المعين',
    GENDER: 'الجنس',
    AGE: 'العمر',
    PROFESSION: 'المهنة',
    PHONE: 'رقم الهاتف على واتساب',
    RESIDENCE: 'مكان الإقامة',
    HAS_IJAZA: 'رخصة أو شهادة في القرآن الكريم',
    PROGRAM_TRACK: 'أي مسار تود المشاركة فيه؟',
    PROGRAM: 'البرنامج',
    START_DATE: 'تاريخ البدء',
  },
  STATUS_ACTIVE: 'نشط',
  EMPTY: '---',
} as const

// Status badge colors for student table
export const STUDENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  نشط: { bg: 'rgba(232, 245, 233, 1)', text: '#1b5e20' },
  مكتمل: { bg: 'rgba(232, 245, 233, 1)', text: '#1b5e20' },
  'عرض واختبار': { bg: 'rgba(255, 243, 224, 1)', text: '#e65100' },
  انسحب: { bg: 'rgba(255, 235, 238, 1)', text: '#c62828' },
  معلق: { bg: 'rgba(255, 248, 225, 1)', text: '#f57f17' },
  'غير معين': { bg: 'rgba(227, 242, 253, 1)', text: '#1565c0' },
}
