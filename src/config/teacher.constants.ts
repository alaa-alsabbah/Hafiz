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
