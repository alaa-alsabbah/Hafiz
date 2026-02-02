// Teacher API service
import { api, type ApiResponse } from './api'

// Teacher API endpoints
export const TEACHER_API_ENDPOINTS = {
  STUDENTS: '/teacher/students',
  STUDENTS_BY_PROGRAM: '/teacher/students/program',
  ATTENDANCE: '/teacher/attendance',
  NOTES: '/teacher/notes',
  PRESENTATION_TESTS: '/teacher/presentation_tests',
}

// Student interface
export interface Student {
  id: number
  full_name: string
  email: string
  country: string | null
  gender: string | null
  age: string
  profession?: string | null
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
  return api.get<Student>(`${TEACHER_API_ENDPOINTS.STUDENTS}/${studentId}`)
}

/**
 * Get students with optional program filter
 * @param programId - 1 for حفظة, 2 for فرسان, undefined/null for all
 */
export async function getStudents(programId?: number | null): Promise<ApiResponse<Student[]>> {
  const params =
    programId != null && programId > 0 ? { program_id: String(programId) } : undefined
  return api.get<Student[]>(TEACHER_API_ENDPOINTS.STUDENTS, params)
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
  return api.get<AttendanceRecord[]>(`${TEACHER_API_ENDPOINTS.ATTENDANCE}/${studentId}`)
}

/** Request body for creating attendance record */
export interface CreateAttendanceRequest {
  date: string
  session: string
  status_id: number
  page_number: number | null
  score: number
}

/**
 * Create attendance record for a student
 */
export async function createAttendance(
  studentId: number,
  data: CreateAttendanceRequest
): Promise<ApiResponse<AttendanceRecord>> {
  return api.post<AttendanceRecord>(`${TEACHER_API_ENDPOINTS.ATTENDANCE}/${studentId}`, data)
}

// Student note interface
export interface StudentNote {
  id: number
  note: string
  created_at: string
}

/**
 * Get student notes
 */
export async function getStudentNotes(studentId: number): Promise<ApiResponse<StudentNote[]>> {
  return api.get<StudentNote[]>(`${TEACHER_API_ENDPOINTS.NOTES}/${studentId}`)
}

/**
 * Add a note for a student
 */
export async function addStudentNote(
  studentId: number,
  note: string
): Promise<ApiResponse<StudentNote>> {
  return api.post<StudentNote>(`${TEACHER_API_ENDPOINTS.NOTES}/${studentId}`, { note })
}

/**
 * Delete a student note
 * DELETE /teacher/notes/:id
 */
export async function deleteStudentNote(noteId: number): Promise<ApiResponse<void>> {
  return api.delete<void>(`${TEACHER_API_ENDPOINTS.NOTES}/${noteId}`)
}

// Presentation test record interface
export interface PresentationTestRecord {
  id: number
  program_track: string
  level: string
  score_presentation: string
  score_tests: string
  created_at: string
}

/**
 * Get student presentation and test records
 */
export async function getStudentPresentationTests(
  studentId: number
): Promise<ApiResponse<PresentationTestRecord[]>> {
  return api.get<PresentationTestRecord[]>(
    `${TEACHER_API_ENDPOINTS.PRESENTATION_TESTS}/${studentId}`
  )
}

/** Request body for creating presentation test */
export interface CreatePresentationTestRequest {
  score_presentation: number
  score_tests: number
}

/**
 * Create presentation test record for a student
 * POST /teacher/presentation_tests/:student_id
 */
export async function createPresentationTest(
  studentId: number,
  data: CreatePresentationTestRequest
): Promise<ApiResponse<PresentationTestRecord>> {
  return api.post<PresentationTestRecord>(
    `${TEACHER_API_ENDPOINTS.PRESENTATION_TESTS}/${studentId}`,
    data
  )
}

/**
 * Delete a presentation test record
 * DELETE /teacher/presentation_tests/:id
 */
export async function deletePresentationTest(
  id: number
): Promise<ApiResponse<void>> {
  return api.delete<void>(`${TEACHER_API_ENDPOINTS.PRESENTATION_TESTS}/${id}`)
}
