import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { getPublicGenres, searchPublicMovies } from '@/api/movieApi';
import MovieCard from '@/components/common/MovieCard';
import MovieStatusTabs from '@/components/common/MovieStatusTabs';
import PageBanner from '@/components/common/PageBanner';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/apiError';
import { AGE_RATINGS, MOVIE_STATUSES, MOVIE_STATUS_LABELS } from '@/lib/movieLabels';
import { PUBLIC_GENRES_KEY, publicMovieListKey } from '@/lib/movieQueryKeys';
import type { PageResponse } from '@/types/api';
import type { AgeRating, Genre, Movie, MovieSearchParams, MovieStatus } from '@/types/movie';
import MovieFilterBar, { type MovieFilters } from '../components/MovieFilterBar';

const STATUS_PARAM: string = 'status';
const KEYWORD_PARAM: string = 'keyword';
const GENRE_PARAM: string = 'genreId';
const RATED_PARAM: string = 'rated';
const PAGE_PARAM: string = 'page';
const PAGE_SIZE: number = 12;
const DEFAULT_STATUS: MovieStatus = 'NOW_SHOWING';

function parseStatus(statusParam: string | null): MovieStatus {
   return MOVIE_STATUSES.find((movieStatus) => movieStatus === statusParam) ?? DEFAULT_STATUS;
}

function parseRated(ratedParam: string | null): string {
   return AGE_RATINGS.find((ageRating) => ageRating === ratedParam) ?? '';
}

function parsePositiveInteger(value: string | null): number | undefined {
   const parsedValue: number = Number(value);
   return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
}

function parsePage(pageParam: string | null): number {
   const parsedPage: number = Number(pageParam ?? 0);
   return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 0;
}

function buildSearchParams(movieStatus: MovieStatus, movieFilters: MovieFilters, page: number): URLSearchParams {
   const urlSearchParams: URLSearchParams = new URLSearchParams();
   if (movieStatus !== DEFAULT_STATUS) {
      urlSearchParams.set(STATUS_PARAM, movieStatus);
   }
   if (movieFilters.keyword) {
      urlSearchParams.set(KEYWORD_PARAM, movieFilters.keyword);
   }
   if (movieFilters.genreId) {
      urlSearchParams.set(GENRE_PARAM, movieFilters.genreId);
   }
   if (movieFilters.rated) {
      urlSearchParams.set(RATED_PARAM, movieFilters.rated);
   }
   if (page > 0) {
      urlSearchParams.set(PAGE_PARAM, String(page));
   }
   return urlSearchParams;
}

export function MovieListPage(): ReactElement {
   const [searchParams, setSearchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
   const movieStatus: MovieStatus = parseStatus(searchParams.get(STATUS_PARAM));
   const genreId: number | undefined = parsePositiveInteger(searchParams.get(GENRE_PARAM));
   const movieFilters: MovieFilters = {
      keyword: searchParams.get(KEYWORD_PARAM) ?? '',
      genreId: genreId === undefined ? '' : String(genreId),
      rated: parseRated(searchParams.get(RATED_PARAM)),
   };
   const page: number = parsePage(searchParams.get(PAGE_PARAM));
   const movieSearchParams: MovieSearchParams = {
      keyword: movieFilters.keyword || undefined,
      genreId,
      status: movieStatus,
      rated: (movieFilters.rated || undefined) as AgeRating | undefined,
      page,
      size: PAGE_SIZE,
   };

   const genresQuery: UseQueryResult<Genre[]> = useQuery<Genre[]>({
      queryKey: PUBLIC_GENRES_KEY,
      queryFn: getPublicGenres,
   });
   const moviesQuery: UseQueryResult<PageResponse<Movie>> = useQuery<PageResponse<Movie>>({
      queryKey: publicMovieListKey(movieSearchParams),
      queryFn: () => searchPublicMovies(movieSearchParams),
      placeholderData: keepPreviousData,
   });

   function handleStatusChange(nextMovieStatus: MovieStatus): void {
      setSearchParams(buildSearchParams(nextMovieStatus, movieFilters, 0));
   }

   function handleFiltersChange(nextMovieFilters: MovieFilters): void {
      setSearchParams(buildSearchParams(movieStatus, nextMovieFilters, 0));
   }

   function handlePageChange(nextPage: number): void {
      setSearchParams(buildSearchParams(movieStatus, movieFilters, nextPage));
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   return (
      <>
         <PageBanner
            title="Phim"
            description={`Khám phá phim ${MOVIE_STATUS_LABELS[movieStatus].toLowerCase()}, xem trailer, dàn diễn viên và nhãn phân loại độ tuổi trước khi đặt vé.`}
         >
            <MovieStatusTabs activeStatus={movieStatus} tone="dark" onChange={handleStatusChange} />
         </PageBanner>

         <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
            <MovieFilterBar
               key={movieFilters.keyword}
               movieFilters={movieFilters}
               genres={genresQuery.data ?? []}
               onChange={handleFiltersChange}
            />

            {moviesQuery.isError && <Alert variant="error">{getErrorMessage(moviesQuery.error)}</Alert>}
            {moviesQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách phim...</p>}
            {moviesQuery.data && moviesQuery.data.content.length === 0 && (
               <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-100">
                  Không tìm thấy phim {MOVIE_STATUS_LABELS[movieStatus].toLowerCase()} phù hợp với bộ lọc.
               </p>
            )}
            {moviesQuery.data && moviesQuery.data.content.length > 0 && (
               <>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                     {moviesQuery.data.content.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                     ))}
                  </div>
                  <Pagination
                     page={moviesQuery.data.page}
                     totalPages={moviesQuery.data.totalPages}
                     totalElements={moviesQuery.data.totalElements}
                     onPageChange={handlePageChange}
                  />
               </>
            )}
         </section>
      </>
   );
}

export default MovieListPage;
