// Lookups API service
import { apiRequest, type ApiResponse } from './api'

// Lookup groups that can be fetched from the API
export const LOOKUP_GROUPS = {
  GENDER: 'gender',
  EDUCATION_LEVEL: 'education_level',
  HOW_DID_YOU_KNOW_US: 'how_did_you_know_us',
  QURAN_MEMORIZATION_LEVEL: 'quran_memorization_level',
  HAS_IJAZA: 'has_ijaza',
  PROGRAM_TRACK: 'program_track',
  INTERVIEW_TIME_PREFERENCE: 'interview_time_preference',
  YES_NO: 'yes_no',
  MASTERY_PERCENTAGE: 'mastery_percentage',
  EXPERIENCE_YEARS: 'experience_years',
  MEMORIZED_QURAN_COMPLETELY: 'memorized_quran_completely',
} as const

export type LookupGroup = typeof LOOKUP_GROUPS[keyof typeof LOOKUP_GROUPS]

// Lookup item structure returned by API
export interface LookupItem {
  id: number
  code: string
  key: string
  value_en: string
  value_ar: string
}

// Cache for lookups to avoid redundant API calls
const lookupsCache = new Map<string, LookupItem[]>()

/**
 * Fetch lookup data for a specific group
 */
export async function getLookup(group: LookupGroup): Promise<LookupItem[]> {
  // Check cache first
  if (lookupsCache.has(group)) {
    return lookupsCache.get(group)!
  }

  try {
    // Lookups endpoint doesn't use version - call directly without v1
    const { API_BASE_URL } = await import('@/config/api')
    const { tokenManager } = await import('./api')
    const token = tokenManager.get()
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Call: http://34.247.136.158/api/lookups/:group (no v1)
    const response = await fetch(`${API_BASE_URL}/lookups/${group}`, {
      method: 'GET',
      headers,
    })
    
    const responseData: ApiResponse<LookupItem[]> = await response.json()
    
    if (!response.ok || !responseData.success || !responseData.data) {
      throw new Error(responseData.message || `فشل تحميل بيانات ${group}`)
    }
    
    // Cache the result
    lookupsCache.set(group, responseData.data)
    return responseData.data

    if (!response.success || !response.data) {
      throw new Error(response.message || `فشل تحميل بيانات ${group}`)
    }

    // Cache the result
    lookupsCache.set(group, response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching lookup group ${group}:`, error)
    throw error
  }
}

/**
 * Fetch multiple lookup groups in parallel
 */
export async function getLookups(
  groups: LookupGroup[]
): Promise<Record<string, LookupItem[]>> {
  try {
    const promises = groups.map(async (group) => {
      const data = await getLookup(group)
      return { group, data }
    })

    const results = await Promise.all(promises)

    return results.reduce(
      (acc, { group, data }) => {
        acc[group] = data
        return acc
      },
      {} as Record<string, LookupItem[]>
    )
  } catch (error) {
    console.error('Error fetching lookups:', error)
    throw error
  }
}

/**
 * Clear the lookups cache (useful for testing or forced refresh)
 */
export function clearLookupsCache(): void {
  lookupsCache.clear()
}

/**
 * Get all lookup groups needed for registration
 */
export function getRegistrationLookupGroups(
  type: 'student' | 'teacher'
): LookupGroup[] {
  const commonGroups: LookupGroup[] = [
    LOOKUP_GROUPS.GENDER,
    LOOKUP_GROUPS.EDUCATION_LEVEL,
    LOOKUP_GROUPS.HOW_DID_YOU_KNOW_US,
    LOOKUP_GROUPS.YES_NO,
  ]

  if (type === 'student') {
    return [
      ...commonGroups,
      LOOKUP_GROUPS.QURAN_MEMORIZATION_LEVEL,
      LOOKUP_GROUPS.HAS_IJAZA,
      LOOKUP_GROUPS.PROGRAM_TRACK,
      LOOKUP_GROUPS.INTERVIEW_TIME_PREFERENCE,
      LOOKUP_GROUPS.MEMORIZED_QURAN_COMPLETELY,
    ]
  } else {
    // Teacher specific groups
    return [
      ...commonGroups,
      LOOKUP_GROUPS.MASTERY_PERCENTAGE,
      LOOKUP_GROUPS.EXPERIENCE_YEARS,
      LOOKUP_GROUPS.HAS_IJAZA,
      LOOKUP_GROUPS.INTERVIEW_TIME_PREFERENCE,
      LOOKUP_GROUPS.MEMORIZED_QURAN_COMPLETELY,
    ]
  }
}
