import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { BookingFnb, BookingFnbRequest } from '@/types/booking/bookingFnb';
import type { SeatHold } from '@/types/booking/seatHold';
import type { ShowtimeSeatMap } from '@/types/booking/seatMap';
import type { ApiResponse } from '@/types/common/api';

export async function getShowtimeSeatMap(showtimeId: number): Promise<ShowtimeSeatMap> {
   const axiosResponse: AxiosResponse<ApiResponse<ShowtimeSeatMap>> = await axiosInstance.get<
      ApiResponse<ShowtimeSeatMap>
   >(`/showtimes/public/${showtimeId}/seat-map`);
   return axiosResponse.data.data;
}

export async function holdSeat(showtimeId: number, seatId: number): Promise<SeatHold> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatHold>> = await axiosInstance.post<ApiResponse<SeatHold>>(
      `/bookings/showtimes/${showtimeId}/seats/${seatId}/hold`,
   );
   return axiosResponse.data.data;
}

export async function releaseSeat(showtimeId: number, seatId: number): Promise<SeatHold> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatHold>> = await axiosInstance.delete<ApiResponse<SeatHold>>(
      `/bookings/showtimes/${showtimeId}/seats/${seatId}/hold`,
   );
   return axiosResponse.data.data;
}

export async function getMySeatHold(showtimeId: number): Promise<SeatHold> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatHold>> = await axiosInstance.get<ApiResponse<SeatHold>>(
      `/bookings/showtimes/${showtimeId}/my-hold`,
   );
   return axiosResponse.data.data;
}

export async function cancelPendingBooking(): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>('/bookings/pending');
}

export async function getPendingFnb(): Promise<BookingFnb> {
   const axiosResponse: AxiosResponse<ApiResponse<BookingFnb>> =
      await axiosInstance.get<ApiResponse<BookingFnb>>('/bookings/pending/fnb');
   return axiosResponse.data.data;
}

export async function replacePendingFnb(bookingFnbRequest: BookingFnbRequest): Promise<BookingFnb> {
   const axiosResponse: AxiosResponse<ApiResponse<BookingFnb>> = await axiosInstance.put<ApiResponse<BookingFnb>>(
      '/bookings/pending/fnb',
      bookingFnbRequest,
   );
   return axiosResponse.data.data;
}
