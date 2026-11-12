import { refreshSession } from '@/api/auth/authApi';
import { getErrorCode, REFRESH_IN_PROGRESS_ERROR_CODE } from '@/lib/common/apiError';
import { wait } from '@/lib/common/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { RefreshTokenResponse } from '@/types/auth/auth';

const MAX_RESTORE_ATTEMPTS: number = 3;
const RESTORE_RETRY_DELAY_MS: number = 300;

let sessionRestorePromise: Promise<void> | null = null;

async function restoreSession(): Promise<void> {
   for (let attempt: number = 1; attempt <= MAX_RESTORE_ATTEMPTS; attempt += 1) {
      try {
         const refreshTokenResponse: RefreshTokenResponse = await refreshSession();
         useAuthStore.getState().setAuth(refreshTokenResponse.user);
         return;
      } catch (error: unknown) {
         const isRefreshInProgress: boolean = getErrorCode(error) === REFRESH_IN_PROGRESS_ERROR_CODE;
         if (!isRefreshInProgress || attempt === MAX_RESTORE_ATTEMPTS) {
            useAuthStore.getState().logout();
            return;
         }
         await wait(RESTORE_RETRY_DELAY_MS);
      }
   }
}

export function initializeSession(): Promise<void> {
   if (sessionRestorePromise === null) {
      sessionRestorePromise = restoreSession();
   }
   return sessionRestorePromise;
}
