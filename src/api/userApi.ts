import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/api';
import type { ChangePasswordRequest, LoginResponse, UpdateProfileRequest, UserProfile } from '@/types/auth';

export async function getMyProfile(): Promise<UserProfile> {
   const axiosResponse: AxiosResponse<ApiResponse<UserProfile>> =
      await axiosInstance.get<ApiResponse<UserProfile>>('/users/me');
   return axiosResponse.data.data;
}

export async function updateMyProfile(updateProfileRequest: UpdateProfileRequest): Promise<UserProfile> {
   const axiosResponse: AxiosResponse<ApiResponse<UserProfile>> = await axiosInstance.put<ApiResponse<UserProfile>>(
      '/users/me',
      updateProfileRequest,
   );
   return axiosResponse.data.data;
}

export async function changeMyPassword(changePasswordRequest: ChangePasswordRequest): Promise<LoginResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<LoginResponse>> = await axiosInstance.put<ApiResponse<LoginResponse>>(
      '/users/me/password',
      changePasswordRequest,
   );
   return axiosResponse.data.data;
}
