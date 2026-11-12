import { Clapperboard, Clock } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingLabel from '@/components/common/AgeRatingLabel';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import { getMovieDetailPath } from '@/lib/movie/moviePath';
import type { Movie } from '@/types/movie/movie';

interface PosterMovieCardProps {
   movie: Movie;
}

export function PosterMovieCard({ movie }: PosterMovieCardProps): ReactElement {
   const imageUrl: string | null = movie.posterUrl ?? movie.bannerUrl;
   const genreNames: string = movie.genres.map((genre) => genre.name).join(', ');
   const isComingSoon: boolean = movie.status === 'COMING_SOON';

   return (
      <article className="group flex h-full flex-col gap-3">
         <Link
            to={getMovieDetailPath(movie.slug)}
            aria-label={`Xem phim ${movie.title}`}
            className="relative block aspect-[2/3] overflow-hidden rounded-2xl bg-ink-100 shadow-[0_14px_30px_-14px_rgb(15_23_42/0.5)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_36px_-14px_rgb(15_23_42/0.55)]"
         >
            {imageUrl ? (
               <img
                  src={imageUrl}
                  alt={`Hình phim ${movie.title}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <span className="grid size-full place-items-center text-ink-300">
                  <Clapperboard className="size-12" aria-hidden="true" />
               </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-center text-xs font-bold uppercase tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
               {isComingSoon ? 'Xem chi tiết' : 'Mua vé ngay'}
            </span>
         </Link>

         <div className="space-y-1.5">
            <h3 className="line-clamp-2 text-base font-extrabold uppercase leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
               <Link to={getMovieDetailPath(movie.slug)}>{movie.title}</Link>
            </h3>
            <div className="space-y-1 text-xs text-ink-700">
               <AgeRatingLabel ageRating={movie.rated} />
               <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1">
                     <Clock className="size-3.5" aria-hidden="true" />
                     {formatDuration(movie.durationMinutes)}
                  </span>
                  {isComingSoon && (
                     <span className="font-semibold text-accent-600">
                        Khởi chiếu {formatReleaseDate(movie.releaseDate)}
                     </span>
                  )}
               </p>
            </div>
            {genreNames !== '' && <p className="line-clamp-1 text-xs text-ink-500">Thể loại phim: {genreNames}</p>}
         </div>
      </article>
   );
}

export default PosterMovieCard;
