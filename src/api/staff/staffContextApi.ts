import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { StaffContext } from '@/types/staff/staffContext';

export async function getStaffContext(): Promise<StaffContext> {
   const axiosResponse: AxiosResponse<ApiResponse<StaffContext>> =
      await axiosInstance.get<ApiResponse<StaffContext>>('/staff/context');
   return axiosResponse.data.data;
}
