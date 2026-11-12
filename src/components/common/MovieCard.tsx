import { Clapperboard } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingLabel from '@/components/common/AgeRatingLabel';
import StarRating from '@/components/common/StarRating';
import LinkButton from '@/components/ui/LinkButton';
import { formatDuration } from '@/lib/movie/movieFormat';
import { getMovieBookingPath, getMovieDetailPath } from '@/lib/movie/moviePath';
import type { Movie, MovieRatingSummary } from '@/types/movie/movie';

interface MovieCardProps {
   movie: Movie;
   movieRatingSummary?: MovieRatingSummary;
}

export function MovieCard({ movie, movieRatingSummary }: MovieCardProps): ReactElement {
   const genreLabel: string =
      movie.genres.length === 0 ? 'Chưa phân loại' : movie.genres.map((genre) => genre.name).join(' / ');
   const canBook: boolean = movie.status !== 'ENDED';

   return (
      <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
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
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
               <span className="rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                  {formatDuration(movie.durationMinutes)}
               </span>
            </div>
         </Link>
         <div className="flex flex-1 flex-col gap-3 p-3">
            <div className="space-y-1">
               <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
                  <Link to={getMovieDetailPath(movie.slug)}>{movie.title}</Link>
               </h3>
               <AgeRatingLabel ageRating={movie.rated} className="text-xs text-ink-700" />
               <p className="line-clamp-1 text-xs text-ink-600">{genreLabel}</p>
               <StarRating movieRatingSummary={movieRatingSummary} />
            </div>
            <div className="mt-auto flex gap-2">
               {canBook && (
                  <LinkButton to={getMovieBookingPath(movie.slug)} size="sm" className="h-9 flex-1 text-xs font-bold">
                     Mua vé
                  </LinkButton>
               )}
               <LinkButton
                  to={getMovieDetailPath(movie.slug)}
                  variant="secondary"
                  size="sm"
                  className="h-9 flex-1 border-ink-300 text-xs font-bold"
               >
                  Chi tiết
               </LinkButton>
            </div>
         </div>
      </article>
   );
}

export default MovieCard;
