import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate, useSearchParams, type NavigateFunction } from 'react-router-dom';
import { resetPassword } from '@/api/authApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/apiError';
import type { ResetPasswordRequest } from '@/types/auth';
import PasswordStrength from '../components/PasswordStrength';
import { PASSWORD_RESET_NOTICE } from '../utils/loginNotice';
import { validateConfirmPassword, validateNewPassword } from '@/lib/validation';

interface ResetFieldErrors {
   newPassword?: string;
   confirmPassword?: string;
}

export function ResetPasswordPage(): ReactElement {
   const navigate: NavigateFunction = useNavigate();
   const [searchParams] = useSearchParams();
   const token: string = searchParams.get('token') ?? '';
   const [newPassword, setNewPassword] = useState<string>('');
   const [confirmPassword, setConfirmPassword] = useState<string>('');
   const [fieldErrors, setFieldErrors] = useState<ResetFieldErrors>({});

   function handleResetSuccess(): void {
      navigate('/login', { replace: true, state: { notice: PASSWORD_RESET_NOTICE } });
   }

   const resetPasswordMutation: UseMutationResult<void, unknown, ResetPasswordRequest> = useMutation<
      void,
      unknown,
      ResetPasswordRequest
   >({
      mutationFn: resetPassword,
      onSuccess: handleResetSuccess,
   });

   const errorCode: string | null = resetPasswordMutation.isError ? getErrorCode(resetPasswordMutation.error) : null;
   const isTokenRejected: boolean = errorCode === 'INVALID_OR_EXPIRED_TOKEN';
   const serverFieldErrors: Record<string, string> = resetPasswordMutation.isError
      ? getFieldErrors(resetPasswordMutation.error)
      : {};
   if (errorCode === 'PASSWORD_TOO_LONG') {
      serverFieldErrors.newPassword = getErrorMessage(resetPasswordMutation.error);
   }
   const hasServerFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const nextFieldErrors: ResetFieldErrors = {
         newPassword: validateNewPassword(newPassword),
         confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.newPassword || nextFieldErrors.confirmPassword) {
         return;
      }
      resetPasswordMutation.mutate({ token, newPassword });
   }

   if (token === '' || isTokenRejected) {
      return (
         <div className="space-y-6 rounded-3xl bg-white p-8 shadow-card ring-1 ring-ink-100 sm:p-10">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Liên kết không hợp lệ</h1>
            <Alert variant="error">
               {isTokenRejected
                  ? getErrorMessage(resetPasswordMutation.error)
                  : 'Liên kết đặt lại mật khẩu thiếu mã xác thực. Vui lòng mở lại liên kết trong email.'}
            </Alert>
            <LinkButton to="/forgot-password" size="lg" fullWidth>
               Yêu cầu liên kết mới
            </LinkButton>
         </div>
      );
   }

   return (
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-ink-100 sm:p-10">
         <div className="mb-8 space-y-2">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-gold-100 text-brand-600">
               <KeyRound className="size-6" aria-hidden="true" />
            </div>
            <h1 className="pt-2 text-3xl font-extrabold tracking-tight text-ink-900">Đặt mật khẩu mới</h1>
            <p className="text-[15px] text-ink-500">
               Mật khẩu mới áp dụng cho mọi thiết bị, các phiên đăng nhập cũ sẽ bị đăng xuất.
            </p>
         </div>

         <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {resetPasswordMutation.isError && !hasServerFieldErrors && (
               <Alert variant="error">{getErrorMessage(resetPasswordMutation.error)}</Alert>
            )}
            <div className="space-y-3">
               <TextField
                  id="reset-new-password"
                  label="Mật khẩu mới"
                  type="password"
                  icon={KeyRound}
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                  hint="Tối thiểu 8 ký tự, gồm cả chữ và số."
                  error={fieldErrors.newPassword ?? serverFieldErrors.newPassword}
                  disabled={resetPasswordMutation.isPending}
                  autoFocus
               />
               <PasswordStrength password={newPassword} />
            </div>
            <TextField
               id="reset-confirm-password"
               label="Nhập lại mật khẩu mới"
               type="password"
               icon={ShieldCheck}
               value={confirmPassword}
               onChange={setConfirmPassword}
               autoComplete="new-password"
               error={fieldErrors.confirmPassword}
               disabled={resetPasswordMutation.isPending}
            />
            <Button type="submit" size="lg" fullWidth isLoading={resetPasswordMutation.isPending}>
               {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
         </form>

         <p className="mt-8 text-center text-sm text-ink-500">
            <Link
               to="/login"
               className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
               Quay lại đăng nhập
            </Link>
         </p>
      </div>
   );
}

export default ResetPasswordPage;
