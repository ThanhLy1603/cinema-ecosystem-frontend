import { Clapperboard, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { formatDuration } from '@/lib/movieFormat';
import type { Movie } from '@/types/movie';

interface MovieCardProps {
   movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps): ReactElement {
   return (
      <Link to={`/movies/${movie.id}`} className="group flex h-full flex-col gap-3">
         <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 shadow-card transition-all duration-300 group-hover:border-brand-300 group-hover:shadow-soft">
            {movie.posterUrl ? (
               <img
                  src={movie.posterUrl}
                  alt={`Poster phim ${movie.title}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <div className="grid size-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-300">
                  <Clapperboard className="size-14" aria-hidden="true" />
               </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-ink-900/70 to-transparent p-4 pt-12 opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
               <span className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg">
                  Chi tiết phim
                  <Ticket className="size-4" aria-hidden="true" />
               </span>
            </div>
         </div>
         <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
               <AgeRatingBadge ageRating={movie.rated} />
               <span className="rounded-md bg-ink-900 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                  {formatDuration(movie.durationMinutes)}
               </span>
            </div>
            <h3 className="line-clamp-1 text-base font-extrabold uppercase text-brand-700 transition-colors group-hover:text-brand-800">
               {movie.title}
            </h3>
            <p className="line-clamp-1 text-sm text-ink-700">
               Thể loại phim:{' '}
               <span className="font-medium text-brand-600">
                  {movie.genres.length === 0 ? 'Chưa phân loại' : movie.genres.map((genre) => genre.name).join(', ')}
               </span>
            </p>
         </div>
      </Link>
   );
}

export default MovieCard;
