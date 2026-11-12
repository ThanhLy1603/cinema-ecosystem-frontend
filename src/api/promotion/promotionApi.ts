import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { PublicPromotion } from '@/types/promotion/promotion';

export async function getPublicPromotions(): Promise<PublicPromotion[]> {
   const axiosResponse: AxiosResponse<ApiResponse<PublicPromotion[]>> =
      await axiosInstance.get<ApiResponse<PublicPromotion[]>>('/promotions/public');
   return axiosResponse.data.data;
}
