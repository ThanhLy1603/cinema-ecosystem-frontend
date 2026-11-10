import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type {
   AdminUser,
   AuditLog,
   UpdateUserInfoRequest,
   UpdateUserRolesRequest,
   UpdateUserStatusRequest,
   UserSearchParams,
} from '@/types/auth/admin';
import type { ApiResponse, PageResponse } from '@/types/common/api';

export async function searchUsers(userSearchParams: UserSearchParams): Promise<PageResponse<AdminUser>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<AdminUser>>> = await axiosInstance.get<
      ApiResponse<PageResponse<AdminUser>>
   >('/admin/users', { params: userSearchParams });
   return axiosResponse.data.data;
}

export async function getAdminUser(userId: number): Promise<AdminUser> {
   const axiosResponse: AxiosResponse<ApiResponse<AdminUser>> = await axiosInstance.get<ApiResponse<AdminUser>>(
      `/admin/users/${userId}`,
   );
   return axiosResponse.data.data;
}

export async function updateUserInfo(userId: number, updateUserInfoRequest: UpdateUserInfoRequest): Promise<AdminUser> {
   const axiosResponse: AxiosResponse<ApiResponse<AdminUser>> = await axiosInstance.put<ApiResponse<AdminUser>>(
      `/admin/users/${userId}`,
      updateUserInfoRequest,
   );
   return axiosResponse.data.data;
}

export async function updateUserStatus(
   userId: number,
   updateUserStatusRequest: UpdateUserStatusRequest,
): Promise<AdminUser> {
   const axiosResponse: AxiosResponse<ApiResponse<AdminUser>> = await axiosInstance.patch<ApiResponse<AdminUser>>(
      `/admin/users/${userId}/status`,
      updateUserStatusRequest,
   );
   return axiosResponse.data.data;
}

export async function updateUserRoles(
   userId: number,
   updateUserRolesRequest: UpdateUserRolesRequest,
): Promise<AdminUser> {
   const axiosResponse: AxiosResponse<ApiResponse<AdminUser>> = await axiosInstance.put<ApiResponse<AdminUser>>(
      `/admin/users/${userId}/roles`,
      updateUserRolesRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteUser(userId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/users/${userId}`);
}

export async function getAuditLogs(userId: number, page: number, size: number): Promise<PageResponse<AuditLog>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<AuditLog>>> = await axiosInstance.get<
      ApiResponse<PageResponse<AuditLog>>
   >(`/admin/users/${userId}/audit-logs`, { params: { page, size } });
   return axiosResponse.data.data;
}
