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
   for (const failedRequestQueueItem of failedQueue) {
      if (error) {
         failedRequestQueueItem.reject(error)
      } else if (token) {
         failedRequestQueueItem.resolve(token)
      }
   }
   failedQueue = []
}

function waitForTokenRefresh(): Promise<string> {
   return new Promise<string>((resolve, reject): void => {
      failedQueue.push({ resolve, reject })
   })
}

export const axiosInstance: AxiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
})

function attachAccessToken(internalAxiosRequestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
   const accessToken: string | null = useAuthStore.getState().accessToken
   if (accessToken && internalAxiosRequestConfig.headers) {
      internalAxiosRequestConfig.headers.Authorization = `Bearer ${accessToken}`
   }
   return internalAxiosRequestConfig
}

axiosInstance.interceptors.request.use(attachAccessToken, (error: unknown) => Promise.reject(error))

async function handleResponseError(axiosError: AxiosError<ApiResponse>): Promise<unknown> {
   const retriableRequestConfig: RetriableRequestConfig | undefined = axiosError.config as
      | RetriableRequestConfig
      | undefined

   if (!retriableRequestConfig || axiosError.response?.status !== 401) {
      return Promise.reject(axiosError)
   }

   const isRefreshRequest: boolean | undefined = retriableRequestConfig.url?.includes('/auth/refresh-token')
   if (isRefreshRequest || retriableRequestConfig._retry) {
      useAuthStore.getState().logout()
      return Promise.reject(axiosError)
   }

   retriableRequestConfig._retry = true

   if (isRefreshing) {
      const newToken: string = await waitForTokenRefresh()
      if (retriableRequestConfig.headers) {
         retriableRequestConfig.headers.Authorization = `Bearer ${newToken}`
      }
      return axiosInstance(retriableRequestConfig)
   }

   isRefreshing = true

   try {
      const refreshAxiosResponse: AxiosResponse<ApiResponse<RefreshTokenResponse>> = await axios.post<
         ApiResponse<RefreshTokenResponse>
      >(`${axiosInstance.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true })

      const newAccessToken: string = refreshAxiosResponse.data.data.accessToken

      useAuthStore.getState().setAccessToken(newAccessToken)

      processQueue(null, newAccessToken)

      if (retriableRequestConfig.headers) {
         retriableRequestConfig.headers.Authorization = `Bearer ${newAccessToken}`
      }
      return axiosInstance(retriableRequestConfig)
   } catch (refreshError: unknown) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
   } finally {
      isRefreshing = false
   }
}

axiosInstance.interceptors.response.use((axiosResponse: AxiosResponse) => axiosResponse, handleResponseError)

export default axiosInstance
