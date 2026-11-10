import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { AssignBranchesRequest, CreateStaffRequest, StaffResponse, UpdateStaffRequest } from '@/types/auth/staff';

export async function createStaff(createStaffRequest: CreateStaffRequest): Promise<StaffResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<StaffResponse>> = await axiosInstance.post<
      ApiResponse<StaffResponse>
   >('/admin/staff', createStaffRequest);
   return axiosResponse.data.data;
}

export async function updateStaff(userId: number, updateStaffRequest: UpdateStaffRequest): Promise<StaffResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<StaffResponse>> = await axiosInstance.put<ApiResponse<StaffResponse>>(
      `/admin/staff/${userId}`,
      updateStaffRequest,
   );
   return axiosResponse.data.data;
}

export async function assignBranches(
   userId: number,
   assignBranchesRequest: AssignBranchesRequest,
): Promise<StaffResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<StaffResponse>> = await axiosInstance.put<ApiResponse<StaffResponse>>(
      `/admin/staff/${userId}/branches`,
      assignBranchesRequest,
   );
   return axiosResponse.data.data;
}
