import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ApiResponse } from '@/types/api'
import type { RefreshTokenResponse } from '@/types/auth'

interface FailedRequestQueueItem {
   resolve: (token: string) => void
   reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequestQueueItem[] = []

const processQueue = (error: unknown | null, token: string | null = null) => {
   failedQueue.forEach((promise) => {
      if (error) {
         promise.reject(error)
      } else if (token) {
         promise.resolve(token)
      }
   })
   failedQueue = []
}

export const axiosClient = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true, // Send HttpOnly refresh token cookie
})

// Request Interceptor: Attach in-memory Access Token
axiosClient.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
      const accessToken = useAuthStore.getState().accessToken
      if (accessToken && config.headers) {
         config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
   },
   (error) => Promise.reject(error),
)

// Response Interceptor: 401 Silent Refresh Queue
axiosClient.interceptors.response.use(
   (response) => response,
   async (error: AxiosError<ApiResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // If no config or error is not 401, reject immediately
      if (!originalRequest || error.response?.status !== 401) {
         return Promise.reject(error)
      }

      // Prevent infinite loop if the refresh-token endpoint itself returns 401
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token')
      if (isRefreshRequest || originalRequest._retry) {
         useAuthStore.getState().logout()
         return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
         return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
         })
            .then((newToken) => {
               if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
               }
               return axiosClient(originalRequest)
            })
            .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
         // Call silent refresh endpoint with HttpOnly cookie
         const refreshResponse = await axios.post<ApiResponse<RefreshTokenResponse>>(
            `${axiosClient.defaults.baseURL}/auth/refresh-token`,
            {},
            { withCredentials: true },
         )

         const newAccessToken = refreshResponse.data.data.accessToken

         // Update in-memory Zustand store
         useAuthStore.getState().setAccessToken(newAccessToken)

         // Replay queued requests
         processQueue(null, newAccessToken)

         // Retry original failed request
         if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
         }
         return axiosClient(originalRequest)
      } catch (refreshError) {
         processQueue(refreshError, null)
         useAuthStore.getState().logout()
         return Promise.reject(refreshError)
      } finally {
         isRefreshing = false
      }
   },
)

export default axiosClient
