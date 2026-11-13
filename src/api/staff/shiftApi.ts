import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type { CloseShiftRequest, OpenShiftRequest, Shift, ShiftReport } from '@/types/staff/shift';

export async function openShift(openShiftRequest: OpenShiftRequest): Promise<ShiftReport> {
   const axiosResponse: AxiosResponse<ApiResponse<ShiftReport>> = await axiosInstance.post<ApiResponse<ShiftReport>>(
      '/staff/shifts/open',
      openShiftRequest,
   );
   return axiosResponse.data.data;
}

export async function getCurrentShift(): Promise<ShiftReport | null> {
   const axiosResponse: AxiosResponse<ApiResponse<ShiftReport | null>> =
      await axiosInstance.get<ApiResponse<ShiftReport | null>>('/staff/shifts/current');
   return axiosResponse.data.data ?? null;
}

export async function closeShift(closeShiftRequest: CloseShiftRequest): Promise<ShiftReport> {
   const axiosResponse: AxiosResponse<ApiResponse<ShiftReport>> = await axiosInstance.post<ApiResponse<ShiftReport>>(
      '/staff/shifts/close',
      closeShiftRequest,
   );
   return axiosResponse.data.data;
}

export async function getMyShifts(): Promise<Shift[]> {
   const axiosResponse: AxiosResponse<ApiResponse<Shift[]>> =
      await axiosInstance.get<ApiResponse<Shift[]>>('/staff/shifts');
   return axiosResponse.data.data;
}

export async function getShiftReport(shiftId: number): Promise<ShiftReport> {
   const axiosResponse: AxiosResponse<ApiResponse<ShiftReport>> = await axiosInstance.get<ApiResponse<ShiftReport>>(
      `/staff/shifts/${shiftId}`,
   );
   return axiosResponse.data.data;
}
