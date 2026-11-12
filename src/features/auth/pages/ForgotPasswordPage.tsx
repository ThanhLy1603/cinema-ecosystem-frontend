import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth/authApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorMessage, getFieldErrors } from '@/lib/common/apiError';
import type { ForgotPasswordRequest } from '@/types/auth/auth';
import { validateEmail } from '@/lib/auth/validation';

export function ForgotPasswordPage(): ReactElement {
   const [email, setEmail] = useState<string>('');
   const [emailError, setEmailError] = useState<string | undefined>(undefined);

   const forgotPasswordMutation: UseMutationResult<string, unknown, ForgotPasswordRequest> = useMutation<
      string,
      unknown,
      ForgotPasswordRequest
   >({
      mutationFn: forgotPassword,
   });

   const serverFieldErrors: Record<string, string> = forgotPasswordMutation.isError
      ? getFieldErrors(forgotPasswordMutation.error)
      : {};
   const hasServerFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const nextEmailError: string | undefined = validateEmail(email);
      setEmailError(nextEmailError);
      if (nextEmailError) {
         return;
      }
      forgotPasswordMutation.mutate({ email: email.trim() });
   }

   return (
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-ink-100 sm:p-10">
         <div className="mb-8 space-y-2">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-100 text-brand-600">
               <KeyRound className="size-6" aria-hidden="true" />
            </div>
            <h1 className="pt-2 text-3xl font-extrabold tracking-tight text-ink-900">Quên mật khẩu?</h1>
            <p className="text-[15px] text-ink-500">
               Nhập email đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.
            </p>
         </div>

         {forgotPasswordMutation.isSuccess ? (
            <div className="space-y-5">
               <Alert variant="success">{forgotPasswordMutation.data}</Alert>
               <p className="text-sm text-ink-500">
                  Liên kết có hiệu lực trong 30 phút. Nếu không thấy email, hãy kiểm tra cả hộp thư rác.
               </p>
            </div>
         ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
               {forgotPasswordMutation.isError && !hasServerFieldErrors && (
                  <Alert variant="error">{getErrorMessage(forgotPasswordMutation.error)}</Alert>
               )}
               <TextField
                  id="forgot-email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                  placeholder="ban@example.com"
                  autoComplete="email"
                  error={emailError ?? serverFieldErrors.email}
                  disabled={forgotPasswordMutation.isPending}
                  autoFocus
               />
               <Button type="submit" size="lg" fullWidth isLoading={forgotPasswordMutation.isPending}>
                  {forgotPasswordMutation.isPending ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
               </Button>
            </form>
         )}

         <p className="mt-8 text-center text-sm text-ink-500">
            <Link
               to="/login"
               className="inline-flex items-center gap-1.5 font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Quay lại đăng nhập
            </Link>
         </p>
      </div>
   );
}

export default ForgotPasswordPage;
