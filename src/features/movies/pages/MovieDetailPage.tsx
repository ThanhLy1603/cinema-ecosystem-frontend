import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicMovie } from '@/api/movieApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { isValidMovieSlug } from '@/lib/movie/moviePath';
import { publicMovieDetailKey } from '@/lib/movie/movieQueryKeys';
import type { MovieDetail } from '@/types/movie/movie';
import AgeWarningNotice from '../components/AgeWarningNotice';
import MovieDetailHeader from '../components/MovieDetailHeader';

export function MovieDetailPage(): ReactElement {
   const { movieSlug: movieSlugParam } = useParams<{ movieSlug: string }>();
   const movieSlug: string = movieSlugParam ?? '';
   const isValidSlug: boolean = isValidMovieSlug(movieSlug);
   const movieQuery: UseQueryResult<MovieDetail> = useQuery<MovieDetail>({
      queryKey: publicMovieDetailKey(movieSlug),
      queryFn: () => getPublicMovie(movieSlug),
      enabled: isValidSlug,
   });

   const backLink: ReactElement = (
      <Link to="/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Về danh sách phim
      </Link>
   );

   if (!isValidSlug) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">Đường dẫn phim không hợp lệ.</Alert>
            {backLink}
         </section>
      );
   }
   if (movieQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (movieQuery.isError) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">{getErrorMessage(movieQuery.error)}</Alert>
            {backLink}
         </section>
      );
   }

   const movieDetail: MovieDetail = movieQuery.data;

   return (
      <article className="pb-16">
         <MovieDetailHeader movieDetail={movieDetail}>
            {movieDetail.rated !== 'P' && (
               <div className="mt-6">
                  <AgeWarningNotice ageRating={movieDetail.rated} />
               </div>
            )}
         </MovieDetailHeader>
      </article>
   );
}

export default MovieDetailPage;
