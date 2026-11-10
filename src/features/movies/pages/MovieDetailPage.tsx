import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clapperboard, Clock, ExternalLink, Play } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicMovie } from '@/api/movieApi';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import TrailerModal from '@/components/common/TrailerModal';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/apiError';
import { formatDuration, formatReleaseDate } from '@/lib/movieFormat';
import { MOVIE_STATUS_LABELS } from '@/lib/movieLabels';
import { toTrailerSource, type TrailerSource } from '@/lib/trailer';
import { publicMovieDetailKey } from '@/lib/movieQueryKeys';
import type { MovieDetail } from '@/types/movie';
import AgeWarningNotice from '../components/AgeWarningNotice';
import CastList from '../components/CastList';

export function MovieDetailPage(): ReactElement {
   const { movieId: movieIdParam } = useParams<{ movieId: string }>();
   const movieId: number = Number(movieIdParam);
   const isValidMovieId: boolean = Number.isInteger(movieId) && movieId > 0;
   const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
   const movieQuery: UseQueryResult<MovieDetail> = useQuery<MovieDetail>({
      queryKey: publicMovieDetailKey(movieId),
      queryFn: () => getPublicMovie(movieId),
      enabled: isValidMovieId,
   });

   const backLink: ReactElement = (
      <Link to="/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Về danh sách phim
      </Link>
   );

   if (!isValidMovieId) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">Mã phim không hợp lệ.</Alert>
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
   const trailerSource: TrailerSource | null = movieDetail.trailerUrl
      ? toTrailerSource(movieDetail.trailerUrl, true)
      : null;

   function handleCloseTrailer(): void {
      setIsTrailerOpen(false);
   }

   return (
      <article className="pb-16">
         <div className="relative isolate overflow-hidden bg-ink-900">
            {movieDetail.bannerUrl && (
               <img
                  src={movieDetail.bannerUrl}
                  alt=""
                  className="absolute inset-0 -z-10 size-full object-cover opacity-30"
               />
            )}
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[260px_1fr]">
               <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-3xl bg-ink-800 shadow-soft">
                  <div className="relative aspect-[2/3]">
                     {movieDetail.posterUrl ? (
                        <img
                           src={movieDetail.posterUrl}
                           alt={`Poster phim ${movieDetail.title}`}
                           className="size-full object-cover"
                        />
                     ) : (
                        <div className="grid size-full place-items-center text-ink-500">
                           <Clapperboard className="size-14" aria-hidden="true" />
                        </div>
                     )}
                  </div>
               </div>

               <div className="space-y-5 text-white">
                  <div className="[&_a]:text-white/80">{backLink}</div>
                  <div className="space-y-2">
                     <div className="flex flex-wrap items-center gap-3">
                        <AgeRatingBadge ageRating={movieDetail.rated} className="text-sm" />
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                           {MOVIE_STATUS_LABELS[movieDetail.status]}
                        </span>
                     </div>
                     <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{movieDetail.title}</h1>
                     {movieDetail.originalTitle && <p className="text-white/70">{movieDetail.originalTitle}</p>}
                  </div>

                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                     <li className="flex items-center gap-2">
                        <Clock className="size-4" aria-hidden="true" />
                        {formatDuration(movieDetail.durationMinutes)}
                     </li>
                     <li className="flex items-center gap-2">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        Khởi chiếu {formatReleaseDate(movieDetail.releaseDate)}
                     </li>
                  </ul>

                  {movieDetail.genres.length > 0 && (
                     <ul className="flex flex-wrap gap-2">
                        {movieDetail.genres.map((genre) => (
                           <li key={genre.id} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                              {genre.name}
                           </li>
                        ))}
                     </ul>
                  )}

                  {movieDetail.trailerUrl && (
                     <div>
                        {trailerSource ? (
                           <Button
                              icon={<Play className="size-4" aria-hidden="true" />}
                              onClick={() => setIsTrailerOpen(true)}
                           >
                              Xem trailer
                           </Button>
                        ) : (
                           <a
                              href={movieDetail.trailerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-900"
                           >
                              <ExternalLink className="size-4" aria-hidden="true" />
                              Xem trailer
                           </a>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6">
            <AgeWarningNotice ageRating={movieDetail.rated} />

            <section className="space-y-3">
               <h2 className="text-xl font-bold text-ink-900">Nội dung phim</h2>
               <p className="whitespace-pre-line leading-relaxed text-ink-700">
                  {movieDetail.description ?? 'Nội dung phim đang được cập nhật.'}
               </p>
            </section>

            {movieDetail.casts.length > 0 && (
               <section className="space-y-4">
                  <h2 className="text-xl font-bold text-ink-900">Đạo diễn & diễn viên</h2>
                  <CastList movieCasts={movieDetail.casts} />
               </section>
            )}
         </div>

         {isTrailerOpen && trailerSource && (
            <TrailerModal movieTitle={movieDetail.title} trailerSource={trailerSource} onClose={handleCloseTrailer} />
         )}
      </article>
   );
}

export default MovieDetailPage;
