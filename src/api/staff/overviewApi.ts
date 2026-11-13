import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { StaffOverview } from '@/types/staff/overview';

export async function getStaffOverview(cinemaId: number): Promise<StaffOverview> {
   const axiosResponse: AxiosResponse<ApiResponse<StaffOverview>> = await axiosInstance.get<ApiResponse<StaffOverview>>(
      '/staff/overview',
      { params: { cinemaId } },
   );
   return axiosResponse.data.data;
}
