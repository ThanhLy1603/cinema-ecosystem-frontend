import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/api';
import type { GenerateSeatsRequest, Hall, HallRequest, SeatLayout, SeatMapRequest } from '@/types/cinema';

export async function createHall(cinemaId: number, hallRequest: HallRequest): Promise<Hall> {
   const axiosResponse: AxiosResponse<ApiResponse<Hall>> = await axiosInstance.post<ApiResponse<Hall>>(
      `/admin/cinemas/${cinemaId}/halls`,
      hallRequest,
   );
   return axiosResponse.data.data;
}

export async function updateHall(hallId: number, hallRequest: HallRequest): Promise<Hall> {
   const axiosResponse: AxiosResponse<ApiResponse<Hall>> = await axiosInstance.put<ApiResponse<Hall>>(
      `/admin/halls/${hallId}`,
      hallRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteHall(hallId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/halls/${hallId}`);
}

export async function getSeatMap(hallId: number): Promise<SeatLayout> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatLayout>> = await axiosInstance.get<ApiResponse<SeatLayout>>(
      `/admin/halls/${hallId}/seat-map`,
   );
   return axiosResponse.data.data;
}

export async function saveSeatMap(hallId: number, seatMapRequest: SeatMapRequest): Promise<SeatLayout> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatLayout>> = await axiosInstance.put<ApiResponse<SeatLayout>>(
      `/admin/halls/${hallId}/seat-map`,
      seatMapRequest,
   );
   return axiosResponse.data.data;
}

export async function generateSeats(hallId: number, generateSeatsRequest: GenerateSeatsRequest): Promise<SeatLayout> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatLayout>> = await axiosInstance.post<ApiResponse<SeatLayout>>(
      `/admin/halls/${hallId}/generate-seats`,
      generateSeatsRequest,
   );
   return axiosResponse.data.data;
}
