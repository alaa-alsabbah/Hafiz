// Admin API service
import { api, type ApiResponse } from './api'

// Admin API endpoints
const ADMIN_API_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  STUDENTS: '/admin/students',
  WEEKLY_REPORT: '/admin/weekly-report',
  PRESENTATION_TEST: '/admin/presentation-test',
  PERMISSION: '/admin/permission',
  EVALUATIONS: '/admin/evaluations',
  TEACHERS: '/admin/teachers',
}

// Admin dashboard types (from API)
export interface AdminDashboardLastActivity {
  id: number
  full_name: string
  program: string
  time: string
  day: string
}

export interface AdminDashboardTeacher {
  id: number
  full_name: string
  email: string
  age: string | null
  has_ijaza: boolean | null
  country: string | null
  gender: string | null
  education_level: string | null
  students_count: number
  current_count: number
  status: string
  experience_years: string
  created_at: string
}

export interface AdminDashboardMonthlyRegistration {
  month: string
  total: number
}

export interface AdminDashboardHefazLevels {
  full: number
  more_20: number
  from_10_to_20: number
  from_5_to_9: number
  less_5: number
}

export interface AdminDashboardData {
  registerationCount: number
  interview_count: number
  active_count: number
  attendance_count: number
  registerationMonthly: AdminDashboardMonthlyRegistration[]
  last_activity: AdminDashboardLastActivity[]
  hefaz_levels: AdminDashboardHefazLevels
  teachers: AdminDashboardTeacher[]
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardData>> {
  return api.get<AdminDashboardData>(ADMIN_API_ENDPOINTS.DASHBOARD)
}
