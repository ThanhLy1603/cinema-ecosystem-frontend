import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyEmail } from '@/api/auth/authApi';
import LinkButton from '@/components/ui/LinkButton';
import { getErrorMessage } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User, VerifyEmailRequest } from '@/types/auth/auth';
import { PROFILE_QUERY_KEY } from '../utils/queryKeys';

const MISSING_TOKEN_MESSAGE: string = 'Liên kết xác thực thiếu mã xác thực. Vui lòng mở lại liên kết trong email.';

export function VerifyEmailPage(): ReactElement {
   const [searchParams] = useSearchParams();
   const token: string = searchParams.get('token') ?? '';
   const queryClient: QueryClient = useQueryClient();
   const user: User | null = useAuthStore((authState) => authState.user);
   const setUser: (user: User | null) => void = useAuthStore((authState) => authState.setUser);
   const hasSubmittedRef: RefObject<boolean> = useRef<boolean>(false);

   function handleVerifySuccess(): void {
      if (user) {
         setUser({ ...user, emailVerified: true });
      }
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
   }

   const verifyEmailMutation: UseMutationResult<void, unknown, VerifyEmailRequest> = useMutation<
      void,
      unknown,
      VerifyEmailRequest
   >({
      mutationFn: verifyEmail,
      onSuccess: handleVerifySuccess,
   });
   const { mutate } = verifyEmailMutation;

   useEffect((): void => {
      if (token === '' || hasSubmittedRef.current) {
         return;
      }
      hasSubmittedRef.current = true;
      mutate({ token });
   }, [token, mutate]);

   const isVerifying: boolean = token !== '' && !verifyEmailMutation.isSuccess && !verifyEmailMutation.isError;

   return (
      <div className="space-y-6 rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-ink-100 sm:p-10">
         {isVerifying && (
            <>
               <LoaderCircle className="mx-auto size-12 animate-spin text-brand-500" aria-hidden="true" />
               <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Đang xác thực email...</h1>
            </>
         )}

         {verifyEmailMutation.isSuccess && (
            <>
               <CircleCheck className="mx-auto size-14 text-emerald-500" aria-hidden="true" />
               <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Xác thực email thành công</h1>
               <p className="text-[15px] text-ink-500">
                  Email của bạn đã được xác thực. Bạn có thể liên kết đăng nhập Google với tài khoản này.
               </p>
               <LinkButton to={user ? '/profile' : '/login'} size="lg" fullWidth>
                  {user ? 'Về hồ sơ của tôi' : 'Đăng nhập'}
               </LinkButton>
            </>
         )}

         {(verifyEmailMutation.isError || token === '') && (
            <>
               <CircleAlert className="mx-auto size-14 text-danger-500" aria-hidden="true" />
               <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Không thể xác thực email</h1>
               <p className="text-[15px] text-ink-500">
                  {token === '' ? MISSING_TOKEN_MESSAGE : getErrorMessage(verifyEmailMutation.error)}
               </p>
               <LinkButton to={user ? '/profile' : '/login'} size="lg" fullWidth>
                  {user ? 'Về hồ sơ để gửi lại email' : 'Đăng nhập để gửi lại email'}
               </LinkButton>
            </>
         )}
      </div>
   );
}

export default VerifyEmailPage;
