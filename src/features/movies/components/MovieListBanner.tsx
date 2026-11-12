import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/common/utils';
import type { Movie } from '@/types/movie/movie';

interface MovieListBannerProps {
   movies: Movie[];
   eyebrow: string;
   title: string;
   description: string;
   children?: ReactNode;
}

const MAX_BANNER_SLIDES: number = 5;
const BANNER_INTERVAL_MILLISECONDS: number = 5000;

export function MovieListBanner({ movies, eyebrow, title, description, children }: MovieListBannerProps): ReactElement {
   const [activeIndex, setActiveIndex] = useState<number>(0);
   const bannerMovies: Movie[] = movies.filter((movie) => movie.bannerUrl !== null).slice(0, MAX_BANNER_SLIDES);
   const slideCount: number = bannerMovies.length;
   const safeActiveIndex: number = slideCount === 0 ? 0 : activeIndex % slideCount;

   useEffect((): (() => void) | void => {
      if (slideCount < 2) {
         return;
      }
      const intervalId: number = window.setInterval((): void => {
         setActiveIndex((previousActiveIndex) => (previousActiveIndex + 1) % slideCount);
      }, BANNER_INTERVAL_MILLISECONDS);
      return (): void => window.clearInterval(intervalId);
   }, [slideCount, safeActiveIndex]);

   return (
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-100 via-brand-50 to-accent-100">
         {bannerMovies.map((movie, movieIndex) => (
            <img
               key={movie.id}
               src={movie.bannerUrl ?? undefined}
               alt=""
               aria-hidden="true"
               className={cn(
                  'absolute inset-0 size-full object-cover object-center transition-opacity duration-700',
                  movieIndex === safeActiveIndex ? 'opacity-100' : 'opacity-0',
               )}
            />
         ))}
         <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-transparent" />

         <div className="relative mx-auto flex min-h-[230px] w-full max-w-6xl flex-col justify-center gap-2 px-4 py-8 sm:min-h-[260px] sm:px-6 lg:px-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{eyebrow}</p>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
            <p className="max-w-xl text-sm text-ink-800">{description}</p>
            {children && <div className="pt-3">{children}</div>}
         </div>

         {slideCount > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
               {bannerMovies.map((movie, movieIndex) => (
                  <button
                     key={movie.id}
                     type="button"
                     onClick={() => setActiveIndex(movieIndex)}
                     aria-label={`Xem banner phim ${movie.title}`}
                     aria-current={movieIndex === safeActiveIndex}
                     className={cn(
                        'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                        movieIndex === safeActiveIndex ? 'w-5 bg-brand-600' : 'w-1.5 bg-ink-900/35 hover:bg-ink-900/60',
                     )}
                  />
               ))}
            </div>
         )}
      </section>
   );
}

export default MovieListBanner;
