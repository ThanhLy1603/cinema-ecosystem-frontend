import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
   useCallback,
   useEffect,
   useRef,
   useState,
   type MouseEvent as ReactMouseEvent,
   type PointerEvent as ReactPointerEvent,
   type ReactElement,
} from 'react';
import LinkButton from '@/components/ui/LinkButton';
import { cn } from '@/lib/common/utils';
import { formatCompactDuration } from '@/lib/movie/movieFormat';
import { AGE_RATING_DESCRIPTIONS } from '@/lib/movie/movieLabels';
import { getMovieBookingPath, getMovieDetailPath } from '@/lib/movie/moviePath';
import type { Movie } from '@/types/movie/movie';

interface HomeHeroProps {
   movies: Movie[];
}

interface DragStart {
   pointerId: number;
   startX: number;
   startY: number;
}

const HERO_BUTTON_CLASS_NAME: string = 'h-12 rounded-full px-8 text-sm font-bold uppercase tracking-wide';
const ARROW_BUTTON_CLASS_NAME: string =
   'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:grid';
const SLIDE_INTERVAL_MILLISECONDS: number = 6000;
const DRAG_ACTIVATION_PIXELS: number = 6;
const SWIPE_THRESHOLD_PIXELS: number = 50;
const WHEEL_SWIPE_THRESHOLD: number = 40;
const WHEEL_GESTURE_GAP_MILLISECONDS: number = 200;

