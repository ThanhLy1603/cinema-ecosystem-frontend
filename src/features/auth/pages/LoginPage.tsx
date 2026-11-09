import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { LogIn, Lock, Mail } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useLocation, useNavigate, type Location, type NavigateFunction } from 'react-router-dom';
import { login } from '@/api/authApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorMessage, getFieldErrors } from '@/lib/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';
import GoogleAuthSection from '../components/GoogleAuthSection';
import { getLoginNotice, PASSWORD_RESET_NOTICE } from '../utils/loginNotice';
import { getRedirectPath } from '../utils/redirect';
import { validateEmail, validateLoginPassword } from '../utils/validation';

interface LoginFieldErrors {
   email?: string;
   password?: string;
}

export function LoginPage(): ReactElement {
   const navigate: NavigateFunction = useNavigate();
   const location: Location = useLocation();
   const setAuth: (user: User) => void = useAuthStore((authState) => authState.setAuth);
   const [email, setEmail] = useState<string>('');
   const [password, setPassword] = useState<string>('');
   const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
   const redirectPath: string = getRedirectPath(location.state);
   const isRedirectedFromProtectedPage: boolean = redirectPath !== '/';
   const isPasswordResetNotice: boolean = getLoginNotice(location.state) === PASSWORD_RESET_NOTICE;

   function handleLoginSuccess(loginResponse: LoginResponse): void {
      setAuth(loginResponse.user);
      navigate(redirectPath, { replace: true });
   }

   const loginMutation: UseMutationResult<LoginResponse, unknown, LoginRequest> = useMutation<
      LoginResponse,
      unknown,
      LoginRequest
   >({
      mutationFn: login,
      onSuccess: handleLoginSuccess,
   });

   const serverFieldErrors: Record<string, string> = loginMutation.isError ? getFieldErrors(loginMutation.error) : {};
   const hasServerFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const nextFieldErrors: LoginFieldErrors = {
         email: validateEmail(email),
         password: validateLoginPassword(password),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.email || nextFieldErrors.password) {
         return;
      }
      loginMutation.mutate({ email: email.trim(), password });
   }

   return (
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-ink-100 sm:p-10">
         <div className="mb-8 space-y-2">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-gold-100 text-brand-600">
               <LogIn className="size-6" aria-hidden="true" />
            </div>
            <h1 className="pt-2 text-3xl font-extrabold tracking-tight text-ink-900">Chào mừng trở lại</h1>
            <p className="text-[15px] text-ink-500">Đăng nhập để tiếp tục đặt vé và quản lý tài khoản của bạn.</p>
         </div>

         <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {isPasswordResetNotice && !loginMutation.isError && (
               <Alert variant="success">Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.</Alert>
            )}
            {isRedirectedFromProtectedPage && !isPasswordResetNotice && !loginMutation.isError && (
               <Alert variant="info">Vui lòng đăng nhập để tiếp tục.</Alert>
            )}
            {loginMutation.isError && !hasServerFieldErrors && (
               <Alert variant="error">{getErrorMessage(loginMutation.error)}</Alert>
            )}

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
               disabled={loginMutation.isPending}
               autoFocus
            />
            <TextField
               id="password"
               label="Mật khẩu"
               type="password"
               icon={Lock}
               value={password}
               onChange={setPassword}
               placeholder="Nhập mật khẩu"
               autoComplete="current-password"
               error={fieldErrors.password ?? serverFieldErrors.password}
               disabled={loginMutation.isPending}
            />
            <div className="-mt-2 text-right">
               <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
               >
                  Quên mật khẩu?
               </Link>
            </div>

            <Button type="submit" size="lg" fullWidth isLoading={loginMutation.isPending}>
               {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
         </form>

         <GoogleAuthSection />

         <p className="mt-8 text-center text-sm text-ink-500">
            Chưa có tài khoản?{' '}
            <Link
               to="/register"
               state={location.state}
               className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
               Đăng ký ngay
            </Link>
         </p>
      </div>
   );
}

export default LoginPage;
