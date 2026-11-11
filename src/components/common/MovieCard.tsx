import { Clapperboard, Info, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import LinkButton from '@/components/ui/LinkButton';
import { formatDuration } from '@/lib/movie/movieFormat';
import { getMovieBookingPath, getMovieDetailPath } from '@/lib/movie/moviePath';
import type { Movie } from '@/types/movie/movie';

interface MovieCardProps {
   movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps): ReactElement {
   const genreLabel: string =
      movie.genres.length === 0 ? 'Chưa phân loại' : movie.genres.map((genre) => genre.name).join(' · ');
   const canBook: boolean = movie.status !== 'ENDED';

   return (
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
         <Link
            to={getMovieDetailPath(movie.slug)}
            aria-label={`Xem phim ${movie.title}`}
            className="relative block aspect-[2/3] w-full overflow-hidden bg-ink-900"
         >
            {movie.posterUrl ? (
               <img
                  src={movie.posterUrl}
                  alt={`Poster phim ${movie.title}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <div className="grid size-full place-items-center text-ink-500">
                  <Clapperboard className="size-12" aria-hidden="true" />
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-ink-900/20" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
               <AgeRatingBadge ageRating={movie.rated} />
               <span className="rounded bg-ink-900/80 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                  {formatDuration(movie.durationMinutes)}
               </span>
            </div>
         </Link>
         <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="space-y-1">
               <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
                  <Link to={getMovieDetailPath(movie.slug)}>{movie.title}</Link>
               </h3>
               <p className="line-clamp-1 text-xs font-semibold text-brand-600">{genreLabel}</p>
            </div>
            <div className="mt-auto flex gap-2">
               {canBook && (
                  <LinkButton
                     to={getMovieBookingPath(movie.slug)}
                     size="md"
                     className="flex-1"
                     icon={<Ticket className="size-4" aria-hidden="true" />}
                  >
                     Mua vé ngay
                  </LinkButton>
               )}
               <LinkButton
                  to={getMovieDetailPath(movie.slug)}
                  variant="secondary"
                  size="md"
                  className={canBook ? 'px-3' : 'flex-1'}
                  aria-label={`Chi tiết phim ${movie.title}`}
                  icon={<Info className="size-4" aria-hidden="true" />}
               >
                  {canBook ? null : 'Chi tiết'}
               </LinkButton>
            </div>
         </div>
      </article>
   );
}

export default MovieCard;
