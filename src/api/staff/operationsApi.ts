import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common/api';
import type { CheckInResultCode } from '@/types/staff/checkIn';
import type {
   AuditAction,
   BookingException,
   BookingExceptionActionRequest,
   OperationsAuditLog,
   OperationsFilter,
   OperationsFnbDelivery,
   OperationsScanLog,
   RevenueReport,
} from '@/types/staff/operations';
import type { Shift, ShiftReport } from '@/types/staff/shift';

const BASE_PATH: string = '/admin/operations';

export async function getScanLogs(
   operationsFilter: OperationsFilter,
   resultCode?: CheckInResultCode,
): Promise<PageResponse<OperationsScanLog>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<OperationsScanLog>>> = await axiosInstance.get<
      ApiResponse<PageResponse<OperationsScanLog>>
   >(`${BASE_PATH}/scan-logs`, { params: { ...operationsFilter, resultCode } });
   return axiosResponse.data.data;
}

export async function getFnbDeliveries(
   operationsFilter: OperationsFilter,
): Promise<PageResponse<OperationsFnbDelivery>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<OperationsFnbDelivery>>> = await axiosInstance.get<
      ApiResponse<PageResponse<OperationsFnbDelivery>>
   >(`${BASE_PATH}/fnb-deliveries`, { params: operationsFilter });
   return axiosResponse.data.data;
}

export async function getOperationsAuditLogs(
   operationsFilter: OperationsFilter,
   action?: AuditAction,
): Promise<PageResponse<OperationsAuditLog>> {
   const { staffUserId, ...otherFilter }: OperationsFilter = operationsFilter;
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<OperationsAuditLog>>> = await axiosInstance.get<
      ApiResponse<PageResponse<OperationsAuditLog>>
   >(`${BASE_PATH}/audit-logs`, { params: { ...otherFilter, actorUserId: staffUserId, action } });
   return axiosResponse.data.data;
}

export async function getRevenueReport(cinemaId: number | undefined, from: string, to: string): Promise<RevenueReport> {
   const axiosResponse: AxiosResponse<ApiResponse<RevenueReport>> = await axiosInstance.get<ApiResponse<RevenueReport>>(
      `${BASE_PATH}/revenue`,
      { params: { cinemaId, from, to } },
   );
   return axiosResponse.data.data;
}

export async function getOperationsShifts(operationsFilter: OperationsFilter): Promise<PageResponse<Shift>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<Shift>>> = await axiosInstance.get<
      ApiResponse<PageResponse<Shift>>
   >(`${BASE_PATH}/shifts`, { params: operationsFilter });
   return axiosResponse.data.data;
}

export async function getOperationsShiftReport(shiftId: number): Promise<ShiftReport> {
   const axiosResponse: AxiosResponse<ApiResponse<ShiftReport>> = await axiosInstance.get<ApiResponse<ShiftReport>>(
      `${BASE_PATH}/shifts/${shiftId}`,
   );
   return axiosResponse.data.data;
}

export async function lookupBookingException(code: string): Promise<BookingException> {
   const axiosResponse: AxiosResponse<ApiResponse<BookingException>> = await axiosInstance.get<
      ApiResponse<BookingException>
   >(`${BASE_PATH}/bookings/lookup`, { params: { code } });
   return axiosResponse.data.data;
}

export async function reissueBookingTicket(
   bookingCode: string,
   bookingExceptionActionRequest: BookingExceptionActionRequest,
): Promise<BookingException> {
   const axiosResponse: AxiosResponse<ApiResponse<BookingException>> = await axiosInstance.post<
      ApiResponse<BookingException>
   >(`${BASE_PATH}/bookings/${encodeURIComponent(bookingCode)}/reissue`, bookingExceptionActionRequest);
   return axiosResponse.data.data;
}

export async function refundBooking(
   bookingCode: string,
   bookingExceptionActionRequest: BookingExceptionActionRequest,
): Promise<BookingException> {
   const axiosResponse: AxiosResponse<ApiResponse<BookingException>> = await axiosInstance.post<
      ApiResponse<BookingException>
   >(`${BASE_PATH}/bookings/${encodeURIComponent(bookingCode)}/refund`, bookingExceptionActionRequest);
   return axiosResponse.data.data;
}
