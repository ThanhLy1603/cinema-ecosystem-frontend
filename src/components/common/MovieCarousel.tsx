import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import MovieCard from '@/components/common/MovieCard';
import { cn } from '@/lib/common/utils';
import type { Movie } from '@/types/movie/movie';

interface MovieCarouselProps {
   movies: Movie[];
}

interface CarouselState {
   pageIndex: number;
   pageCount: number;
}

const INITIAL_CAROUSEL_STATE: CarouselState = { pageIndex: 0, pageCount: 1 };
const PAGE_TOLERANCE: number = 0.05;

function readCarouselState(track: HTMLElement): CarouselState {
   if (track.clientWidth === 0) {
      return INITIAL_CAROUSEL_STATE;
   }
   const pageCount: number = Math.max(Math.ceil(track.scrollWidth / track.clientWidth - PAGE_TOLERANCE), 1);
   const pageIndex: number = Math.min(Math.round(track.scrollLeft / track.clientWidth), pageCount - 1);
   return { pageIndex, pageCount };
}

function observeTrack(
   track: HTMLElement | null,
   onChange: (carouselState: CarouselState) => void,
): (() => void) | undefined {
   if (track === null) {
      return undefined;
   }
   onChange(readCarouselState(track));
   const resizeObserver: ResizeObserver = new ResizeObserver(() => onChange(readCarouselState(track)));
   resizeObserver.observe(track);
   return function stopObserving(): void {
      resizeObserver.disconnect();
   };
}

export function MovieCarousel({ movies }: MovieCarouselProps): ReactElement {
   const trackRef = useRef<HTMLDivElement>(null);
   const [carouselState, setCarouselState] = useState<CarouselState>(INITIAL_CAROUSEL_STATE);

   useEffect((): (() => void) | undefined => observeTrack(trackRef.current, setCarouselState), [movies.length]);

   function handleScroll(): void {
      if (trackRef.current) {
         setCarouselState(readCarouselState(trackRef.current));
      }
   }

   function scrollToPage(pageIndex: number): void {
      const track: HTMLDivElement | null = trackRef.current;
      if (track) {
         track.scrollTo({ left: pageIndex * track.clientWidth, behavior: 'smooth' });
      }
   }

   const { pageIndex, pageCount } = carouselState;

   return (
      <div className="space-y-6">
         <div className="relative">
            <div
               ref={trackRef}
               onScroll={handleScroll}
               className="-mx-2 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
               {movies.map((movie) => (
                  <div key={movie.id} className="w-1/2 shrink-0 snap-start px-2 sm:w-1/3 lg:w-1/4 xl:w-1/5">
                     <MovieCard movie={movie} />
                  </div>
               ))}
            </div>
            {pageCount > 1 && (
               <>
                  <button
                     type="button"
                     onClick={() => scrollToPage(Math.max(pageIndex - 1, 0))}
                     disabled={pageIndex === 0}
                     aria-label="Trang phim trước"
                     className="absolute -left-3 top-[34%] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink-100 transition-all hover:bg-brand-600 hover:text-white disabled:opacity-0 xl:-left-14"
                  >
                     <ChevronLeft className="size-6" aria-hidden="true" />
                  </button>
                  <button
                     type="button"
                     onClick={() => scrollToPage(Math.min(pageIndex + 1, pageCount - 1))}
                     disabled={pageIndex >= pageCount - 1}
                     aria-label="Trang phim sau"
                     className="absolute -right-3 top-[34%] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink-100 transition-all hover:bg-brand-600 hover:text-white disabled:opacity-0 xl:-right-14"
                  >
                     <ChevronRight className="size-6" aria-hidden="true" />
                  </button>
               </>
            )}
         </div>
         {pageCount > 1 && (
            <div className="flex justify-center gap-2.5">
               {Array.from({ length: pageCount }, (_, index) => (
                  <button
                     key={`page-${index}`}
                     type="button"
                     onClick={() => scrollToPage(index)}
                     aria-label={`Tới trang phim ${index + 1}`}
                     aria-current={index === pageIndex}
                     className={cn(
                        'size-3 rounded-full transition-all',
                        index === pageIndex ? 'scale-110 bg-brand-600' : 'bg-ink-300 hover:bg-ink-400',
                     )}
                  />
               ))}
            </div>
         )}
      </div>
   );
}

export default MovieCarousel;
