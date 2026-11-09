import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { changeMyPassword } from '@/api/userApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ChangePasswordRequest, LoginResponse, User } from '@/types/auth';
import { PROFILE_QUERY_KEY } from '../utils/queryKeys';
import { validateConfirmPassword, validateLoginPassword, validateNewPassword } from '../utils/validation';
import PasswordStrength from './PasswordStrength';

interface ChangePasswordFormProps {
   hasPassword: boolean;
}

interface PasswordFieldErrors {
   currentPassword?: string;
   newPassword?: string;
   confirmPassword?: string;
}

export function ChangePasswordForm({ hasPassword }: ChangePasswordFormProps): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const setAuth: (user: User) => void = useAuthStore((authState) => authState.setAuth);
   const [currentPassword, setCurrentPassword] = useState<string>('');
   const [newPassword, setNewPassword] = useState<string>('');
   const [confirmPassword, setConfirmPassword] = useState<string>('');
   const [fieldErrors, setFieldErrors] = useState<PasswordFieldErrors>({});

   function handleChangeSuccess(loginResponse: LoginResponse): void {
      setAuth(loginResponse.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({});
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
   }

   const changePasswordMutation: UseMutationResult<LoginResponse, unknown, ChangePasswordRequest> = useMutation<
      LoginResponse,
      unknown,
      ChangePasswordRequest
   >({
      mutationFn: changeMyPassword,
      onSuccess: handleChangeSuccess,
   });

   const errorCode: string | null = changePasswordMutation.isError ? getErrorCode(changePasswordMutation.error) : null;
   const serverFieldErrors: Record<string, string> = changePasswordMutation.isError
      ? getFieldErrors(changePasswordMutation.error)
      : {};
   if (errorCode === 'INVALID_CURRENT_PASSWORD' || errorCode === 'CURRENT_PASSWORD_REQUIRED') {
      serverFieldErrors.currentPassword = getErrorMessage(changePasswordMutation.error);
   }
   if (errorCode === 'NEW_PASSWORD_SAME_AS_CURRENT' || errorCode === 'PASSWORD_TOO_LONG') {
      serverFieldErrors.newPassword = getErrorMessage(changePasswordMutation.error);
   }
   const hasServerFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      changePasswordMutation.reset();
      const nextFieldErrors: PasswordFieldErrors = {
         currentPassword: hasPassword ? validateLoginPassword(currentPassword) : undefined,
         newPassword: validateNewPassword(newPassword),
         confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
      };
      setFieldErrors(nextFieldErrors);
      if (Object.values(nextFieldErrors).some((fieldError) => fieldError !== undefined)) {
         return;
      }
      changePasswordMutation.mutate({
         currentPassword: hasPassword ? currentPassword : undefined,
         newPassword,
      });
   }

   const submitLabel: string = hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu';

   return (
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
         {!hasPassword && (
            <Alert variant="info">
               Tài khoản của bạn đang đăng nhập bằng Google và chưa có mật khẩu. Tạo mật khẩu để có thể đăng nhập bằng
               email.
            </Alert>
         )}
         {changePasswordMutation.isSuccess && (
            <Alert variant="success">
               {hasPassword
                  ? 'Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.'
                  : 'Đã tạo mật khẩu. Các thiết bị khác đã bị đăng xuất.'}
            </Alert>
         )}
         {changePasswordMutation.isError && !hasServerFieldErrors && (
            <Alert variant="error">{getErrorMessage(changePasswordMutation.error)}</Alert>
         )}

         {hasPassword && (
            <TextField
               id="current-password"
               label="Mật khẩu hiện tại"
               type="password"
               icon={Lock}
               value={currentPassword}
               onChange={setCurrentPassword}
               autoComplete="current-password"
               error={fieldErrors.currentPassword ?? serverFieldErrors.currentPassword}
               disabled={changePasswordMutation.isPending}
            />
         )}
         <div className="space-y-3">
            <TextField
               id="new-password"
               label="Mật khẩu mới"
               type="password"
               icon={KeyRound}
               value={newPassword}
               onChange={setNewPassword}
               autoComplete="new-password"
               hint="Tối thiểu 8 ký tự, gồm cả chữ và số."
               error={fieldErrors.newPassword ?? serverFieldErrors.newPassword}
               disabled={changePasswordMutation.isPending}
            />
            <PasswordStrength password={newPassword} />
         </div>
         <TextField
            id="confirm-new-password"
            label="Nhập lại mật khẩu mới"
            type="password"
            icon={ShieldCheck}
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            disabled={changePasswordMutation.isPending}
         />

         <Button type="submit" size="lg" isLoading={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? 'Đang xử lý...' : submitLabel}
         </Button>
      </form>
   );
}

export default ChangePasswordForm;
