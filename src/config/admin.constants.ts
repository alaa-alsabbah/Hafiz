// Admin constants and configurations

export enum AdminRoleLabel {
  STUDENT = 'طالب',
  TEACHER = 'معلم',
  ADMIN = 'مسؤول',
}

export const ADMIN_LABELS = {
  PAGE_TITLE: 'لوحة التحكم',
  STUDENTS: 'الطلاب',
  WEEKLY_REPORT: 'التقرير الأسبوعي',
  PRESENTATION_TEST: 'العرض والاختبار',
  PERMISSION: 'الاستئذان',
  EVALUATIONS: 'تقييمات المقابلات',
  TEACHERS: 'المعلمين',
  LOGOUT: 'تسجيل الخروج',
} as const

// Admin menu items
export const ADMIN_MENU_ITEMS = [
  {
    label: ADMIN_LABELS.PAGE_TITLE,
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    icon: 'grid',
  },
  {
    label: ADMIN_LABELS.STUDENTS,
    path: '/admin/students',
    name: 'admin-students',
    icon: 'user',
  },
  {
    label: ADMIN_LABELS.WEEKLY_REPORT,
    path: '/admin/weekly-report',
    name: 'admin-weekly-report',
    icon: 'calendar',
  },
  {
    label: ADMIN_LABELS.PRESENTATION_TEST,
    path: '/admin/presentation-test',
    name: 'admin-presentation-test',
    icon: 'graduation-cap',
  },
  {
    label: ADMIN_LABELS.PERMISSION,
    path: '/admin/permission',
    name: 'admin-permission',
    icon: 'calendar',
  },
  {
    label: ADMIN_LABELS.EVALUATIONS,
    path: '/admin/evaluations',
    name: 'admin-evaluations',
    icon: 'calendar',
  },
  {
    label: ADMIN_LABELS.TEACHERS,
    path: '/admin/teachers',
    name: 'admin-teachers',
    icon: 'user',
  },
]
