import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type {
   CounterCheckoutRequest,
   CounterReceipt,
   CounterReceiptFile,
   CustomerLookup,
} from '@/types/staff/ticketSales';

export async function checkoutTicketSale(counterCheckoutRequest: CounterCheckoutRequest): Promise<CounterReceipt> {
   const axiosResponse: AxiosResponse<ApiResponse<CounterReceipt>> = await axiosInstance.post<
      ApiResponse<CounterReceipt>
   >('/staff/ticket-sales/checkout', counterCheckoutRequest);
   return axiosResponse.data.data;
}

export async function lookupCustomer(keyword: string): Promise<CustomerLookup | null> {
   const axiosResponse: AxiosResponse<ApiResponse<CustomerLookup | null>> = await axiosInstance.get<
      ApiResponse<CustomerLookup | null>
   >('/staff/ticket-sales/customers/lookup', { params: { keyword } });
   return axiosResponse.data.data ?? null;
}

export async function saveCounterReceiptFile(bookingCode: string): Promise<CounterReceiptFile> {
   const axiosResponse: AxiosResponse<ApiResponse<CounterReceiptFile>> = await axiosInstance.post<
      ApiResponse<CounterReceiptFile>
   >(`/staff/ticket-sales/receipts/${encodeURIComponent(bookingCode)}/save`);
   return axiosResponse.data.data;
}
