// Student API service
import { apiRequest } from './api'
import type { ApiResponse } from './api'

// Student API endpoints
const STUDENT_API_ENDPOINTS = {
  DASHBOARD: '/student/dashboard',
  DAILY_TASKS: '/student/daily-tasks',
  LEVEL_DETAILS: '/student/level-details',
  ACTIVITY_LOG: '/student/activity-log',
}

// Student types
export interface StudentDashboard {
  id: number
  // Define based on API response
}

export interface DailyTask {
  id: number
  title: string
  description: string
  due_date: string
  status: string
}

export interface LevelDetail {
  id: number
  level_name: string
  progress: number
}

export interface ActivityLog {
  id: number
  action: string
  date: string
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
export async function getDailyTasks(): Promise<ApiResponse<DailyTask[]>> {
  return apiRequest<DailyTask[]>({
    method: 'GET',
    url: STUDENT_API_ENDPOINTS.DAILY_TASKS,
  })
}

/**
 * Get level details
 */
export async function getLevelDetails(): Promise<ApiResponse<LevelDetail>> {
  return apiRequest<LevelDetail>({
    method: 'GET',
    url: STUDENT_API_ENDPOINTS.LEVEL_DETAILS,
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
