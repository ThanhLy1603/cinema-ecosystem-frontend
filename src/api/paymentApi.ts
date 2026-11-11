import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { GatewayCallbackResult, PaymentResult, PaymentUrl, SimulatePaymentRequest } from '@/types/payment/payment';

export async function createVnpayPayment(): Promise<PaymentUrl> {
   const axiosResponse: AxiosResponse<ApiResponse<PaymentUrl>> =
      await axiosInstance.post<ApiResponse<PaymentUrl>>('/payments/vnpay/create');
   return axiosResponse.data.data;
}

export async function getPaymentResult(transactionRef: string): Promise<PaymentResult> {
   const axiosResponse: AxiosResponse<ApiResponse<PaymentResult>> = await axiosInstance.get<ApiResponse<PaymentResult>>(
      `/payments/result/${encodeURIComponent(transactionRef)}`,
   );
   return axiosResponse.data.data;
}

export async function simulateGatewayCallback(
   simulatePaymentRequest: SimulatePaymentRequest,
): Promise<GatewayCallbackResult> {
   const axiosResponse: AxiosResponse<ApiResponse<GatewayCallbackResult>> = await axiosInstance.post<
      ApiResponse<GatewayCallbackResult>
   >('/payments/simulator/complete', simulatePaymentRequest);
   return axiosResponse.data.data;
}
