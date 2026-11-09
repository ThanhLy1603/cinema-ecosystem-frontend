export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  timestamp: string;
}
export interface PageResponse<T = unknown> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errorCode: string | null;
  timestamp: string;
  details?: Record<string, string>;
}
