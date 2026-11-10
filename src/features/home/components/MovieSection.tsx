import { ArrowRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '@/components/common/MovieCard';
import MovieCarousel from '@/components/common/MovieCarousel';
import SectionTitle from '@/components/common/SectionTitle';
import type { Movie } from '@/types/movie';

type MovieSectionLayout = 'carousel' | 'grid';

interface MovieSectionProps {
   title: string;
   emptyMessage: string;
   viewAllTo: string;
   movies: Movie[];
   isLoading: boolean;
   layout: MovieSectionLayout;
}

const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5'];

export function MovieSection({
   title,
   emptyMessage,
   viewAllTo,
   movies,
   isLoading,
   layout,
}: MovieSectionProps): ReactElement {
   return (
      <section className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-12">
         <SectionTitle title={title} />

         {isLoading && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
               {SKELETON_KEYS.map((skeletonKey) => (
                  <div key={skeletonKey} className="space-y-3" aria-hidden="true">
                     <div className="aspect-[2/3] animate-pulse rounded-2xl bg-ink-100" />
                     <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
                     <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
                  </div>
               ))}
            </div>
         )}
         {!isLoading && movies.length === 0 && (
            <p className="rounded-3xl bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-100">
               {emptyMessage}
            </p>
         )}
         {!isLoading && movies.length > 0 && layout === 'carousel' && <MovieCarousel movies={movies} />}
         {!isLoading && movies.length > 0 && layout === 'grid' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
               {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
               ))}
            </div>
         )}

         {!isLoading && movies.length > 0 && (
            <div className="flex justify-center">
               <Link
                  to={viewAllTo}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-brand-600 px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-brand-700 transition-colors hover:bg-brand-600 hover:text-white"
               >
                  Xem tất cả
                  <ArrowRight className="size-4" aria-hidden="true" />
               </Link>
            </div>
         )}
      </section>
   );
}

export default MovieSection;
