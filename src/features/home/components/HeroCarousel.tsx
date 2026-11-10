import { ChevronLeft, ChevronRight, Clapperboard, Clock, Play } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import TrailerModal from '@/components/common/TrailerModal';
import LinkButton from '@/components/ui/LinkButton';
import Button from '@/components/ui/Button';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import { MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import { getMovieDetailPath } from '@/lib/movie/moviePath';
import { toTrailerSource, type TrailerSource } from '@/lib/movie/trailer';
import { cn } from '@/lib/common/utils';
import type { Movie } from '@/types/movie/movie';

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
                  movie.bannerUrl ? 'opacity-70' : 'scale-110 opacity-40 blur-md',
               )}
            />
         ) : (
            <div className="absolute inset-0 -z-10 bg-brand-800" />
         )}
         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/95 via-ink-900/65 to-ink-900/10" />

         <div className="mx-auto grid h-full max-w-7xl items-center gap-10 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_230px] lg:px-8">
            <div className="max-w-2xl space-y-5 text-white">
               <div className="flex flex-wrap items-center gap-3">
                  <AgeRatingBadge ageRating={movie.rated} className="text-sm" />
                  <span className="rounded bg-white/15 px-2.5 py-1 text-xs font-semibold">
                     {MOVIE_STATUS_LABELS[movie.status]}
                  </span>
               </div>
               <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
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
                  <LinkButton to={getMovieDetailPath(movie.slug)} size="lg" tabIndex={isActive ? 0 : -1}>
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
               to={getMovieDetailPath(movie.slug)}
               tabIndex={-1}
               aria-hidden="true"
               className="hidden aspect-[2/3] overflow-hidden rounded-lg bg-brand-800 shadow-soft ring-1 ring-white/25 lg:block"
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
         className="relative isolate overflow-hidden bg-ink-900"
         onMouseEnter={() => setIsPaused(true)}
         onMouseLeave={() => setIsPaused(false)}
         onFocus={() => setIsPaused(true)}
         onBlur={() => setIsPaused(false)}
      >
         <div className="relative h-[400px] sm:h-[440px] lg:h-[480px]">
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
                  className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-md bg-ink-900/40 text-white transition-colors hover:bg-ink-900/70 sm:grid"
               >
                  <ChevronLeft className="size-6" aria-hidden="true" />
               </button>
               <button
                  type="button"
                  onClick={showNext}
                  aria-label="Phim tiếp theo"
                  className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-md bg-ink-900/40 text-white transition-colors hover:bg-ink-900/70 sm:grid"
               >
                  <ChevronRight className="size-6" aria-hidden="true" />
               </button>
               <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                  {movies.map((movie, movieIndex) => (
                     <button
                        key={movie.id}
                        type="button"
                        onClick={() => setActiveIndex(movieIndex)}
                        aria-label={`Chuyển tới phim ${movie.title}`}
                        aria-current={movieIndex === activeIndex}
                        className={cn(
                           'h-1.5 rounded-full transition-all',
                           movieIndex === activeIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70',
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
