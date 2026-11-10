import { Clapperboard, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { formatDuration } from '@/lib/movie/movieFormat';
import { getMovieDetailPath } from '@/lib/movie/moviePath';
import type { Movie } from '@/types/movie/movie';

interface MovieCardProps {
   movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps): ReactElement {
   const genreLabel: string =
      movie.genres.length === 0 ? 'Chưa phân loại' : movie.genres.map((genre) => genre.name).join(', ');

   return (
      <Link to={getMovieDetailPath(movie.slug)} className="group flex h-full flex-col gap-2.5">
         <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
            {movie.posterUrl ? (
               <img
                  src={movie.posterUrl}
                  alt={`Poster phim ${movie.title}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
               />
            ) : (
               <div className="grid size-full place-items-center bg-ink-100 text-ink-300">
                  <Clapperboard className="size-12" aria-hidden="true" />
               </div>
            )}
            <div className="absolute left-2 top-2">
               <AgeRatingBadge ageRating={movie.rated} />
            </div>
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
               <span className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-2 text-[13px] font-semibold text-white">
                  <Ticket className="size-4" aria-hidden="true" />
                  Chi tiết phim
               </span>
            </div>
         </div>
         <div className="space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold uppercase leading-5 text-ink-900 transition-colors group-hover:text-brand-700">
               {movie.title}
            </h3>
            <p className="line-clamp-1 text-xs text-ink-500">
               {genreLabel} · {formatDuration(movie.durationMinutes)}
            </p>
         </div>
      </Link>
   );
}

export default MovieCard;
