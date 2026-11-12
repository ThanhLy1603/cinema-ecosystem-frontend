import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { PriceRule, PriceRuleRequest, PriceSimulationRequest, ShowtimePrice } from '@/types/showtime/pricing';

export async function getPublicShowtimePrice(showtimeId: number): Promise<ShowtimePrice> {
   const axiosResponse: AxiosResponse<ApiResponse<ShowtimePrice>> = await axiosInstance.get<ApiResponse<ShowtimePrice>>(
      `/showtimes/public/${showtimeId}/prices`,
   );
   return axiosResponse.data.data;
}

export async function listPriceRules(deleted: boolean): Promise<PriceRule[]> {
   const axiosResponse: AxiosResponse<ApiResponse<PriceRule[]>> = await axiosInstance.get<ApiResponse<PriceRule[]>>(
      '/admin/price-rules',
      { params: { deleted } },
   );
   return axiosResponse.data.data;
}

export async function createPriceRule(priceRuleRequest: PriceRuleRequest): Promise<PriceRule> {
   const axiosResponse: AxiosResponse<ApiResponse<PriceRule>> = await axiosInstance.post<ApiResponse<PriceRule>>(
      '/admin/price-rules',
      priceRuleRequest,
   );
   return axiosResponse.data.data;
}

export async function updatePriceRule(priceRuleId: number, priceRuleRequest: PriceRuleRequest): Promise<PriceRule> {
   const axiosResponse: AxiosResponse<ApiResponse<PriceRule>> = await axiosInstance.put<ApiResponse<PriceRule>>(
      `/admin/price-rules/${priceRuleId}`,
      priceRuleRequest,
   );
   return axiosResponse.data.data;
}

export async function deletePriceRule(priceRuleId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/price-rules/${priceRuleId}`);
}

export async function restorePriceRule(priceRuleId: number): Promise<PriceRule> {
   const axiosResponse: AxiosResponse<ApiResponse<PriceRule>> = await axiosInstance.post<ApiResponse<PriceRule>>(
      `/admin/price-rules/${priceRuleId}/restore`,
   );
   return axiosResponse.data.data;
}

export async function simulatePrices(priceSimulationRequest: PriceSimulationRequest): Promise<ShowtimePrice> {
   const axiosResponse: AxiosResponse<ApiResponse<ShowtimePrice>> = await axiosInstance.post<
      ApiResponse<ShowtimePrice>
   >('/admin/price-rules/simulate', priceSimulationRequest);
   return axiosResponse.data.data;
}
