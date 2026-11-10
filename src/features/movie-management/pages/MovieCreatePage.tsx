import { useMutation, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router-dom';
import { createMovie } from '@/api/movieApi';
import SectionCard from '@/components/common/SectionCard';
import { getErrorMessage } from '@/lib/common/apiError';
import type { Genre, MovieDetail, MovieRequest, PersonOption } from '@/types/movie/movie';
import MovieForm from '../components/MovieForm';
import { useGenres } from '../hooks/useGenres';
import { useMovieRefresh } from '../hooks/useMovieRefresh';
import { usePersonOptions } from '../hooks/usePersonOptions';
import { getMovieServerFieldErrors } from '../utils/serverErrors';

export function MovieCreatePage(): ReactElement {
   const navigate: NavigateFunction = useNavigate();
   const refreshMovie: () => void = useMovieRefresh(null);
   const genresQuery: UseQueryResult<Genre[]> = useGenres();
   const personOptionsQuery: UseQueryResult<PersonOption[]> = usePersonOptions();

   function handleCreated(movieDetail: MovieDetail): void {
      refreshMovie();
      navigate(`/admin/movies/${movieDetail.id}`, { replace: true });
   }

   const createMutation: UseMutationResult<MovieDetail, unknown, MovieRequest> = useMutation<
      MovieDetail,
      unknown,
      MovieRequest
   >({
      mutationFn: createMovie,
      onSuccess: handleCreated,
   });

   const serverFieldErrors: Record<string, string> = createMutation.isError
      ? getMovieServerFieldErrors(createMutation.error)
      : {};
   const hasFieldErrors: boolean = Object.keys(serverFieldErrors).length > 0;

   return (
      <div className="w-full max-w-4xl space-y-6">
         <Link to="/admin/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về danh sách phim
         </Link>
         <h1 className="text-xl font-semibold tracking-tight text-ink-900">Thêm phim</h1>
         <SectionCard
            title="Thông tin phim"
            description="Nhãn độ tuổi là bắt buộc và hiển thị cho khách khi chọn phim."
         >
            <MovieForm
               genres={genresQuery.data ?? []}
               personOptions={personOptionsQuery.data ?? []}
               isSubmitting={createMutation.isPending}
               submitLabel="Tạo phim"
               errorMessage={
                  createMutation.isError && !hasFieldErrors ? getErrorMessage(createMutation.error) : undefined
               }
               serverFieldErrors={serverFieldErrors}
               onSubmit={(movieRequest) => createMutation.mutate(movieRequest)}
            />
         </SectionCard>
      </div>
   );
}

export default MovieCreatePage;
