// Student constants and configurations

export enum StudentRoleLabel {
  STUDENT = 'طالب',
  TEACHER = 'معلم',
  ADMIN = 'مسؤول',
}

export const STUDENT_LABELS = {
  PAGE_TITLE: 'لوحة التحكم',
  DAILY_TASKS: 'الواجبات اليومية',
  LEVEL_DETAILS: 'تفاصيل المستوى',
  ACTIVITY_LOG: 'سجل الحركات',
  LOGOUT: 'تسجيل الخروج',
  LEADERBOARD: 'لوحة المتصدرين',
  REQUEST_PERMISSION: 'طلب إذن',
} as const

export const STUDENT_MENU_ITEMS = [
  {
    label: STUDENT_LABELS.PAGE_TITLE,
    path: '/student/dashboard',
    name: 'student-dashboard',
    icon: 'grid',
  },
  {
    label: STUDENT_LABELS.DAILY_TASKS,
    path: '/student/daily-tasks',
    name: 'student-daily-tasks',
    icon: 'tasks',
  },
  {
    label: STUDENT_LABELS.LEVEL_DETAILS,
    path: '/student/level-details',
    name: 'student-level-details',
    icon: 'star',
  },
  {
    label: STUDENT_LABELS.ACTIVITY_LOG,
    path: '/student/activity-log',
    name: 'student-activity-log',
    icon: 'log',
  },
] as const
