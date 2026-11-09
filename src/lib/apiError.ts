import axios from 'axios';
import type { ApiResponse } from '@/types/api';

export const REFRESH_IN_PROGRESS_ERROR_CODE: string = 'REFRESH_IN_PROGRESS';

const NETWORK_ERROR_MESSAGE: string = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
const SERVER_UNAVAILABLE_MESSAGE: string = 'Máy chủ đang tạm thời không phản hồi. Vui lòng thử lại sau ít phút.';
const UNKNOWN_ERROR_MESSAGE: string = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

function getApiResponse(error: unknown): ApiResponse<unknown> | null {
   if (!axios.isAxiosError<ApiResponse<unknown>>(error)) {
      return null;
   }
   const responseData: unknown = error.response?.data;
   return typeof responseData === 'object' && responseData !== null ? (responseData as ApiResponse<unknown>) : null;
}

function isGatewayError(error: unknown): boolean {
   if (!axios.isAxiosError(error) || !error.response) {
      return false;
   }
   return [502, 503, 504].includes(error.response.status);
}

export function getErrorMessage(error: unknown): string {
   if (axios.isAxiosError(error) && !error.response) {
      return NETWORK_ERROR_MESSAGE;
   }
   const apiResponse: ApiResponse<unknown> | null = getApiResponse(error);
   if (apiResponse && typeof apiResponse.message === 'string' && apiResponse.message.length > 0) {
      return apiResponse.message;
   }
   if (isGatewayError(error)) {
      return SERVER_UNAVAILABLE_MESSAGE;
   }
   return UNKNOWN_ERROR_MESSAGE;
}

export function getFieldErrors(error: unknown): Record<string, string> {
   const apiResponse: ApiResponse<unknown> | null = getApiResponse(error);
   if (apiResponse?.errorCode !== 'VALIDATION_ERROR' || typeof apiResponse.data !== 'object' || !apiResponse.data) {
      return {};
   }
   return apiResponse.data as Record<string, string>;
}

export function getErrorCode(error: unknown): string | null {
   return getApiResponse(error)?.errorCode ?? null;
}
