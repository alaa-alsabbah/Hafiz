// Teacher API service
import { apiRequest } from './api'
import type { ApiResponse } from './api'

// Teacher API endpoints
export const TEACHER_API_ENDPOINTS = {
  STUDENTS: '/teacher/students',
  STUDENTS_BY_PROGRAM: '/teacher/students/program',
  ATTENDANCE: '/teacher/attendance',
}

// Student interface
export interface Student {
  id: number
  full_name: string
  email: string
  country: string | null
  gender: string | null
  age: string
  education_level: string | null
  how_did_you_know_us: string | null
  phone_number: string
  residence: string | null
  quran_memorization_level: string
  has_ijaza_id: string | null
  watched_intro_video: string
  interview_time_preference: string | null
  interview_date: string | null
  score: number
  level: string
  program: string
  program_track: string
  teacher: string
  created_at: string
  status?: string // مكتمل | عرض واختبار | انسحب | معلق | غير معين
}

// Attendance record interface
export interface AttendanceRecord {
  id: number
  date: string
  session: string
  score: number
  page_number: number | null
  status: string
  created_at: string
}

/**
 * Get student by ID
 */
export async function getStudentById(studentId: number): Promise<ApiResponse<Student>> {
  return apiRequest<Student>({
    method: 'GET',
    url: `${TEACHER_API_ENDPOINTS.STUDENTS}/${studentId}`,
  })
}

/**
 * Get students with optional program filter
 * @param programId - 1 for حفظة, 2 for فرسان, undefined/null for all
 */
export async function getStudents(programId?: number | null): Promise<ApiResponse<Student[]>> {
  const params = new URLSearchParams()
  if (programId != null && programId > 0) {
    params.append('program_id', String(programId))
  }
  const query = params.toString()
  const url = query ? `${TEACHER_API_ENDPOINTS.STUDENTS}?${query}` : TEACHER_API_ENDPOINTS.STUDENTS
  return apiRequest<Student[]>({
    method: 'GET',
    url,
  })
}

/**
 * Get students by program (legacy - use getStudents(programId) instead)
 */
export async function getStudentsByProgram(programId: number): Promise<ApiResponse<Student[]>> {
  return getStudents(programId)
}

/**
 * Get student attendance records
 */
export async function getStudentAttendance(studentId: number): Promise<ApiResponse<AttendanceRecord[]>> {
  return apiRequest<AttendanceRecord[]>({
    method: 'GET',
    url: `${TEACHER_API_ENDPOINTS.ATTENDANCE}/${studentId}`,
  })
}
