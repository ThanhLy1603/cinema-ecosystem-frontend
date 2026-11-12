import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { MailWarning } from 'lucide-react';
import type { ReactElement } from 'react';
import { resendVerification } from '@/api/auth/authApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';

export function EmailVerificationNotice(): ReactElement {
   const resendMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: resendVerification,
   });

   return (
      <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
         <div className="flex items-start gap-3">
            <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="space-y-1">
               <p className="font-semibold text-ink-900">Email của bạn chưa được xác thực</p>
               <p className="text-sm text-ink-600">
                  Xác thực email để bảo vệ tài khoản và liên kết đăng nhập Google. Chúng tôi đã gửi liên kết khi bạn
                  đăng ký.
               </p>
            </div>
         </div>
         {resendMutation.isSuccess && (
            <Alert variant="success">Đã gửi lại email xác thực, vui lòng kiểm tra hộp thư.</Alert>
         )}
         {resendMutation.isError && <Alert variant="error">{getErrorMessage(resendMutation.error)}</Alert>}
         <Button
            variant="secondary"
            onClick={() => resendMutation.mutate()}
            isLoading={resendMutation.isPending}
            disabled={resendMutation.isSuccess}
         >
            {resendMutation.isPending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
         </Button>
      </div>
   );
}

export default EmailVerificationNotice;
