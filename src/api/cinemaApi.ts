import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common/api';
import type {
   Cinema,
   CinemaDetail,
   CinemaOption,
   CinemaRequest,
   CinemaSearchParams,
   Facility,
   FacilityRequest,
   SeatLayout,
   SeatType,
} from '@/types/cinema/cinema';

export async function getCinemaOptions(): Promise<CinemaOption[]> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaOption[]>> =
      await axiosInstance.get<ApiResponse<CinemaOption[]>>('/admin/cinema-options');
   return axiosResponse.data.data;
}

export async function getPublicCinemas(city: string | undefined): Promise<Cinema[]> {
   const axiosResponse: AxiosResponse<ApiResponse<Cinema[]>> = await axiosInstance.get<ApiResponse<Cinema[]>>(
      '/cinemas/public',
      { params: { city } },
   );
   return axiosResponse.data.data;
}

export async function getPublicCities(): Promise<string[]> {
   const axiosResponse: AxiosResponse<ApiResponse<string[]>> =
      await axiosInstance.get<ApiResponse<string[]>>('/cinemas/public/cities');
   return axiosResponse.data.data;
}

export async function getPublicCinema(slug: string): Promise<CinemaDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaDetail>> = await axiosInstance.get<ApiResponse<CinemaDetail>>(
      `/cinemas/public/${encodeURIComponent(slug)}`,
   );
   return axiosResponse.data.data;
}

export async function getSeatTypes(): Promise<SeatType[]> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatType[]>> =
      await axiosInstance.get<ApiResponse<SeatType[]>>('/seat-types');
   return axiosResponse.data.data;
}

export async function getPublicSeatLayout(hallId: number): Promise<SeatLayout> {
   const axiosResponse: AxiosResponse<ApiResponse<SeatLayout>> = await axiosInstance.get<ApiResponse<SeatLayout>>(
      `/halls/${hallId}/seat-layout`,
   );
   return axiosResponse.data.data;
}

export async function searchAdminCinemas(cinemaSearchParams: CinemaSearchParams): Promise<PageResponse<Cinema>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<Cinema>>> = await axiosInstance.get<
      ApiResponse<PageResponse<Cinema>>
   >('/admin/cinemas', { params: cinemaSearchParams });
   return axiosResponse.data.data;
}

export async function getAdminCinema(cinemaId: number): Promise<CinemaDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaDetail>> = await axiosInstance.get<ApiResponse<CinemaDetail>>(
      `/admin/cinemas/${cinemaId}`,
   );
   return axiosResponse.data.data;
}

export async function createCinema(cinemaRequest: CinemaRequest): Promise<CinemaDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaDetail>> = await axiosInstance.post<ApiResponse<CinemaDetail>>(
      '/admin/cinemas',
      cinemaRequest,
   );
   return axiosResponse.data.data;
}

export async function updateCinema(cinemaId: number, cinemaRequest: CinemaRequest): Promise<CinemaDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaDetail>> = await axiosInstance.put<ApiResponse<CinemaDetail>>(
      `/admin/cinemas/${cinemaId}`,
      cinemaRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteCinema(cinemaId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/cinemas/${cinemaId}`);
}

export async function getFacilities(deleted: boolean): Promise<Facility[]> {
   const axiosResponse: AxiosResponse<ApiResponse<Facility[]>> = await axiosInstance.get<ApiResponse<Facility[]>>(
      '/admin/cinema-facilities',
      { params: { deleted } },
   );
   return axiosResponse.data.data;
}

export async function createFacility(facilityRequest: FacilityRequest): Promise<Facility> {
   const axiosResponse: AxiosResponse<ApiResponse<Facility>> = await axiosInstance.post<ApiResponse<Facility>>(
      '/admin/cinema-facilities',
      facilityRequest,
   );
   return axiosResponse.data.data;
}

export async function updateFacility(facilityId: number, facilityRequest: FacilityRequest): Promise<Facility> {
   const axiosResponse: AxiosResponse<ApiResponse<Facility>> = await axiosInstance.put<ApiResponse<Facility>>(
      `/admin/cinema-facilities/${facilityId}`,
      facilityRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteFacility(facilityId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/cinema-facilities/${facilityId}`);
}

export async function restoreCinema(cinemaId: number): Promise<CinemaDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<CinemaDetail>> = await axiosInstance.post<ApiResponse<CinemaDetail>>(
      `/admin/cinemas/${cinemaId}/restore`,
   );
   return axiosResponse.data.data;
}

export async function restoreFacility(facilityId: number): Promise<Facility> {
   const axiosResponse: AxiosResponse<ApiResponse<Facility>> = await axiosInstance.post<ApiResponse<Facility>>(
      `/admin/cinema-facilities/${facilityId}/restore`,
   );
   return axiosResponse.data.data;
}
