import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ReactElement, type RefObject } from 'react'
import { useLocation, useNavigate, type Location, type NavigateFunction } from 'react-router-dom'
import { loginWithGoogle } from '@/api/authApi'
import Alert from '@/components/ui/Alert'
import { getErrorMessage } from '@/lib/apiError'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import type { GoogleLoginRequest, LoginResponse, User } from '@/types/auth'
import { mountGoogleButton } from '../services/googleButtonService'
import { getRedirectPath } from '../utils/redirect'

const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const SCRIPT_ERROR_MESSAGE: string = 'Không tải được nút đăng nhập Google. Vui lòng kiểm tra kết nối và tải lại trang.'

export function GoogleAuthSection(): ReactElement | null {
   const navigate: NavigateFunction = useNavigate()
   const location: Location = useLocation()
   const setAuth: (user: User) => void = useAuthStore((authState) => authState.setAuth)
   const buttonContainerRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
   const [hasScriptError, setHasScriptError] = useState<boolean>(false)
   const redirectPath: string = getRedirectPath(location.state)

   function handleGoogleLoginSuccess(loginResponse: LoginResponse): void {
      setAuth(loginResponse.user)
      navigate(redirectPath, { replace: true })
   }

   const googleLoginMutation: UseMutationResult<LoginResponse, unknown, GoogleLoginRequest> = useMutation<
      LoginResponse,
      unknown,
      GoogleLoginRequest
   >({
      mutationFn: loginWithGoogle,
      onSuccess: handleGoogleLoginSuccess,
   })
   const { mutate } = googleLoginMutation

   useEffect(
      () =>
         GOOGLE_CLIENT_ID === ''
            ? undefined
            : mountGoogleButton(
                 buttonContainerRef,
                 GOOGLE_CLIENT_ID,
                 (idToken: string) => mutate({ idToken }),
                 () => setHasScriptError(true),
              ),
      [mutate],
   )

   if (GOOGLE_CLIENT_ID === '') {
      return null
   }

   return (
      <div className="mt-6 space-y-4">
         <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
            <span className="h-px flex-1 bg-ink-100" />
            hoặc
            <span className="h-px flex-1 bg-ink-100" />
         </div>

         {googleLoginMutation.isError && <Alert variant="error">{getErrorMessage(googleLoginMutation.error)}</Alert>}
         {hasScriptError && <Alert variant="error">{SCRIPT_ERROR_MESSAGE}</Alert>}

         <div
            ref={buttonContainerRef}
            aria-busy={googleLoginMutation.isPending}
            className={cn(
               'flex min-h-[44px] justify-center transition-opacity',
               googleLoginMutation.isPending && 'pointer-events-none opacity-50',
            )}
         />
         {googleLoginMutation.isPending && (
            <p className="text-center text-sm text-ink-500">Đang đăng nhập bằng Google...</p>
         )}
      </div>
   )
}

export default GoogleAuthSection
