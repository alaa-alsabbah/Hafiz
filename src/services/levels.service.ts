// Levels API service (by program track)
import type { ApiResponse } from './api'

export interface ProgramTrackLevel {
  id: number
  name: string
  description: string | null
}

const levelsCache = new Map<number, ProgramTrackLevel[]>()

/**
 * Get levels for a program track
 * GET {{base_url}}/levels/:program_track_id (no version prefix)
 */
export async function getLevelsByProgramTrack(
  programTrackId: number
): Promise<ProgramTrackLevel[]> {
  if (levelsCache.has(programTrackId)) {
    return levelsCache.get(programTrackId)!
  }

  const { API_BASE_URL } = await import('@/config/api')
  const { tokenManager } = await import('./api')
  const token = tokenManager.get()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/levels/${programTrackId}`, {
    method: 'GET',
    headers,
  })

  const responseData: ApiResponse<ProgramTrackLevel[]> = await response.json()

  if (!response.ok || !responseData.success || !responseData.data) {
    throw new Error(responseData.message || 'فشل تحميل المستويات')
  }

  levelsCache.set(programTrackId, responseData.data)
  return responseData.data
}

export function clearLevelsCache(): void {
  levelsCache.clear()
}
