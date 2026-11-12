import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { cn } from '@/lib/common/utils';
import type { Movie } from '@/types/movie/movie';
import PosterMovieCard from './PosterMovieCard';

type MovieGridColumns = 3 | 4 | 5;

interface HomeMovieSectionProps {
   sectionId: string;
   title: string;
   movies: Movie[];
   isLoading: boolean;
   columns: MovieGridColumns;
   emptyMessage: string;
   viewAllTo: string;
   hideWhenEmpty?: boolean;
}

const GRID_COLUMN_CLASS_NAMES: Record<MovieGridColumns, string> = {
   3: 'grid-cols-2 md:grid-cols-3',
   4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
   5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
};

const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5'];

export function HomeMovieSection({
   sectionId,
   title,
   movies,
   isLoading,
   columns,
   emptyMessage,
   viewAllTo,
   hideWhenEmpty = false,
}: HomeMovieSectionProps): ReactElement | null {
   const headingId: string = `${sectionId}-heading`;

   if (hideWhenEmpty && !isLoading && movies.length === 0) {
      return null;
   }

   return (
      <section id={sectionId} aria-labelledby={headingId} className="px-4 py-10 sm:px-6 sm:py-12 lg:px-12">
         <div className="mx-auto max-w-4xl">
            <SectionHeading title={title} headingId={headingId} className="mb-8" />

            {isLoading && (
               <div
                  className={cn('grid gap-x-6 gap-y-10 sm:gap-x-8', GRID_COLUMN_CLASS_NAMES[columns])}
                  aria-hidden="true"
               >
                  {SKELETON_KEYS.slice(0, columns).map((skeletonKey) => (
                     <div key={skeletonKey} className="space-y-3">
                        <div className="aspect-[2/3] animate-pulse rounded-lg bg-brand-100" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-brand-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-brand-100" />
                     </div>
                  ))}
               </div>
            )}
            {!isLoading && movies.length === 0 && (
               <p className="rounded-2xl border border-brand-100 bg-white py-12 text-center text-sm text-ink-500">
                  {emptyMessage}
               </p>
            )}
            {!isLoading && movies.length > 0 && (
               <>
                  <div className={cn('grid gap-x-6 gap-y-10 sm:gap-x-8', GRID_COLUMN_CLASS_NAMES[columns])}>
                     {movies.map((movie, movieIndex) => (
                        <Reveal key={movie.id} delayMs={(movieIndex % columns) * 70} className="h-full">
                           <PosterMovieCard movie={movie} />
                        </Reveal>
                     ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                     <Link
                        to={viewAllTo}
                        className="rounded-full border border-brand-600 bg-white px-8 py-2 text-xs font-bold uppercase tracking-wide text-brand-700 shadow-sm transition-colors hover:bg-brand-600 hover:text-white"
                     >
                        Xem tất cả
                     </Link>
                  </div>
               </>
            )}
         </div>
      </section>
   );
}

export default HomeMovieSection;
