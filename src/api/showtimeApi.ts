import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common/api';
import type {
   AdminShowtimeSearchParams,
   BulkShowtimeResult,
   MovieInfo,
   PublicMovieShowtimes,
   Showtime,
   ShowtimeDayCopyRequest,
   ShowtimeDuplicateRequest,
   ShowtimeRequest,
} from '@/types/showtime/showtime';

export async function getPublicShowtimes(
   cinemaId: number,
   date: string,
   movieId: number | null,
): Promise<PublicMovieShowtimes[]> {
   const axiosResponse: AxiosResponse<ApiResponse<PublicMovieShowtimes[]>> = await axiosInstance.get<
      ApiResponse<PublicMovieShowtimes[]>
   >('/showtimes/public', { params: { cinemaId, date, movieId: movieId ?? undefined } });
   return axiosResponse.data.data;
}

export async function listAdminShowtimes(adminShowtimeSearchParams: AdminShowtimeSearchParams): Promise<Showtime[]> {
   const axiosResponse: AxiosResponse<ApiResponse<Showtime[]>> = await axiosInstance.get<ApiResponse<Showtime[]>>(
      '/admin/showtimes',
      { params: adminShowtimeSearchParams },
   );
   return axiosResponse.data.data;
}

export async function getSchedulableMovies(): Promise<MovieInfo[]> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieInfo[]>> = await axiosInstance.get<ApiResponse<MovieInfo[]>>(
      '/admin/showtimes/movie-options',
   );
   return axiosResponse.data.data;
}

export async function createShowtime(showtimeRequest: ShowtimeRequest): Promise<Showtime> {
   const axiosResponse: AxiosResponse<ApiResponse<Showtime>> = await axiosInstance.post<ApiResponse<Showtime>>(
      '/admin/showtimes',
      showtimeRequest,
   );
   return axiosResponse.data.data;
}

export async function updateShowtime(showtimeId: number, showtimeRequest: ShowtimeRequest): Promise<Showtime> {
   const axiosResponse: AxiosResponse<ApiResponse<Showtime>> = await axiosInstance.put<ApiResponse<Showtime>>(
      `/admin/showtimes/${showtimeId}`,
      showtimeRequest,
   );
   return axiosResponse.data.data;
}

export async function cancelShowtime(showtimeId: number): Promise<Showtime> {
   const axiosResponse: AxiosResponse<ApiResponse<Showtime>> = await axiosInstance.post<ApiResponse<Showtime>>(
      `/admin/showtimes/${showtimeId}/cancel`,
   );
   return axiosResponse.data.data;
}

export async function duplicateShowtime(
   showtimeDuplicateRequest: ShowtimeDuplicateRequest,
): Promise<BulkShowtimeResult> {
   const axiosResponse: AxiosResponse<ApiResponse<BulkShowtimeResult>> = await axiosInstance.post<
      ApiResponse<BulkShowtimeResult>
   >('/admin/showtimes/duplicate', showtimeDuplicateRequest);
   return axiosResponse.data.data;
}

export async function copyShowtimeDay(showtimeDayCopyRequest: ShowtimeDayCopyRequest): Promise<BulkShowtimeResult> {
   const axiosResponse: AxiosResponse<ApiResponse<BulkShowtimeResult>> = await axiosInstance.post<
      ApiResponse<BulkShowtimeResult>
   >('/admin/showtimes/copy-day', showtimeDayCopyRequest);
   return axiosResponse.data.data;
}
