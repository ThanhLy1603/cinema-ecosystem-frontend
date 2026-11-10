import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getErrorCode, REFRESH_IN_PROGRESS_ERROR_CODE } from '@/lib/common/apiError';
import { wait } from '@/lib/common/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiResponse } from '@/types/common/api';
import type { RefreshTokenResponse } from '@/types/auth/auth';

interface FailedRequestQueueItem {
   resolve: () => void;
   reject: (error: unknown) => void;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const CREDENTIAL_ENDPOINTS: string[] = [
   '/auth/login',
   '/auth/google',
   '/auth/verify-email',
   '/auth/register',
   '/auth/forgot-password',
   '/auth/reset-password',
];

const CSRF_GUARD_HEADERS: Record<string, string> = {
   'X-Requested-With': 'XMLHttpRequest',
};

const REFRESH_RETRY_DELAY_MS: number = 300;

let isRefreshing: boolean = false;
let failedQueue: FailedRequestQueueItem[] = [];

function processQueue(error: unknown): void {
   for (const failedRequestQueueItem of failedQueue) {
      if (error) {
         failedRequestQueueItem.reject(error);
      } else {
         failedRequestQueueItem.resolve();
      }
   }
   failedQueue = [];
}

function waitForTokenRefresh(): Promise<void> {
   return new Promise<void>((resolve, reject): void => {
      failedQueue.push({ resolve, reject });
   });
}

export const axiosInstance: AxiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
   headers: {
      'Content-Type': 'application/json',
      ...CSRF_GUARD_HEADERS,
   },
   withCredentials: true,
});

function isUnauthorizedError(error: unknown): boolean {
   return axios.isAxiosError(error) && error.response?.status === 401;
}

async function handleResponseError(axiosError: AxiosError<ApiResponse>): Promise<unknown> {
   const retriableRequestConfig: RetriableRequestConfig | undefined = axiosError.config as
      RetriableRequestConfig | undefined;

   if (!retriableRequestConfig || axiosError.response?.status !== 401) {
      return Promise.reject(axiosError);
   }

   const requestUrl: string = retriableRequestConfig.url ?? '';
   const isCredentialRequest: boolean = CREDENTIAL_ENDPOINTS.some((credentialEndpoint) =>
      requestUrl.includes(credentialEndpoint),
   );
   if (isCredentialRequest) {
      return Promise.reject(axiosError);
   }

   const isRefreshRequest: boolean = requestUrl.includes('/auth/refresh-token');
   if (isRefreshRequest || retriableRequestConfig._retry) {
      if (getErrorCode(axiosError) !== REFRESH_IN_PROGRESS_ERROR_CODE) {
         useAuthStore.getState().logout();
      }
      return Promise.reject(axiosError);
   }

   retriableRequestConfig._retry = true;

   if (isRefreshing) {
      await waitForTokenRefresh();
      return axiosInstance(retriableRequestConfig);
   }

   isRefreshing = true;

   try {
      const refreshAxiosResponse: AxiosResponse<ApiResponse<RefreshTokenResponse>> = await axios.post<
         ApiResponse<RefreshTokenResponse>
      >(
         `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
         {},
         { withCredentials: true, headers: CSRF_GUARD_HEADERS },
      );

      useAuthStore.getState().setAuth(refreshAxiosResponse.data.data.user);

      processQueue(null);

      return axiosInstance(retriableRequestConfig);
   } catch (refreshError: unknown) {
      if (getErrorCode(refreshError) === REFRESH_IN_PROGRESS_ERROR_CODE) {
         await wait(REFRESH_RETRY_DELAY_MS);
         processQueue(null);
         return axiosInstance(retriableRequestConfig);
      }
      processQueue(refreshError);
      if (isUnauthorizedError(refreshError)) {
         useAuthStore.getState().logout();
      }
      return Promise.reject(refreshError);
   } finally {
      isRefreshing = false;
   }
}

axiosInstance.interceptors.response.use((axiosResponse: AxiosResponse) => axiosResponse, handleResponseError);

export default axiosInstance;
