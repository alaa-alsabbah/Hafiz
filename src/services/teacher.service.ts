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
 * Get all students
 */
export async function getStudents(): Promise<ApiResponse<Student[]>> {
  return apiRequest<Student[]>({
    method: 'GET',
    url: TEACHER_API_ENDPOINTS.STUDENTS,
  })
}

/**
 * Get students by program
 */
export async function getStudentsByProgram(programId: number): Promise<ApiResponse<Student[]>> {
  return apiRequest<Student[]>({
    method: 'GET',
    url: `${TEACHER_API_ENDPOINTS.STUDENTS_BY_PROGRAM}/${programId}`,
  })
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
