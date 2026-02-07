// Admin constants and configurations

export enum AdminRoleLabel {
  STUDENT = 'طالب',
  TEACHER = 'معلم',
  ADMIN = 'مسؤول',
}

// Admin dashboard stat card types
export enum AdminStatCardType {
  WEEKLY_SUBMISSIONS = 'attendance_count',
  ACTIVE_STUDENTS = 'active_count',
  PENDING_INTERVIEWS = 'interview_count',
  TOTAL_REGISTRATIONS = 'registerationCount',
}

// Tag colors for stat cards (shared pattern with teacher)
export const ADMIN_TAG_COLORS = {
  yellow: { background: 'var(--color-stat-yellow)', text: '#F59E0B' },
  red: { background: 'var(--color-stat-pink)', text: '#EF4444' },
  blue: { background: 'var(--color-stat-blue)', text: '#3B82F6' },
  green: { background: 'var(--color-stat-green)', text: '#10B981' },
} as const

// Admin dashboard labels
export const ADMIN_DASHBOARD_LABELS = {
  STATS: {
    WEEKLY_SUBMISSIONS: { LABEL: 'التقديمات الأسبوعية', TAG: 'أسبوعي', TAG_COLOR: ADMIN_TAG_COLORS.yellow },
    ACTIVE_STUDENTS: { LABEL: 'الطلاب النشطون', TAG: 'نشط', TAG_COLOR: ADMIN_TAG_COLORS.blue },
    PENDING_INTERVIEWS: { LABEL: 'المقابلات المعلقة', TAG: 'معلق', TAG_COLOR: ADMIN_TAG_COLORS.red },
    TOTAL_REGISTRATIONS: { LABEL: 'إجمالي التسجيلات', TAG: 'إجمالي', TAG_COLOR: ADMIN_TAG_COLORS.green },
  },
  LAST_ACTIVITY: 'النشاط الأخير',
  TEACHERS_OVERVIEW: 'نظرة عامة على جميع المعلمين',
  MONTHLY_REGISTRATION: 'التسجيل الشهري',
  MEMORIZATION_LEVEL: 'مستوى الحفظ',
  YEAR_FILTER: 'هذا العام',
  STUDENTS: 'الطلاب',
  SLOTS: 'بقع',
  TABLE: {
    TEACHER_NAME: 'اسم المعلم',
    SPECIALIZATION: 'التخصص',
    ASSIGNED: 'المعين',
    CAPACITY: 'السعة',
    AVAILABILITY: 'التوفر',
  },
  HEFAZ_LEVELS: {
    FULL: 'القرآن كاملا، الحمد لله',
    MORE_20: 'أكثر من 20 جزء',
    FROM_10_TO_20: 'من (10 - 20) جزء',
    FROM_5_TO_9: 'من (5-9) أجزاء',
    LESS_5: 'أقل من 5 أجزاء',
  },
} as const

export const ADMIN_LABELS = {
  PAGE_TITLE: 'لوحة التحكم',
  STUDENTS: 'الطلاب',
  STUDENTS_LIST: 'قائمة الطلاب',
  WEEKLY_REPORT: 'التقرير الأسبوعي',
  PRESENTATION_TEST: 'العرض والاختبار',
  PERMISSION: 'الاستئذان',
  EVALUATIONS: 'تقييمات المقابلات',
  TEACHERS: 'المعلمون',
  LOGOUT: 'تسجيل الخروج',
} as const

// Admin menu item types for hierarchical sidemenu
export interface AdminMenuItem {
  label: string
  path: string
  name: string
  icon: string
}

export interface AdminMenuParentItem extends AdminMenuItem {
  children: AdminMenuItem[]
}

export type AdminMenuEntry = AdminMenuItem | AdminMenuParentItem

function isParent(item: AdminMenuEntry): item is AdminMenuParentItem {
  return 'children' in item && Array.isArray((item as AdminMenuParentItem).children)
}

// Admin menu items - structure:
// لوحة التحكم (main)
// الطلاب (parent) -> التقرير الأسبوعي, العرض والاختبار, الاستئذان (sub-items inside)
// تقييمات المقابلات, المعلمين (main links, outside الطلاب)
export const ADMIN_MENU_ITEMS: AdminMenuEntry[] = [
  {
    label: ADMIN_LABELS.PAGE_TITLE,
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    icon: 'grid',
  },
  {
    label: ADMIN_LABELS.STUDENTS,
    path: '#',
    name: 'admin-students-parent',
    icon: 'graduation-cap',
    children: [
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
    ],
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

export { isParent }
