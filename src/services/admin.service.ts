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

// Admin types
export interface AdminDashboard {
  id: number
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
  return api.get<AdminDashboard>(ADMIN_API_ENDPOINTS.DASHBOARD)
}
