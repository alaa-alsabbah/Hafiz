// Admin constants and configurations

export enum AdminRoleLabel {
  STUDENT = 'طالب',
  TEACHER = 'معلم',
  ADMIN = 'مسؤول',
}

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
