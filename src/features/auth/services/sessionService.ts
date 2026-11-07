import { refreshSession } from '@/api/authApi'
import { useAuthStore } from '@/stores/useAuthStore'
import type { RefreshTokenResponse } from '@/types/auth'

let sessionRestorePromise: Promise<void> | null = null

async function restoreSession(): Promise<void> {
   try {
      const refreshTokenResponse: RefreshTokenResponse = await refreshSession()
      useAuthStore.getState().setAuth(refreshTokenResponse.user, refreshTokenResponse.accessToken)
   } catch {
      useAuthStore.getState().logout()
   }
}

export function initializeSession(): Promise<void> {
   if (sessionRestorePromise === null) {
      sessionRestorePromise = restoreSession()
   }
   return sessionRestorePromise
}
