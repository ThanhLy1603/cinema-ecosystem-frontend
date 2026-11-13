import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { CounterFnbCheckoutRequest, CounterFnbReceipt } from '@/types/staff/fnbSales';
import type { CounterReceiptFile } from '@/types/staff/ticketSales';

export async function checkoutFnbSale(
   counterFnbCheckoutRequest: CounterFnbCheckoutRequest,
): Promise<CounterFnbReceipt> {
   const axiosResponse: AxiosResponse<ApiResponse<CounterFnbReceipt>> = await axiosInstance.post<
      ApiResponse<CounterFnbReceipt>
   >('/staff/fnb-sales/checkout', counterFnbCheckoutRequest);
   return axiosResponse.data.data;
}

export async function saveFnbReceiptFile(orderCode: string): Promise<CounterReceiptFile> {
   const axiosResponse: AxiosResponse<ApiResponse<CounterReceiptFile>> = await axiosInstance.post<
      ApiResponse<CounterReceiptFile>
   >(`/staff/fnb-sales/receipts/${encodeURIComponent(orderCode)}/save`);
   return axiosResponse.data.data;
}
