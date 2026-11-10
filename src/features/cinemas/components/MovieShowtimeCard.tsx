import { Clapperboard } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { formatVnd } from '@/lib/currencyFormat';
import { formatDuration } from '@/lib/movieFormat';
import { formatClockRange, toVietnamTimeOfDay } from '@/lib/vietnamTime';
import type { PublicMovieShowtimes, PublicShowtime } from '@/types/showtime';

interface MovieShowtimeCardProps {
   publicMovieShowtimes: PublicMovieShowtimes;
}

export function MovieShowtimeCard({ publicMovieShowtimes }: MovieShowtimeCardProps): ReactElement {
   return (
      <article className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm sm:gap-5">
         <Link
            to={`/movies/${publicMovieShowtimes.movieId}`}
            className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:w-24"
            aria-label={`Xem phim ${publicMovieShowtimes.title}`}
         >
            {publicMovieShowtimes.posterUrl ? (
               <img
                  src={publicMovieShowtimes.posterUrl}
                  alt={`Poster phim ${publicMovieShowtimes.title}`}
                  loading="lazy"
                  className="size-full object-cover"
               />
            ) : (
               <span className="grid size-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-300">
                  <Clapperboard className="size-8" aria-hidden="true" />
               </span>
            )}
         </Link>
         <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1.5">
               <div className="flex flex-wrap items-center gap-2">
                  <AgeRatingBadge ageRating={publicMovieShowtimes.rated} />
                  <span className="rounded-md bg-ink-900 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                     {formatDuration(publicMovieShowtimes.durationMinutes)}
                  </span>
               </div>
               <h3 className="text-base font-extrabold uppercase text-brand-700">
                  <Link to={`/movies/${publicMovieShowtimes.movieId}`} className="hover:text-brand-800">
                     {publicMovieShowtimes.title}
                  </Link>
               </h3>
            </div>
            <ul className="flex flex-wrap gap-2">
               {publicMovieShowtimes.showtimes.map((publicShowtime: PublicShowtime) => (
                  <li
                     key={publicShowtime.id}
                     title={`${formatClockRange(publicShowtime.startTime, publicShowtime.endTime)} · ${publicShowtime.hallName} · giá gốc ${formatVnd(publicShowtime.basePrice)}`}
                     className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-center"
                  >
                     <span className="block text-sm font-extrabold text-brand-800">
                        {toVietnamTimeOfDay(publicShowtime.startTime)}
                     </span>
                     <span className="block text-[11px] font-semibold text-ink-600">
                        {publicShowtime.screenType} · {publicShowtime.hallName}
                     </span>
                  </li>
               ))}
            </ul>
         </div>
      </article>
   );
}

export default MovieShowtimeCard;
