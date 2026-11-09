import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/api';
import type {
   ForgotPasswordRequest,
   GoogleLoginRequest,
   LoginRequest,
   LoginResponse,
   RefreshTokenResponse,
   RegisterRequest,
   ResetPasswordRequest,
   User,
   VerifyEmailRequest,
} from '@/types/auth';

export async function register(registerRequest: RegisterRequest): Promise<User> {
   const axiosResponse: AxiosResponse<ApiResponse<User>> = await axiosInstance.post<ApiResponse<User>>(
      '/auth/register',
      registerRequest,
   );
   return axiosResponse.data.data;
}

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<LoginResponse>> = await axiosInstance.post<
      ApiResponse<LoginResponse>
   >('/auth/login', loginRequest);
   return axiosResponse.data.data;
}

export async function loginWithGoogle(googleLoginRequest: GoogleLoginRequest): Promise<LoginResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<LoginResponse>> = await axiosInstance.post<
      ApiResponse<LoginResponse>
   >('/auth/google', googleLoginRequest);
   return axiosResponse.data.data;
}

export async function refreshSession(): Promise<RefreshTokenResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<RefreshTokenResponse>> =
      await axiosInstance.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh-token');
   return axiosResponse.data.data;
}

export async function logout(): Promise<void> {
   await axiosInstance.post<ApiResponse<null>>('/auth/logout');
}

export async function logoutAll(): Promise<void> {
   await axiosInstance.post<ApiResponse<null>>('/auth/logout-all');
}

export async function forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Promise<string> {
   const axiosResponse: AxiosResponse<ApiResponse<null>> = await axiosInstance.post<ApiResponse<null>>(
      '/auth/forgot-password',
      forgotPasswordRequest,
   );
   return axiosResponse.data.message;
}

export async function resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<void> {
   await axiosInstance.post<ApiResponse<null>>('/auth/reset-password', resetPasswordRequest);
}

export async function verifyEmail(verifyEmailRequest: VerifyEmailRequest): Promise<void> {
   await axiosInstance.post<ApiResponse<null>>('/auth/verify-email', verifyEmailRequest);
}

export async function resendVerification(): Promise<void> {
   await axiosInstance.post<ApiResponse<null>>('/auth/resend-verification');
}
