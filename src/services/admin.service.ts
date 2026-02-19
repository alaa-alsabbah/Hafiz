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

// Admin students list (إدارة الطلاب)
export interface AdminStudent {
  id: number
  full_name: string
  email: string
  country: string | null
  gender: string | null
  age: string | null
  education_level: string | null
  how_did_you_know_us: string | null
  phone_number: string
  residence: string | null
  quran_memorization_level: string
  has_ijaza: string | null
  watched_intro_video: string
  interview_time_preference: string | null
  interview_date: string | null
  score: number
  level: string | null
  program: string
  program_track: string
  teacher: string | null
  created_at: string
  warnings_count: number | null
  leaves_count: number | null
}

/** Extended student detail with IDs (for edit form) - API may return these from GET /admin/students/:id */
export interface AdminStudentDetail extends AdminStudent {
  gender_id?: number
  education_level_id?: number
  how_did_you_know_us_id?: number
  quran_memorization_level_id?: number
  interview_time_preference_id?: number
  program_id?: number
  program_track_id?: number
  phone_country_code?: string
  birth_date?: string | null
  job?: string | null
  volunteer?: string | null
  level_id?: number | null
  watched_intro_video_id?: number
}

/** Payload for POST /admin/students/:id (update student) */
export interface UpdateAdminStudentPayload {
  full_name: string
  email: string
  country: string
  gender_id: number
  birth_date: string
  education_level_id: number
  how_did_you_know_us_id: number
  has_ijaza_id: number
  phone_country_code: string
  phone_number: string
  residence: string
  quran_memorization_level_id: number
  watched_intro_video: boolean
  interview_time_preference_id: number
  program_id: number
  program_track_id: number
  job: string
  volunteer: boolean
  level_id: number
}

export interface AdminStudentsData {
  full_counts: number
  active_count: number
  hafaza_count: number
  fursan_count: number
  students: AdminStudent[]
}

/**
 * Get admin students list with optional program filter
 * @param programId - 1 = all, or specific program id for حفظة/فرسان
 */
export async function getAdminStudents(programId?: number): Promise<ApiResponse<AdminStudentsData>> {
  const params =
    programId != null ? { program_id: String(programId) } : undefined
  return api.get<AdminStudentsData>(ADMIN_API_ENDPOINTS.STUDENTS, params)
}

/**
 * Get a single student by id (for admin عرض الطالب / edit form)
 */
export async function getAdminStudent(id: number): Promise<ApiResponse<AdminStudentDetail>> {
  return api.get<AdminStudentDetail>(`${ADMIN_API_ENDPOINTS.STUDENTS}/${id}`)
}

/**
 * Delete a student
 * DELETE /admin/students/:id
 */
export async function deleteAdminStudent(id: number): Promise<ApiResponse<string>> {
  return api.delete<string>(`${ADMIN_API_ENDPOINTS.STUDENTS}/${id}`)
}

/**
 * Update a student
 * POST /admin/students/:id
 */
export async function updateAdminStudent(
  id: number,
  payload: UpdateAdminStudentPayload
): Promise<ApiResponse<string>> {
  return api.post<string>(`${ADMIN_API_ENDPOINTS.STUDENTS}/${id}`, payload)
}

/**
 * Assign a student to a teacher
 * POST /admin/students/:id/assign-teacher body: { teacher_id }
 */
export async function assignStudentToTeacher(
  studentId: number,
  teacherId: number
): Promise<ApiResponse<string>> {
  return api.post<string>(
    `${ADMIN_API_ENDPOINTS.STUDENTS}/${studentId}/assign-teacher`,
    { teacher_id: teacherId }
  )
}

/**
 * Get admin teachers list (for assign-student dropdown)
 */
export async function getAdminTeachers(): Promise<ApiResponse<AdminDashboardTeacher[]>> {
  const res = await api.get<AdminDashboardTeacher[] | { teachers: AdminDashboardTeacher[] }>(
    ADMIN_API_ENDPOINTS.TEACHERS
  )
  if (!res.success) return res as ApiResponse<AdminDashboardTeacher[]>
  const raw = (res as any).data
  const list = Array.isArray(raw) ? raw : raw?.teachers ?? []
  return { ...res, data: list }
}
