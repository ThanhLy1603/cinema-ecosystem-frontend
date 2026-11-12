import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common/api';
import type {
   AdminMovieSearchParams,
   Genre,
   GenreRequest,
   Movie,
   MovieDetail,
   MovieRatingSummary,
   MovieRequest,
   MovieSearchParams,
   Person,
   PersonOption,
   PersonRequest,
} from '@/types/movie/movie';

export async function searchPublicMovies(movieSearchParams: MovieSearchParams): Promise<PageResponse<Movie>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<Movie>>> = await axiosInstance.get<
      ApiResponse<PageResponse<Movie>>
   >('/movies/public', { params: movieSearchParams });
   return axiosResponse.data.data;
}

export async function getMovieRatingSummaries(movieIds: number[]): Promise<MovieRatingSummary[]> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieRatingSummary[]>> = await axiosInstance.get<
      ApiResponse<MovieRatingSummary[]>
   >('/movies/public/ratings', { params: { movieIds: movieIds.join(',') } });
   return axiosResponse.data.data;
}

export async function getPublicMovie(movieSlug: string): Promise<MovieDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieDetail>> = await axiosInstance.get<ApiResponse<MovieDetail>>(
      `/movies/public/slug/${encodeURIComponent(movieSlug)}`,
   );
   return axiosResponse.data.data;
}

export async function getPublicGenres(): Promise<Genre[]> {
   const axiosResponse: AxiosResponse<ApiResponse<Genre[]>> =
      await axiosInstance.get<ApiResponse<Genre[]>>('/movies/public/genres');
   return axiosResponse.data.data;
}

export async function searchAdminMovies(adminMovieSearchParams: AdminMovieSearchParams): Promise<PageResponse<Movie>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<Movie>>> = await axiosInstance.get<
      ApiResponse<PageResponse<Movie>>
   >('/admin/movies', { params: adminMovieSearchParams });
   return axiosResponse.data.data;
}

export async function getAdminMovie(movieId: number): Promise<MovieDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieDetail>> = await axiosInstance.get<ApiResponse<MovieDetail>>(
      `/admin/movies/${movieId}`,
   );
   return axiosResponse.data.data;
}

export async function createMovie(movieRequest: MovieRequest): Promise<MovieDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieDetail>> = await axiosInstance.post<ApiResponse<MovieDetail>>(
      '/admin/movies',
      movieRequest,
   );
   return axiosResponse.data.data;
}

export async function updateMovie(movieId: number, movieRequest: MovieRequest): Promise<MovieDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieDetail>> = await axiosInstance.put<ApiResponse<MovieDetail>>(
      `/admin/movies/${movieId}`,
      movieRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteMovie(movieId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/movies/${movieId}`);
}

export async function restoreMovie(movieId: number): Promise<MovieDetail> {
   const axiosResponse: AxiosResponse<ApiResponse<MovieDetail>> = await axiosInstance.post<ApiResponse<MovieDetail>>(
      `/admin/movies/${movieId}/restore`,
   );
   return axiosResponse.data.data;
}

export async function getAdminGenres(): Promise<Genre[]> {
   const axiosResponse: AxiosResponse<ApiResponse<Genre[]>> =
      await axiosInstance.get<ApiResponse<Genre[]>>('/admin/genres');
   return axiosResponse.data.data;
}

export async function createGenre(genreRequest: GenreRequest): Promise<Genre> {
   const axiosResponse: AxiosResponse<ApiResponse<Genre>> = await axiosInstance.post<ApiResponse<Genre>>(
      '/admin/genres',
      genreRequest,
   );
   return axiosResponse.data.data;
}

export async function updateGenre(genreId: number, genreRequest: GenreRequest): Promise<Genre> {
   const axiosResponse: AxiosResponse<ApiResponse<Genre>> = await axiosInstance.put<ApiResponse<Genre>>(
      `/admin/genres/${genreId}`,
      genreRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteGenre(genreId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/genres/${genreId}`);
}

export async function searchAdminPersons(
   keyword: string | undefined,
   page: number,
   size: number,
): Promise<PageResponse<Person>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<Person>>> = await axiosInstance.get<
      ApiResponse<PageResponse<Person>>
   >('/admin/persons', { params: { keyword, page, size } });
   return axiosResponse.data.data;
}

export async function getPersonOptions(): Promise<PersonOption[]> {
   const axiosResponse: AxiosResponse<ApiResponse<PersonOption[]>> =
      await axiosInstance.get<ApiResponse<PersonOption[]>>('/admin/persons/options');
   return axiosResponse.data.data;
}

export async function createPerson(personRequest: PersonRequest): Promise<Person> {
   const axiosResponse: AxiosResponse<ApiResponse<Person>> = await axiosInstance.post<ApiResponse<Person>>(
      '/admin/persons',
      personRequest,
   );
   return axiosResponse.data.data;
}

export async function updatePerson(personId: number, personRequest: PersonRequest): Promise<Person> {
   const axiosResponse: AxiosResponse<ApiResponse<Person>> = await axiosInstance.put<ApiResponse<Person>>(
      `/admin/persons/${personId}`,
      personRequest,
   );
   return axiosResponse.data.data;
}

export async function deletePerson(personId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/persons/${personId}`);
}
