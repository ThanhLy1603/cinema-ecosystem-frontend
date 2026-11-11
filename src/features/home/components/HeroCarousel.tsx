import { ChevronLeft, ChevronRight, Clapperboard, Play, Sparkles, Ticket } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import TrailerModal from '@/components/common/TrailerModal';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton';
import { cn } from '@/lib/common/utils';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import { MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import { getMovieBookingPath, getMovieDetailPath } from '@/lib/movie/moviePath';
import { toTrailerSource, type TrailerSource } from '@/lib/movie/trailer';
import type { Movie } from '@/types/movie/movie';

interface HeroCarouselProps {
   movies: Movie[];
}

const AUTOPLAY_INTERVAL_MS: number = 7000;

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
   const canBook: boolean = movie.status !== 'ENDED';
   const tabIndex: number = isActive ? 0 : -1;

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
         {backgroundUrl && (
            <img
               src={backgroundUrl}
               alt=""
               className={cn(
                  'absolute inset-0 -z-10 size-full object-cover object-center',
                  movie.bannerUrl ? 'opacity-90' : 'scale-125 opacity-70 blur-sm',
                  isActive && movie.bannerUrl && 'animate-kenburns',
               )}
            />
         )}
         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/95 via-white/55 to-transparent" />
         <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ink-50 to-transparent" />

         <div className="mx-auto grid h-full max-w-6xl items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_230px] lg:px-12">
            <div
               className={cn(
                  'max-w-3xl space-y-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all delay-200 duration-700 ease-out',
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
               )}
            >
               <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                  <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
                  {MOVIE_STATUS_LABELS[movie.status]}
               </span>
               <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
                  {movie.title}
               </h2>
               <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-600 sm:text-sm">
                  <AgeRatingBadge ageRating={movie.rated} />
                  <span className="opacity-40">|</span>
                  <span>{formatDuration(movie.durationMinutes)}</span>
                  <span className="opacity-40">|</span>
                  <span>Khởi chiếu {formatReleaseDate(movie.releaseDate)}</span>
               </p>
               {movie.genres.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                     {movie.genres.map((genre) => (
                        <li
                           key={genre.id}
                           className="rounded-full border border-ink-300 bg-white/90 px-3.5 py-1 text-xs font-semibold text-ink-700 shadow-xs"
                        >
                           {genre.name}
                        </li>
                     ))}
                  </ul>
               )}
               <div className="flex flex-wrap gap-3 pt-2">
                  {canBook && (
                     <LinkButton
                        to={getMovieBookingPath(movie.slug)}
                        size="lg"
                        tabIndex={tabIndex}
                        icon={<Ticket className="size-4" aria-hidden="true" />}
                     >
                        Mua vé phim này
                     </LinkButton>
                  )}
                  {hasTrailer && (
                     <Button
                        size="lg"
                        variant="secondary"
                        tabIndex={tabIndex}
                        icon={<Play className="size-4" aria-hidden="true" />}
                        onClick={() => onOpenTrailer(movie)}
                     >
                        Xem trailer
                     </Button>
                  )}
                  <LinkButton to={getMovieDetailPath(movie.slug)} size="lg" variant="ghost" tabIndex={tabIndex}>
                     Xem chi tiết
                  </LinkButton>
               </div>
            </div>

            <Link
               to={getMovieDetailPath(movie.slug)}
               tabIndex={-1}
               aria-hidden="true"
               className={cn(
                  'hidden aspect-[2/3] overflow-hidden rounded-xl border border-ink-200 bg-ink-900 shadow-xl transition-all delay-300 duration-1000 ease-out hover:-translate-y-1 hover:shadow-2xl lg:block',
                  isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
               )}
            >
               {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt="" className="size-full object-cover" />
               ) : (
                  <span className="grid size-full place-items-center text-ink-500">
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
         className="relative isolate overflow-hidden bg-brand-100"
         onMouseEnter={() => setIsPaused(true)}
         onMouseLeave={() => setIsPaused(false)}
         onFocus={() => setIsPaused(true)}
         onBlur={() => setIsPaused(false)}
      >
         <div className="relative h-[560px] sm:h-[520px] lg:h-[540px]">
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
                  className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white/80 text-ink-700 shadow-xs transition-colors hover:bg-white hover:text-brand-600 xl:grid"
               >
                  <ChevronLeft className="size-6" aria-hidden="true" />
               </button>
               <button
                  type="button"
                  onClick={showNext}
                  aria-label="Phim tiếp theo"
                  className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white/80 text-ink-700 shadow-xs transition-colors hover:bg-white hover:text-brand-600 xl:grid"
               >
                  <ChevronRight className="size-6" aria-hidden="true" />
               </button>
               <div className="absolute inset-x-0 bottom-14 flex justify-center gap-1.5">
                  {movies.map((movie, movieIndex) => (
                     <button
                        key={movie.id}
                        type="button"
                        onClick={() => setActiveIndex(movieIndex)}
                        aria-label={`Chuyển tới phim ${movie.title}`}
                        aria-current={movieIndex === activeIndex}
                        className={cn(
                           'h-1.5 rounded-full transition-all',
                           movieIndex === activeIndex ? 'w-8 bg-brand-600' : 'w-4 bg-ink-300 hover:bg-brand-400',
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
