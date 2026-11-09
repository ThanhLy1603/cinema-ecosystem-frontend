export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  timestamp: string;
}
export interface PageResponse<T = unknown> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errorCode: string | null;
  timestamp: string;
  details?: Record<string, string>;
}
