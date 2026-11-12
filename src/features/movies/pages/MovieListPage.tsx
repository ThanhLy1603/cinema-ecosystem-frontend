import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { getPublicGenres, searchPublicMovies } from '@/api/movieApi';
import MovieCard from '@/components/common/MovieCard';
import MovieStatusTabs from '@/components/common/MovieStatusTabs';
import Reveal from '@/components/common/Reveal';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { useMovieRatings } from '@/lib/movie/useMovieRatings';
import { AGE_RATINGS, MOVIE_STATUSES, MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import { PUBLIC_GENRES_KEY, publicMovieListKey } from '@/lib/movie/movieQueryKeys';
import type { PageResponse } from '@/types/common/api';
import type { AgeRating, Genre, Movie, MovieRatingSummary, MovieSearchParams, MovieStatus } from '@/types/movie/movie';
import MovieFilterBar, { type MovieFilters } from '../components/MovieFilterBar';
import MovieListBanner from '../components/MovieListBanner';

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

   const movieRatings: ReadonlyMap<number, MovieRatingSummary> = useMovieRatings(
      (moviesQuery.data?.content ?? []).map((movie) => movie.id),
   );

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
         <MovieListBanner
            movies={moviesQuery.data?.content ?? []}
            eyebrow="Phim chiếu rạp"
            title={`Phim ${MOVIE_STATUS_LABELS[movieStatus].toLowerCase()}`}
            description="Khám phá phim, xem trailer, dàn diễn viên và nhãn phân loại độ tuổi trước khi đặt vé."
         >
            <MovieStatusTabs activeStatus={movieStatus} onChange={handleStatusChange} />
         </MovieListBanner>

         <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-12">
            <MovieFilterBar
               key={movieFilters.keyword}
               movieFilters={movieFilters}
               genres={genresQuery.data ?? []}
               onChange={handleFiltersChange}
            />

            {moviesQuery.isError && <Alert variant="error">{getErrorMessage(moviesQuery.error)}</Alert>}
            {moviesQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách phim...</p>}
            {moviesQuery.data && moviesQuery.data.content.length === 0 && (
               <p className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
                  Không tìm thấy phim {MOVIE_STATUS_LABELS[movieStatus].toLowerCase()} phù hợp với bộ lọc.
               </p>
            )}
            {moviesQuery.data && moviesQuery.data.content.length > 0 && (
               <>
                  <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
                     {moviesQuery.data.content.map((movie, movieIndex) => (
                        <Reveal key={movie.id} delayMs={(movieIndex % 4) * 90} className="h-full">
                           <MovieCard movie={movie} movieRatingSummary={movieRatings.get(movie.id)} />
                        </Reveal>
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
