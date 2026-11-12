import { ExternalLink, Play, Ticket } from 'lucide-react';
import { useState, type ReactElement, type ReactNode } from 'react';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import TrailerModal from '@/components/common/TrailerModal';
import UserAvatar from '@/components/common/UserAvatar';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton';
import { cn } from '@/lib/common/utils';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import { AGE_RATING_DESCRIPTIONS } from '@/lib/movie/movieLabels';
import { getMovieBookingPath } from '@/lib/movie/moviePath';
import { toTrailerSource, type TrailerSource } from '@/lib/movie/trailer';
import type { CastRoleType, MovieCast, MovieDetail } from '@/types/movie/movie';

interface MovieDetailHeaderProps {
   movieDetail: MovieDetail;
   children?: ReactNode;
}

const INFO_LABEL_CLASS_NAME: string = 'text-[11px] font-extrabold uppercase tracking-wider text-ink-500';
const PILL_BUTTON_CLASS_NAME: string = 'h-11 rounded-full px-6 text-sm font-bold';

function joinPersonNames(movieCasts: MovieCast[], castRoleType: CastRoleType): string {
   return movieCasts
      .filter((movieCast) => movieCast.roleType === castRoleType)
      .map((movieCast) => movieCast.personName)
      .join(', ');
}

export function MovieDetailHeader({ movieDetail, children }: MovieDetailHeaderProps): ReactElement {
   const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
   const bannerUrl: string | null = movieDetail.bannerUrl ?? movieDetail.posterUrl;
   const isBanner: boolean = movieDetail.bannerUrl !== null;
   const trailerSource: TrailerSource | null = movieDetail.trailerUrl
      ? toTrailerSource(movieDetail.trailerUrl, true)
      : null;
   const canBook: boolean = movieDetail.status !== 'ENDED';
   const directorNames: string = joinPersonNames(movieDetail.casts, 'DIRECTOR');
   const actorCasts: MovieCast[] = movieDetail.casts.filter((movieCast) => movieCast.roleType === 'ACTOR');

   function openTrailer(): void {
      setIsTrailerOpen(true);
   }

   function closeTrailer(): void {
      setIsTrailerOpen(false);
   }

   return (
      <section aria-label={`Thông tin phim ${movieDetail.title}`} className="relative">
         <div className="absolute inset-x-0 top-0 h-[220px] overflow-hidden bg-ink-900 md:h-[300px]">
            {bannerUrl && (
               <img
                  src={bannerUrl}
                  alt=""
                  className={cn('size-full object-cover object-top', !isBanner && 'scale-110 opacity-70 blur-sm')}
               />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
         </div>

         <div className="relative mx-auto grid max-w-6xl gap-x-8 px-6 pt-8 sm:px-10 md:grid-cols-[13rem_1fr] lg:grid-cols-[14rem_1fr]">
            <div className="space-y-5">
               <button
                  type="button"
                  onClick={openTrailer}
                  disabled={trailerSource === null}
                  title={trailerSource ? 'Xem trailer' : undefined}
                  aria-label={trailerSource ? `Xem trailer phim ${movieDetail.title}` : undefined}
                  className="group relative block aspect-[2/3] w-40 cursor-pointer overflow-hidden rounded-xl bg-ink-100 shadow-xl ring-1 ring-black/10 disabled:cursor-default md:w-full"
               >
                  {movieDetail.posterUrl ? (
                     <img
                        src={movieDetail.posterUrl}
                        alt={`Poster phim ${movieDetail.title}`}
                        className="size-full object-cover"
                     />
                  ) : (
                     <span className="grid size-full place-items-center text-ink-300">
                        <Ticket className="size-10" aria-hidden="true" />
                     </span>
                  )}
                  {trailerSource && (
                     <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="size-9 fill-current text-white" aria-hidden="true" />
                     </span>
                  )}
               </button>

               <div className="space-y-4 divide-y divide-ink-200 text-sm text-ink-800">
                  {directorNames !== '' && (
                     <section aria-label="Đạo diễn" className="space-y-1">
                        <h3 className={INFO_LABEL_CLASS_NAME}>Đạo diễn</h3>
                        <p className="font-semibold text-ink-900">{directorNames}</p>
                     </section>
                  )}
                  {actorCasts.length > 0 && (
                     <section aria-label="Diễn viên" className="space-y-3 pt-4">
                        <h3 className={INFO_LABEL_CLASS_NAME}>Diễn viên</h3>
                        <ul className="space-y-3">
                           {actorCasts.map((actorCast, actorIndex) => (
                              <li key={`${actorCast.personId}-${actorIndex}`} className="flex items-center gap-3">
                                 <UserAvatar
                                    user={{
                                       fullName: actorCast.personName,
                                       avatarUrl: actorCast.avatarUrl ?? undefined,
                                    }}
                                    className="size-10 shrink-0 text-xs ring-1 ring-ink-200"
                                 />
                                 <div className="min-w-0 leading-snug">
                                    <p className="font-bold text-ink-900">{actorCast.personName}</p>
                                    {actorCast.characterName && (
                                       <p className="text-xs text-ink-600">
                                          Vai{' '}
                                          <span className="font-semibold text-brand-700">
                                             {actorCast.characterName}
                                          </span>
                                       </p>
                                    )}
                                 </div>
                              </li>
                           ))}
                        </ul>
                     </section>
                  )}
                  {movieDetail.genres.length > 0 && (
                     <section aria-label="Thể loại" className="space-y-2 pt-4">
                        <h3 className={INFO_LABEL_CLASS_NAME}>Thể loại</h3>
                        <ul className="flex flex-wrap gap-2">
                           {movieDetail.genres.map((genre) => (
                              <li
                                 key={genre.id}
                                 className="rounded-full border border-brand-600 px-3 py-0.5 text-xs lowercase text-brand-700"
                              >
                                 {genre.name}
                              </li>
                           ))}
                        </ul>
                     </section>
                  )}
               </div>
            </div>

            <div className="mt-6 min-w-0 md:mt-0">
               <div className="text-ink-900 md:flex md:h-[268px] md:flex-col md:justify-end md:pb-6 md:text-white">
                  <h1 className="text-3xl font-extrabold uppercase leading-tight sm:text-4xl lg:text-5xl">
                     {movieDetail.title}
                  </h1>
                  {movieDetail.originalTitle && <p className="mt-2 text-lg font-bold">{movieDetail.originalTitle}</p>}
                  <p className="mt-3 text-sm">
                     Khởi chiếu: {formatReleaseDate(movieDetail.releaseDate)}
                     <span className="mx-2 opacity-60">|</span>
                     {formatDuration(movieDetail.durationMinutes)}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm">
                     <AgeRatingBadge ageRating={movieDetail.rated} />
                     {AGE_RATING_DESCRIPTIONS[movieDetail.rated]}
                  </p>
               </div>

               <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-5">
                  {canBook && (
                     <LinkButton
                        to={getMovieBookingPath(movieDetail.slug)}
                        className={PILL_BUTTON_CLASS_NAME}
                        icon={<Ticket className="size-4" aria-hidden="true" />}
                     >
                        Mua vé phim này
                     </LinkButton>
                  )}
                  {movieDetail.trailerUrl &&
                     (trailerSource ? (
                        <Button
                           variant="secondary"
                           className={cn(PILL_BUTTON_CLASS_NAME, 'border-2 border-brand-600 text-brand-700')}
                           icon={<Play className="size-4 fill-current" aria-hidden="true" />}
                           onClick={openTrailer}
                        >
                           Xem trailer
                        </Button>
                     ) : (
                        <a
                           href={movieDetail.trailerUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-brand-600 px-6 text-sm font-bold text-brand-700 hover:bg-brand-50"
                        >
                           <ExternalLink className="size-4" aria-hidden="true" />
                           Xem trailer
                        </a>
                     ))}
               </div>

               <h2 className="mt-8 text-2xl font-extrabold text-ink-900">Nội dung phim</h2>
               <p className="mt-3 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-ink-800">
                  {movieDetail.description ?? 'Nội dung phim đang được cập nhật.'}
               </p>
               {children}
            </div>
         </div>

         {isTrailerOpen && trailerSource && (
            <TrailerModal movieTitle={movieDetail.title} trailerSource={trailerSource} onClose={closeTrailer} />
         )}
      </section>
   );
}

export default MovieDetailHeader;
