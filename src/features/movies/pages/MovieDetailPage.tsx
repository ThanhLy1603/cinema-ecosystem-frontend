import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clapperboard, Clock, ExternalLink, Play, Ticket } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicMovie } from '@/api/movieApi';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import TrailerModal from '@/components/common/TrailerModal';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import { MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import { getMovieBookingPath, isValidMovieSlug } from '@/lib/movie/moviePath';
import { toTrailerSource, type TrailerSource } from '@/lib/movie/trailer';
import { publicMovieDetailKey } from '@/lib/movie/movieQueryKeys';
import type { MovieDetail } from '@/types/movie/movie';
import AgeWarningNotice from '../components/AgeWarningNotice';
import CastList from '../components/CastList';

export function MovieDetailPage(): ReactElement {
   const { movieSlug: movieSlugParam } = useParams<{ movieSlug: string }>();
   const movieSlug: string = movieSlugParam ?? '';
   const isValidSlug: boolean = isValidMovieSlug(movieSlug);
   const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
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
   const trailerSource: TrailerSource | null = movieDetail.trailerUrl
      ? toTrailerSource(movieDetail.trailerUrl, true)
      : null;

   function handleCloseTrailer(): void {
      setIsTrailerOpen(false);
   }

   return (
      <article className="pb-16">
         <div className="relative isolate overflow-hidden bg-ink-50">
            {movieDetail.bannerUrl && (
               <img
                  src={movieDetail.bannerUrl}
                  alt=""
                  className="absolute inset-0 -z-10 size-full object-cover object-top opacity-35"
               />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/85 to-brand-100/40" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-50 via-transparent to-white/70" />

            <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-10 sm:px-6 lg:px-12">
               {backLink}
               <div className="flex flex-col gap-6 rounded-2xl border border-ink-200/80 bg-white/70 p-6 shadow-md backdrop-blur-md sm:flex-row">
                  <div className="relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-900 shadow-xl sm:mx-0 sm:w-52">
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

                  <div className="flex-1 space-y-4">
                     <div className="space-y-2">
                        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                           {MOVIE_STATUS_LABELS[movieDetail.status]}
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                           {movieDetail.title}
                        </h1>
                        {movieDetail.originalTitle && (
                           <p className="text-sm font-semibold text-brand-600">{movieDetail.originalTitle}</p>
                        )}
                     </div>

                     <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-ink-600">
                        <li>
                           <AgeRatingBadge ageRating={movieDetail.rated} className="text-sm" />
                        </li>
                        <li className="flex items-center gap-2">
                           <Clock className="size-4 text-brand-600" aria-hidden="true" />
                           {formatDuration(movieDetail.durationMinutes)}
                        </li>
                        <li className="flex items-center gap-2">
                           <CalendarDays className="size-4 text-brand-600" aria-hidden="true" />
                           Khởi chiếu {formatReleaseDate(movieDetail.releaseDate)}
                        </li>
                     </ul>

                     {movieDetail.genres.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                           {movieDetail.genres.map((genre) => (
                              <li
                                 key={genre.id}
                                 className="rounded-full border border-ink-300 bg-white/90 px-3.5 py-1 text-xs font-semibold text-ink-700 shadow-xs"
                              >
                                 {genre.name}
                              </li>
                           ))}
                        </ul>
                     )}

                     <div className="flex flex-wrap items-center gap-3 pt-1">
                        {movieDetail.status !== 'ENDED' && (
                           <LinkButton
                              to={getMovieBookingPath(movieDetail.slug)}
                              size="lg"
                              icon={<Ticket className="size-5" aria-hidden="true" />}
                           >
                              Mua vé phim này
                           </LinkButton>
                        )}
                        {movieDetail.trailerUrl &&
                           (trailerSource ? (
                              <Button
                                 variant="secondary"
                                 size="lg"
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
                                 className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-200 bg-white px-6 text-base font-semibold text-ink-800 shadow-sm hover:bg-ink-50"
                              >
                                 <ExternalLink className="size-4" aria-hidden="true" />
                                 Xem trailer
                              </a>
                           ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-12">
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
