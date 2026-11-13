import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type {
   FnbDeliveryLog,
   FnbPickupDeliverRequest,
   FnbPickupQueue,
   FnbPickupScanRequest,
   FnbPickupScanResponse,
} from '@/types/staff/fnbPickup';

export async function scanFnbPickup(fnbPickupScanRequest: FnbPickupScanRequest): Promise<FnbPickupScanResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbPickupScanResponse>> = await axiosInstance.post<
      ApiResponse<FnbPickupScanResponse>
   >('/staff/fnb-pickup/scan', fnbPickupScanRequest);
   return axiosResponse.data.data;
}

export async function deliverFnbPickup(
   fnbPickupDeliverRequest: FnbPickupDeliverRequest,
): Promise<FnbPickupScanResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbPickupScanResponse>> = await axiosInstance.post<
      ApiResponse<FnbPickupScanResponse>
   >('/staff/fnb-pickup/deliver', fnbPickupDeliverRequest);
   return axiosResponse.data.data;
}

export async function getFnbPickupQueue(cinemaId: number): Promise<FnbPickupQueue> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbPickupQueue>> = await axiosInstance.get<
      ApiResponse<FnbPickupQueue>
   >('/staff/fnb-pickup/queue', { params: { cinemaId } });
   return axiosResponse.data.data;
}

export async function getFnbPickupHistory(cinemaId: number): Promise<FnbDeliveryLog[]> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbDeliveryLog[]>> = await axiosInstance.get<
      ApiResponse<FnbDeliveryLog[]>
   >('/staff/fnb-pickup/history', { params: { cinemaId } });
   return axiosResponse.data.data;
}
