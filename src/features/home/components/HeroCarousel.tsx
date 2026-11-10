import { ChevronLeft, ChevronRight, Clapperboard, Clock, Play } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import TrailerModal from '@/components/common/TrailerModal';
import LinkButton from '@/components/ui/LinkButton';
import Button from '@/components/ui/Button';
import { formatDuration, formatReleaseDate } from '@/lib/movieFormat';
import { MOVIE_STATUS_LABELS } from '@/lib/movieLabels';
import { toTrailerSource, type TrailerSource } from '@/lib/trailer';
import { cn } from '@/lib/utils';
import type { Movie } from '@/types/movie';

interface HeroCarouselProps {
   movies: Movie[];
}

const AUTOPLAY_INTERVAL_MS: number = 6000;

function startAutoplay(
   slideCount: number,
   setActiveIndex: (updater: (previousActiveIndex: number) => number) => void,
): (() => void) | undefined {
   if (slideCount < 2) {
      return undefined;
   }
   const intervalId: number = window.setInterval(
      () => setActiveIndex((previousActiveIndex) => (previousActiveIndex + 1) % slideCount),
      AUTOPLAY_INTERVAL_MS,
   );
   return function stopAutoplay(): void {
      window.clearInterval(intervalId);
   };
}

interface HeroSlideProps {
   movie: Movie;
   isActive: boolean;
   slideLabel: string;
   onOpenTrailer: (movie: Movie) => void;
}

function HeroSlide({ movie, isActive, slideLabel, onOpenTrailer }: HeroSlideProps): ReactElement {
   const backgroundUrl: string | null = movie.bannerUrl ?? movie.posterUrl;
   const hasTrailer: boolean = movie.trailerUrl !== null && toTrailerSource(movie.trailerUrl, false) !== null;

   return (
      <div
         role="group"
         aria-roledescription="slide"
         aria-label={slideLabel}
         aria-hidden={!isActive}
         className={cn(
            'absolute inset-0 transition-opacity duration-700',
            isActive ? 'opacity-100' : 'pointer-events-none opacity-0',
         )}
      >
         {backgroundUrl ? (
            <img
               src={backgroundUrl}
               alt=""
               className={cn(
                  'absolute inset-0 -z-10 size-full object-cover',
                  movie.bannerUrl ? 'opacity-60' : 'scale-110 opacity-40 blur-md',
               )}
            />
         ) : (
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700 to-accent-500" />
         )}
         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900 via-brand-900/75 to-brand-900/10" />
         <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-brand-900/80 to-transparent" />

         <div className="mx-auto grid h-full max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_260px] lg:px-8">
            <div className="max-w-2xl space-y-5 text-white">
               <div className="flex flex-wrap items-center gap-3">
                  <AgeRatingBadge ageRating={movie.rated} className="text-sm" />
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                     {MOVIE_STATUS_LABELS[movie.status]}
                  </span>
               </div>
               <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                  {movie.title}
               </h2>
               <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/85">
                  <span className="inline-flex items-center gap-1.5">
                     <Clock className="size-4" aria-hidden="true" />
                     {formatDuration(movie.durationMinutes)}
                  </span>
                  <span>Khởi chiếu {formatReleaseDate(movie.releaseDate)}</span>
                  {movie.genres.length > 0 && <span>{movie.genres.map((genre) => genre.name).join(' · ')}</span>}
               </p>
               <div className="flex flex-wrap gap-3 pt-2">
                  <LinkButton to={`/movies/${movie.id}`} size="lg" tabIndex={isActive ? 0 : -1}>
                     Xem chi tiết
                  </LinkButton>
                  {hasTrailer && (
                     <Button
                        size="lg"
                        variant="light"
                        tabIndex={isActive ? 0 : -1}
                        icon={<Play className="size-4" aria-hidden="true" />}
                        onClick={() => onOpenTrailer(movie)}
                     >
                        Xem trailer
                     </Button>
                  )}
               </div>
            </div>

            <Link
               to={`/movies/${movie.id}`}
               tabIndex={-1}
               aria-hidden="true"
               className="hidden aspect-[2/3] overflow-hidden rounded-3xl bg-brand-800 shadow-soft ring-4 ring-white/20 lg:block"
            >
               {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt="" className="size-full object-cover" />
               ) : (
                  <span className="grid size-full place-items-center text-brand-300">
                     <Clapperboard className="size-16" aria-hidden="true" />
                  </span>
               )}
            </Link>
         </div>
      </div>
   );
}

export function HeroCarousel({ movies }: HeroCarouselProps): ReactElement {
   const [activeIndex, setActiveIndex] = useState<number>(0);
   const [isPaused, setIsPaused] = useState<boolean>(false);
   const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
   const slideCount: number = movies.length;

   function showNext(): void {
      setActiveIndex((previousActiveIndex) => (previousActiveIndex + 1) % slideCount);
   }

   function showPrevious(): void {
      setActiveIndex((previousActiveIndex) => (previousActiveIndex - 1 + slideCount) % slideCount);
   }

   useEffect(
      (): (() => void) | undefined => (isPaused ? undefined : startAutoplay(slideCount, setActiveIndex)),
      [isPaused, slideCount],
   );

   function closeTrailer(): void {
      setTrailerMovie(null);
   }

   const trailerSource: TrailerSource | null = trailerMovie?.trailerUrl
      ? toTrailerSource(trailerMovie.trailerUrl, true)
      : null;

   return (
      <section
         aria-roledescription="carousel"
         aria-label="Phim nổi bật"
         className="relative isolate overflow-hidden bg-brand-900"
         onMouseEnter={() => setIsPaused(true)}
         onMouseLeave={() => setIsPaused(false)}
         onFocus={() => setIsPaused(true)}
         onBlur={() => setIsPaused(false)}
      >
         <div className="relative h-[460px] sm:h-[500px] lg:h-[560px]">
            {movies.map((movie, movieIndex) => (
               <HeroSlide
                  key={movie.id}
                  movie={movie}
                  isActive={movieIndex === activeIndex}
                  slideLabel={`${movieIndex + 1} / ${slideCount}`}
                  onOpenTrailer={setTrailerMovie}
               />
            ))}
         </div>

         {slideCount > 1 && (
            <>
               <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Phim trước"
                  className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 sm:grid"
               >
                  <ChevronLeft className="size-6" aria-hidden="true" />
               </button>
               <button
                  type="button"
                  onClick={showNext}
                  aria-label="Phim tiếp theo"
                  className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 sm:grid"
               >
                  <ChevronRight className="size-6" aria-hidden="true" />
               </button>
               <div className="absolute inset-x-0 bottom-16 flex justify-center gap-2">
                  {movies.map((movie, movieIndex) => (
                     <button
                        key={movie.id}
                        type="button"
                        onClick={() => setActiveIndex(movieIndex)}
                        aria-label={`Chuyển tới phim ${movie.title}`}
                        aria-current={movieIndex === activeIndex}
                        className={cn(
                           'h-2 rounded-full transition-all',
                           movieIndex === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80',
                        )}
                     />
                  ))}
               </div>
            </>
         )}

         {trailerMovie && trailerSource && (
            <TrailerModal movieTitle={trailerMovie.title} trailerSource={trailerSource} onClose={closeTrailer} />
         )}
      </section>
   );
}

export default HeroCarousel;
