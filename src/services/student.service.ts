// Student API service
import { apiRequest } from './api'
import type { ApiResponse } from './api'

// Student API endpoints
const STUDENT_API_ENDPOINTS = {
  DASHBOARD: '/student/dashboard',
  DAILY_TASKS: '/student/daily-tasks',
  LEVEL_DETAILS: '/student/level-details',
  ACTIVITY_LOG: '/student/activity-log',
  CALENDAR: '/student/calendar',
}

// Student types
export interface StudentDashboard {
  id: number
  full_name: string
  email: string
  program: string
  program_track: string
  level: string
  count_leaves: number
  tasks: Array<{
    id: number
    student_id: number
    from_to: string
    listening: string
    repetition: string
    link: string
    review: string
    due_date: string
    created_at: string
    completed: boolean
  }>
}

export interface DailyTask {
  id: number
  student_id: number
  from_to: string
  listening: string
  repetition: string
  link: string
  review: string
  due_date: string
  created_at: string
  completed: boolean
}

export interface StudentLevel {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface ActivityLog {
  id: number
  action: string
  date: string
}

export interface CalendarEntry {
  id: number
  student_id: number
  due_date: string
  status: 'تم الإرسال' | 'متأخر' | 'اترك'
}

/**
 * Get student dashboard data
 */
export async function getStudentDashboard(): Promise<ApiResponse<StudentDashboard>> {
  return apiRequest<StudentDashboard>({
    method: 'GET',
    url: STUDENT_API_ENDPOINTS.DASHBOARD,
  })
}

/**
 * Get daily tasks
 */
export async function getDailyTasks(isCompleted: boolean = false): Promise<ApiResponse<DailyTask[]>> {
  const isCompletedParam = isCompleted ? 1 : 0
  return apiRequest<DailyTask[]>({
    method: 'GET',
    url: `/student/tasks/${isCompletedParam}`,
  })
}

/**
 * Complete a task
 */
export async function completeTask(taskId: number): Promise<ApiResponse<void>> {
  return apiRequest<void>({
    method: 'POST',
    url: `/student/tasks/${taskId}/complete`,
  })
}

/**
 * Get student levels list
 */
export async function getStudentLevels(): Promise<ApiResponse<StudentLevel[]>> {
  return apiRequest<StudentLevel[]>({
    method: 'GET',
    url: '/student/levels',
  })
}

/**
 * Get single student level by id
 */
export async function getStudentLevel(id: number): Promise<ApiResponse<StudentLevel>> {
  return apiRequest<StudentLevel>({
    method: 'GET',
    url: `/student/levels/${id}`,
  })
}

/**
 * Export / download a student level by id
 */
export async function exportStudentLevel(id: number): Promise<ApiResponse<string>> {
  return apiRequest<string>({
    method: 'GET',
    url: `/student/levels/${id}/export`,
  })
}

/**
 * Get activity log
 */
export async function getActivityLog(): Promise<ApiResponse<ActivityLog[]>> {
  return apiRequest<ActivityLog[]>({
    method: 'GET',
    url: STUDENT_API_ENDPOINTS.ACTIVITY_LOG,
  })
}

/**
 * Get student calendar data (activity status by date)
 * POST with start_date (YYYY-MM-DD) and end_date (YYYY-MM-DD) in body
 */
export async function getStudentCalendar(
  startDate: string,
  endDate: string
): Promise<ApiResponse<CalendarEntry[]>> {
  return apiRequest<CalendarEntry[]>({
    method: 'POST',
    url: STUDENT_API_ENDPOINTS.CALENDAR,
    data: { start_date: startDate, end_date: endDate },
  })
}