export function HomeHero({ movies }: HomeHeroProps): ReactElement | null {
   const [activeIndex, setActiveIndex] = useState<number>(0);
   const [isPaused, setIsPaused] = useState<boolean>(false);
   const [isDragging, setIsDragging] = useState<boolean>(false);
   const sectionRef = useRef<HTMLElement>(null);
   const dragStartRef = useRef<DragStart | null>(null);
   const didDragRef = useRef<boolean>(false);
   const slideCount: number = movies.length;
   const safeActiveIndex: number = slideCount === 0 ? 0 : activeIndex % slideCount;
   const activeMovie: Movie | undefined = movies[safeActiveIndex];
   const hasMultipleSlides: boolean = slideCount > 1;

   const moveSlide: (slideOffset: number) => void = useCallback(
      (slideOffset: number): void => {
         setActiveIndex(
            (previousActiveIndex) => ((previousActiveIndex % slideCount) + slideOffset + slideCount) % slideCount,
         );
      },
      [slideCount],
   );

   useEffect((): (() => void) | void => {
      if (!hasMultipleSlides || isPaused || isDragging) {
         return;
      }
      const intervalId: number = window.setInterval((): void => moveSlide(1), SLIDE_INTERVAL_MILLISECONDS);
      return (): void => window.clearInterval(intervalId);
   }, [hasMultipleSlides, isPaused, isDragging, moveSlide, safeActiveIndex]);

   useEffect((): (() => void) | void => {
      const sectionElement: HTMLElement | null = sectionRef.current;
      if (!sectionElement || !hasMultipleSlides) {
         return;
      }
      let accumulatedDeltaX: number = 0;
      let lastWheelTime: number = 0;
      let isGestureConsumed: boolean = false;

      function handleWheel(wheelEvent: WheelEvent): void {
         if (Math.abs(wheelEvent.deltaX) <= Math.abs(wheelEvent.deltaY)) {
            return;
         }
         wheelEvent.preventDefault();
         const now: number = Date.now();
         if (now - lastWheelTime > WHEEL_GESTURE_GAP_MILLISECONDS) {
            accumulatedDeltaX = 0;
            isGestureConsumed = false;
         }
         lastWheelTime = now;
         if (isGestureConsumed) {
            return;
         }
         accumulatedDeltaX += wheelEvent.deltaX;
         if (Math.abs(accumulatedDeltaX) >= WHEEL_SWIPE_THRESHOLD) {
            moveSlide(accumulatedDeltaX > 0 ? 1 : -1);
            isGestureConsumed = true;
         }
      }

      sectionElement.addEventListener('wheel', handleWheel, { passive: false });
      return (): void => sectionElement.removeEventListener('wheel', handleWheel);
   }, [hasMultipleSlides, moveSlide]);

   function showPreviousSlide(): void {
      moveSlide(-1);
   }

   function showNextSlide(): void {
      moveSlide(1);
   }

   function pauseSlides(): void {
      setIsPaused(true);
   }

   function resumeSlides(): void {
      setIsPaused(false);
   }

   function endDrag(): void {
      dragStartRef.current = null;
      setIsDragging(false);
   }

   function handlePointerDown(pointerEvent: ReactPointerEvent<HTMLElement>): void {
      didDragRef.current = false;
      if (!hasMultipleSlides || (pointerEvent.pointerType === 'mouse' && pointerEvent.button !== 0)) {
         return;
      }
      if (pointerEvent.target instanceof Element && pointerEvent.target.closest('a, button')) {
         return;
      }
      dragStartRef.current = {
         pointerId: pointerEvent.pointerId,
         startX: pointerEvent.clientX,
         startY: pointerEvent.clientY,
      };
      setIsDragging(true);
      if (pointerEvent.pointerType === 'mouse') {
         pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
      }
   }

   function handlePointerMove(pointerEvent: ReactPointerEvent<HTMLElement>): void {
      const dragStart: DragStart | null = dragStartRef.current;
      if (!dragStart || dragStart.pointerId !== pointerEvent.pointerId) {
         return;
      }
      if (Math.abs(pointerEvent.clientX - dragStart.startX) > DRAG_ACTIVATION_PIXELS) {
         didDragRef.current = true;
      }
   }

   function handlePointerUp(pointerEvent: ReactPointerEvent<HTMLElement>): void {
      const dragStart: DragStart | null = dragStartRef.current;
      if (!dragStart || dragStart.pointerId !== pointerEvent.pointerId) {
         return;
      }
      const deltaX: number = pointerEvent.clientX - dragStart.startX;
      const deltaY: number = pointerEvent.clientY - dragStart.startY;
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PIXELS && Math.abs(deltaX) > Math.abs(deltaY)) {
         moveSlide(deltaX < 0 ? 1 : -1);
      }
      if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
         pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
      }
      endDrag();
   }

   function handleClickCapture(mouseEvent: ReactMouseEvent<HTMLElement>): void {
      if (didDragRef.current) {
         mouseEvent.preventDefault();
         mouseEvent.stopPropagation();
         didDragRef.current = false;
      }
   }

   if (!activeMovie) {
      return null;
   }

   const genreNames: string = activeMovie.genres.map((genre) => genre.name).join(', ');
   const metaParts: string[] = [
      AGE_RATING_DESCRIPTIONS[activeMovie.rated],
      formatCompactDuration(activeMovie.durationMinutes),
      ...(genreNames === '' ? [] : [genreNames]),
   ];

   return (
      <section
         ref={sectionRef}
         aria-roledescription="carousel"
         aria-label="Phim nổi bật"
         onMouseEnter={pauseSlides}
         onMouseLeave={resumeSlides}
         onFocus={pauseSlides}
         onBlur={resumeSlides}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={endDrag}
         onClickCapture={handleClickCapture}
         className={cn(
            'relative -mt-16 w-full touch-pan-y select-none overflow-hidden',
            hasMultipleSlides && (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
         )}
      >
         <div className="relative [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)] h-[560px] w-full sm:h-[640px] lg:h-screen lg:max-h-[780px] lg:min-h-[620px]">
            {movies.map((movie, movieIndex) => {
               const artworkUrl: string | null = movie.bannerUrl ?? movie.posterUrl;
               const isActive: boolean = movieIndex === safeActiveIndex;
               return (
                  <div
                     key={movie.id}
                     aria-hidden={!isActive}
                     className={cn(
                        'absolute inset-0 transition-opacity duration-700',
                        isActive ? 'opacity-100' : 'pointer-events-none opacity-0',
                     )}
                  >
                     {artworkUrl ? (
                        <img
                           src={artworkUrl}
                           alt={`Banner phim ${movie.title}`}
                           draggable={false}
                           className={cn(
                              'size-full object-cover object-center',
                              movie.bannerUrl === null && 'scale-110 opacity-80 blur-sm',
                           )}
                        />
                     ) : (
                        <div className="size-full bg-gradient-to-br from-brand-100 to-brand-200" />
                     )}
                  </div>
               );
            })}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/95 via-white/60 to-transparent sm:w-3/5" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/70 to-transparent" />
         </div>

         {hasMultipleSlides && (
            <>
               <button
                  type="button"
                  onClick={showPreviousSlide}
                  aria-label="Phim trước"
                  className={cn(ARROW_BUTTON_CLASS_NAME, 'left-4 lg:left-8')}
               >
                  <ChevronLeft className="size-5" aria-hidden="true" />
               </button>
               <button
                  type="button"
                  onClick={showNextSlide}
                  aria-label="Phim kế tiếp"
                  className={cn(ARROW_BUTTON_CLASS_NAME, 'right-4 lg:right-8')}
               >
                  <ChevronRight className="size-5" aria-hidden="true" />
               </button>
               <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2">
                  {movies.map((movie, movieIndex) => (
                     <button
                        key={movie.id}
                        type="button"
                        onClick={() => setActiveIndex(movieIndex)}
                        aria-label={`Xem phim ${movie.title}`}
                        aria-current={movieIndex === safeActiveIndex}
                        className={cn(
                           'h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                           movieIndex === safeActiveIndex
                              ? 'w-6 bg-brand-600'
                              : 'w-2 bg-brand-600/30 hover:bg-brand-600/60',
                        )}
                     />
                  ))}
               </div>
            </>
         )}

         <div
            key={activeMovie.id}
            className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl animate-fade-in px-6 pb-20 sm:px-10 sm:pb-24 lg:px-14"
         >
            <h1 className="max-w-xl text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
               {activeMovie.title}
            </h1>
            <p className="mt-4 text-sm text-ink-700">{metaParts.join('  |  ')}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
               {activeMovie.status !== 'ENDED' && (
                  <LinkButton
                     to={getMovieBookingPath(activeMovie.slug)}
                     variant="light"
                     className={cn(
                        HERO_BUTTON_CLASS_NAME,
                        'bg-[#0cf26a] text-ink-900 shadow-[0_10px_26px_-8px_rgb(12_242_106/0.75)] hover:bg-[#35ff86] hover:text-ink-900',
                     )}
                  >
                     Mua vé ngay
                  </LinkButton>
               )}
               <LinkButton
                  to={getMovieDetailPath(activeMovie.slug)}
                  variant="ghost"
                  className={cn(
                     HERO_BUTTON_CLASS_NAME,
                     'border border-ink-900 bg-white/40 text-ink-900 hover:bg-white hover:text-ink-900',
                  )}
               >
                  Thông tin chi tiết
               </LinkButton>
            </div>
         </div>
      </section>
   );
}

export default HomeHero;
