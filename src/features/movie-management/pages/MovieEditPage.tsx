import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAdminMovie, updateMovie } from '@/api/movieApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import SectionCard from '@/components/common/SectionCard';
import Alert from '@/components/ui/Alert';
import { getErrorMessage, getFieldErrors } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Genre, MovieDetail, MovieRequest, PersonOption } from '@/types/movie/movie';
import DeleteMovieCard from '../components/DeleteMovieCard';
import MovieForm from '../components/MovieForm';
import MovieStatusBadge from '../components/MovieStatusBadge';
import { useGenres } from '../hooks/useGenres';
import { useMovieRefresh } from '../hooks/useMovieRefresh';
import { usePersonOptions } from '../hooks/usePersonOptions';
import { adminMovieDetailKey } from '../utils/queryKeys';

export function MovieEditPage(): ReactElement {
   const { movieId: movieIdParam } = useParams<{ movieId: string }>();
   const movieId: number = Number(movieIdParam);
   const isValidMovieId: boolean = Number.isInteger(movieId) && movieId > 0;
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const refreshMovie: () => void = useMovieRefresh(isValidMovieId ? movieId : null);
   const genresQuery: UseQueryResult<Genre[]> = useGenres();
   const personOptionsQuery: UseQueryResult<PersonOption[]> = usePersonOptions();
   const movieQuery: UseQueryResult<MovieDetail> = useQuery<MovieDetail>({
      queryKey: adminMovieDetailKey(movieId),
      queryFn: () => getAdminMovie(movieId),
      enabled: isValidMovieId,
   });

   const updateMutation: UseMutationResult<MovieDetail, unknown, MovieRequest> = useMutation<
      MovieDetail,
      unknown,
      MovieRequest
   >({
      mutationFn: (movieRequest) => updateMovie(movieId, movieRequest),
      onSuccess: refreshMovie,
   });

   function handleSubmit(movieRequest: MovieRequest): void {
      updateMutation.reset();
      updateMutation.mutate(movieRequest);
   }

   const backLink: ReactElement = (
      <Link to="/admin/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Về danh sách phim
      </Link>
   );

   if (!isValidMovieId) {
      return (
         <div className="w-full max-w-4xl space-y-4">
            <Alert variant="error">Mã phim không hợp lệ.</Alert>
            {backLink}
         </div>
      );
   }
   if (movieQuery.isPending || genresQuery.isPending || personOptionsQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (movieQuery.isError) {
      return (
         <div className="w-full max-w-4xl space-y-4">
            <Alert variant="error">{getErrorMessage(movieQuery.error)}</Alert>
            {backLink}
         </div>
      );
   }

   const movieDetail: MovieDetail = movieQuery.data;
   const serverFieldErrors: Record<string, string> = updateMutation.isError ? getFieldErrors(updateMutation.error) : {};
   const hasFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   return (
      <div className="w-full max-w-4xl space-y-6">
         {backLink}
         <header className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{movieDetail.title}</h1>
            <MovieStatusBadge movieStatus={movieDetail.status} />
            <Link
               to={`/movies/${movieDetail.id}`}
               className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
            >
               <ExternalLink className="size-4" aria-hidden="true" />
               Xem trang khách hàng
            </Link>
         </header>

         <SectionCard title="Thông tin phim">
            <MovieForm
               key={movieDetail.id}
               initialMovie={movieDetail}
               genres={genresQuery.data ?? []}
               personOptions={personOptionsQuery.data ?? []}
               isSubmitting={updateMutation.isPending}
               submitLabel="Lưu thay đổi"
               errorMessage={
                  updateMutation.isError && !hasFieldErrors ? getErrorMessage(updateMutation.error) : undefined
               }
               successMessage={updateMutation.isSuccess ? 'Đã lưu thông tin phim' : undefined}
               serverFieldErrors={serverFieldErrors}
               onSubmit={handleSubmit}
            />
         </SectionCard>

         {isAdmin && (
            <SectionCard title="Xóa phim">
               <DeleteMovieCard movieId={movieDetail.id} />
            </SectionCard>
         )}
      </div>
   );
}

export default MovieEditPage;
