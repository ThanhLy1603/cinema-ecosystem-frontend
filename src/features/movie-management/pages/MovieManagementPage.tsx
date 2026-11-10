import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Plus, Tags, Users } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { searchAdminMovies } from '@/api/movieApi';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import LinkButton from '@/components/ui/LinkButton';
import { getErrorMessage } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PageResponse } from '@/types/common/api';
import type { AdminMovieSearchParams, AgeRating, Genre, Movie, MovieStatus } from '@/types/movie/movie';
import MovieFilterBar, { type AdminMovieFilters } from '../components/MovieFilterBar';
import MovieTable from '../components/MovieTable';
import { useGenres } from '../hooks/useGenres';
import { useMovieRefresh } from '../hooks/useMovieRefresh';
import { ADMIN_MOVIE_LIST_KEY } from '../utils/queryKeys';

const PAGE_SIZE: number = 20;
const EMPTY_FILTERS: AdminMovieFilters = { keyword: '', genreId: '', status: '', rated: '', deleted: '' };

function toSearchParams(adminMovieFilters: AdminMovieFilters, page: number): AdminMovieSearchParams {
   return {
      keyword: adminMovieFilters.keyword || undefined,
      genreId: adminMovieFilters.genreId ? Number(adminMovieFilters.genreId) : undefined,
      status: (adminMovieFilters.status || undefined) as MovieStatus | undefined,
      rated: (adminMovieFilters.rated || undefined) as AgeRating | undefined,
      deleted: adminMovieFilters.deleted === 'true',
      page,
      size: PAGE_SIZE,
   };
}

export function MovieManagementPage(): ReactElement {
   const [adminMovieFilters, setAdminMovieFilters] = useState<AdminMovieFilters>(EMPTY_FILTERS);
   const [page, setPage] = useState<number>(0);
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const adminMovieSearchParams: AdminMovieSearchParams = toSearchParams(adminMovieFilters, page);
   const genresQuery: UseQueryResult<Genre[]> = useGenres();
   const moviesQuery: UseQueryResult<PageResponse<Movie>> = useQuery<PageResponse<Movie>>({
      queryKey: [...ADMIN_MOVIE_LIST_KEY, adminMovieSearchParams],
      queryFn: () => searchAdminMovies(adminMovieSearchParams),
      placeholderData: keepPreviousData,
   });
   const refreshMovies: () => void = useMovieRefresh(null);

   function handleFiltersChange(nextAdminMovieFilters: AdminMovieFilters): void {
      setAdminMovieFilters(nextAdminMovieFilters);
      setPage(0);
   }

   return (
      <div className="w-full max-w-6xl space-y-6">
         <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Quản lý phim</h1>
               <p className="mt-1 text-sm text-ink-500">
                  Danh mục phim, nhãn độ tuổi, thể loại và đội ngũ làm phim của cả hệ thống.
               </p>
            </div>
            <div className="flex flex-wrap gap-3">
               <LinkButton
                  to="/admin/movies/genres"
                  variant="secondary"
                  icon={<Tags className="size-4" aria-hidden="true" />}
               >
                  Thể loại
               </LinkButton>
               <LinkButton
                  to="/admin/movies/persons"
                  variant="secondary"
                  icon={<Users className="size-4" aria-hidden="true" />}
               >
                  Nghệ sĩ
               </LinkButton>
               <LinkButton to="/admin/movies/new" icon={<Plus className="size-4" aria-hidden="true" />}>
                  Thêm phim
               </LinkButton>
            </div>
         </header>

         <MovieFilterBar
            adminMovieFilters={adminMovieFilters}
            genres={genresQuery.data ?? []}
            isAdmin={isAdmin}
            onChange={handleFiltersChange}
         />

         {moviesQuery.isError && <Alert variant="error">{getErrorMessage(moviesQuery.error)}</Alert>}
         {moviesQuery.data && (
            <>
               <MovieTable movies={moviesQuery.data.content} canRestore={isAdmin} onRestored={refreshMovies} />
               <Pagination
                  page={moviesQuery.data.page}
                  totalPages={moviesQuery.data.totalPages}
                  totalElements={moviesQuery.data.totalElements}
                  onPageChange={setPage}
               />
            </>
         )}
         {moviesQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách...</p>}
      </div>
   );
}

export default MovieManagementPage;
