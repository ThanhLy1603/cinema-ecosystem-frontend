import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Lock, Mail, Phone, ShieldCheck, User as UserIcon, UserPlus } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useLocation, useNavigate, type Location, type NavigateFunction } from 'react-router-dom';
import { login, register } from '@/api/authApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage, getFieldErrors } from '@/lib/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LoginResponse, RegisterRequest, User } from '@/types/auth';
import GoogleAuthSection from '../components/GoogleAuthSection';
import PasswordStrength from '../components/PasswordStrength';
import { getRedirectPath } from '../utils/redirect';
import {
   validateConfirmPassword,
   validateEmail,
   validateFullName,
   validateNewPassword,
   validatePhone,
} from '@/lib/validation';

interface RegisterFieldErrors {
   fullName?: string;
   email?: string;
   phone?: string;
   password?: string;
   confirmPassword?: string;
}

async function registerAndSignIn(registerRequest: RegisterRequest): Promise<LoginResponse> {
   await register(registerRequest);
   return login({ email: registerRequest.email, password: registerRequest.password });
}

export function RegisterPage(): ReactElement {
   const navigate: NavigateFunction = useNavigate();
   const location: Location = useLocation();
   const setAuth: (user: User) => void = useAuthStore((authState) => authState.setAuth);
   const [fullName, setFullName] = useState<string>('');
   const [email, setEmail] = useState<string>('');
   const [phone, setPhone] = useState<string>('');
   const [password, setPassword] = useState<string>('');
   const [confirmPassword, setConfirmPassword] = useState<string>('');
   const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
   const redirectPath: string = getRedirectPath(location.state);

   function handleRegisterSuccess(loginResponse: LoginResponse): void {
      setAuth(loginResponse.user);
      navigate(redirectPath, { replace: true });
   }

   const registerMutation: UseMutationResult<LoginResponse, unknown, RegisterRequest> = useMutation<
      LoginResponse,
      unknown,
      RegisterRequest
   >({
      mutationFn: registerAndSignIn,
      onSuccess: handleRegisterSuccess,
   });

   const errorCode: string | null = registerMutation.isError ? getErrorCode(registerMutation.error) : null;
   const serverFieldErrors: Record<string, string> = registerMutation.isError
      ? getFieldErrors(registerMutation.error)
      : {};
   if (errorCode === 'EMAIL_ALREADY_EXISTS') {
      serverFieldErrors.email = getErrorMessage(registerMutation.error);
   }
   if (errorCode === 'PHONE_ALREADY_EXISTS') {
      serverFieldErrors.phone = getErrorMessage(registerMutation.error);
   }
   const hasServerFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const nextFieldErrors: RegisterFieldErrors = {
         fullName: validateFullName(fullName),
         email: validateEmail(email),
         phone: validatePhone(phone),
         password: validateNewPassword(password),
         confirmPassword: validateConfirmPassword(password, confirmPassword),
      };
      setFieldErrors(nextFieldErrors);
      if (Object.values(nextFieldErrors).some((fieldError) => fieldError !== undefined)) {
         return;
      }
      const trimmedPhone: string = phone.trim();
      registerMutation.mutate({
         fullName: fullName.trim(),
         email: email.trim(),
         password,
         ...(trimmedPhone.length > 0 ? { phone: trimmedPhone } : {}),
      });
   }

   return (
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-ink-100 sm:p-10">
         <div className="mb-8 space-y-2">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-gold-100 text-brand-600">
               <UserPlus className="size-6" aria-hidden="true" />
            </div>
            <h1 className="pt-2 text-3xl font-extrabold tracking-tight text-ink-900">Tạo tài khoản</h1>
            <p className="text-[15px] text-ink-500">Chỉ mất một phút để trở thành thành viên của CinemaSphere.</p>
         </div>

         <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {registerMutation.isError && !hasServerFieldErrors && (
               <Alert variant="error">{getErrorMessage(registerMutation.error)}</Alert>
            )}

            <TextField
               id="fullName"
               label="Họ và tên"
               icon={UserIcon}
               value={fullName}
               onChange={setFullName}
               placeholder="Nguyễn Văn A"
               autoComplete="name"
               error={fieldErrors.fullName ?? serverFieldErrors.fullName}
               disabled={registerMutation.isPending}
               autoFocus
            />
            <TextField
               id="email"
               label="Email"
               type="email"
               icon={Mail}
               value={email}
               onChange={setEmail}
               placeholder="ban@example.com"
               autoComplete="email"
               error={fieldErrors.email ?? serverFieldErrors.email}
               disabled={registerMutation.isPending}
            />
            <TextField
               id="phone"
               label="Số điện thoại"
               type="tel"
               icon={Phone}
               value={phone}
               onChange={setPhone}
               placeholder="0901234567"
               autoComplete="tel"
               optional
               error={fieldErrors.phone ?? serverFieldErrors.phone}
               disabled={registerMutation.isPending}
            />
            <div className="space-y-3">
               <TextField
                  id="password"
                  label="Mật khẩu"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={setPassword}
                  placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                  autoComplete="new-password"
                  error={fieldErrors.password ?? serverFieldErrors.password}
                  disabled={registerMutation.isPending}
               />
               <PasswordStrength password={password} />
            </div>
            <TextField
               id="confirmPassword"
               label="Nhập lại mật khẩu"
               type="password"
               icon={ShieldCheck}
               value={confirmPassword}
               onChange={setConfirmPassword}
               placeholder="Nhập lại mật khẩu"
               autoComplete="new-password"
               error={fieldErrors.confirmPassword}
               disabled={registerMutation.isPending}
            />

            <Button type="submit" size="lg" fullWidth isLoading={registerMutation.isPending}>
               {registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </Button>
         </form>

         <GoogleAuthSection />

         <p className="mt-8 text-center text-sm text-ink-500">
            Đã có tài khoản?{' '}
            <Link
               to="/login"
               state={location.state}
               className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
               Đăng nhập
            </Link>
         </p>
      </div>
   );
}

export default RegisterPage;
