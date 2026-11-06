import axios, {
   type AxiosError,
   type AxiosInstance,
   type AxiosResponse,
   type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ApiResponse } from '@/types/api'
import type { RefreshTokenResponse } from '@/types/auth'

interface FailedRequestQueueItem {
   resolve: (token: string) => void
   reject: (error: unknown) => void
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing: boolean = false
let failedQueue: FailedRequestQueueItem[] = []

function processQueue(error: unknown, token: string | null = null): void {
   for (const promise of failedQueue) {
      if (error) {
         promise.reject(error)
      } else if (token) {
         promise.resolve(token)
      }
   }
   failedQueue = []
}

/** Park the current request until the in-flight refresh finishes. */
function waitForTokenRefresh(): Promise<string> {
   return new Promise<string>((resolve, reject): void => {
      failedQueue.push({ resolve, reject })
   })
}

export const axiosClient: AxiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true, // Send HttpOnly refresh token cookie
})

// Request Interceptor: Attach in-memory Access Token
function attachAccessToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
   const accessToken: string | null = useAuthStore.getState().accessToken
   if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
   }
   return config
}

axiosClient.interceptors.request.use(attachAccessToken, (error: unknown) => Promise.reject(error))

// Response Interceptor: 401 Silent Refresh Queue
async function handleResponseError(error: AxiosError<ApiResponse>): Promise<unknown> {
   const originalRequest: RetriableRequestConfig | undefined = error.config as RetriableRequestConfig | undefined

   // If no config or error is not 401, reject immediately
   if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
   }

   // Prevent infinite loop if the refresh-token endpoint itself returns 401
   const isRefreshRequest: boolean | undefined = originalRequest.url?.includes('/auth/refresh-token')
   if (isRefreshRequest || originalRequest._retry) {
      useAuthStore.getState().logout()
      return Promise.reject(error)
   }

   originalRequest._retry = true

   if (isRefreshing) {
      const newToken: string = await waitForTokenRefresh()
      if (originalRequest.headers) {
         originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return axiosClient(originalRequest)
   }

   isRefreshing = true

   try {
      // Call silent refresh endpoint with HttpOnly cookie
      const refreshResponse: AxiosResponse<ApiResponse<RefreshTokenResponse>> = await axios.post<
         ApiResponse<RefreshTokenResponse>
      >(`${axiosClient.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true })

      const newAccessToken: string = refreshResponse.data.data.accessToken

      // Update in-memory Zustand store
      useAuthStore.getState().setAccessToken(newAccessToken)

      // Replay queued requests
      processQueue(null, newAccessToken)

      // Retry original failed request
      if (originalRequest.headers) {
         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      }
      return axiosClient(originalRequest)
   } catch (refreshError: unknown) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
   } finally {
      isRefreshing = false
   }
}

axiosClient.interceptors.response.use((response: AxiosResponse) => response, handleResponseError)

export default axiosClient
