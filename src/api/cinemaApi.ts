import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/api';
import type { CinemaOption } from '@/types/cinema';

export async function getCinemaOptions(): Promise<CinemaOption[]> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaOption[]>> =
      await axiosInstance.get<ApiResponse<CinemaOption[]>>('/admin/cinema-options');
   return axiosResponse.data.data;
}
