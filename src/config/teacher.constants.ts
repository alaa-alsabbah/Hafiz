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
