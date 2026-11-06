/**
 * Standard ApiResponse wrapper matching Spring Boot Global ApiResponse<T>
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  errorCode: string | null
  timestamp: string
}

/**
 * Common pagination format from Spring Data Page<T>
 */
export interface PageResponse<T = unknown> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  isFirst: boolean
  isLast: boolean
}

/**
 * Standard API error payload
 */
export interface ApiError {
  success: false
  message: string
  errorCode: string | null
  timestamp: string
  details?: Record<string, string>
}
