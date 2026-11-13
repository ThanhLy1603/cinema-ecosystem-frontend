import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type {
   TicketCheckInRequest,
   TicketQueue,
   TicketScanLog,
   TicketScanRequest,
   TicketScanResponse,
   TicketUndoRequest,
} from '@/types/staff/checkIn';

export async function scanTicket(ticketScanRequest: TicketScanRequest): Promise<TicketScanResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<TicketScanResponse>> = await axiosInstance.post<
      ApiResponse<TicketScanResponse>
   >('/staff/check-in/scan', ticketScanRequest);
   return axiosResponse.data.data;
}

export async function confirmCheckIn(ticketCheckInRequest: TicketCheckInRequest): Promise<TicketScanResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<TicketScanResponse>> = await axiosInstance.post<
      ApiResponse<TicketScanResponse>
   >('/staff/check-in/confirm', ticketCheckInRequest);
   return axiosResponse.data.data;
}

export async function undoCheckIn(ticketUndoRequest: TicketUndoRequest): Promise<TicketScanResponse> {
   const axiosResponse: AxiosResponse<ApiResponse<TicketScanResponse>> = await axiosInstance.post<
      ApiResponse<TicketScanResponse>
   >('/staff/check-in/undo', ticketUndoRequest);
   return axiosResponse.data.data;
}

export async function getCheckInHistory(cinemaId: number): Promise<TicketScanLog[]> {
   const axiosResponse: AxiosResponse<ApiResponse<TicketScanLog[]>> = await axiosInstance.get<
      ApiResponse<TicketScanLog[]>
   >('/staff/check-in/history', { params: { cinemaId } });
   return axiosResponse.data.data;
}

export async function getCheckInQueue(cinemaId: number): Promise<TicketQueue> {
   const axiosResponse: AxiosResponse<ApiResponse<TicketQueue>> = await axiosInstance.get<ApiResponse<TicketQueue>>(
      '/staff/check-in/queue',
      { params: { cinemaId } },
   );
   return axiosResponse.data.data;
}
