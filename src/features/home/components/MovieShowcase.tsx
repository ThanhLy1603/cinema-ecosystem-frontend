import { ArrowRight } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '@/components/common/MovieCard';
import { cn } from '@/lib/common/utils';
import type { Movie } from '@/types/movie/movie';

type ShowcaseTab = 'NOW_SHOWING' | 'COMING_SOON';

interface ShowcaseTabItem {
   tab: ShowcaseTab;
   label: string;
   viewAllTo: string;
   emptyMessage: string;
}

interface MovieShowcaseProps {
   nowShowingMovies: Movie[];
   comingSoonMovies: Movie[];
   isLoading: boolean;
}

const SHOWCASE_TAB_ITEMS: ShowcaseTabItem[] = [
   {
      tab: 'NOW_SHOWING',
      label: 'Đang chiếu',
      viewAllTo: '/movies',
      emptyMessage: 'Chưa có phim đang chiếu. Vui lòng quay lại sau.',
   },
   {
      tab: 'COMING_SOON',
      label: 'Sắp chiếu',
      viewAllTo: '/movies?status=COMING_SOON',
      emptyMessage: 'Chưa có phim sắp chiếu. Vui lòng quay lại sau.',
   },
];

const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5'];

export function MovieShowcase({ nowShowingMovies, comingSoonMovies, isLoading }: MovieShowcaseProps): ReactElement {
   const [activeTab, setActiveTab] = useState<ShowcaseTab>('NOW_SHOWING');
   const activeTabItem: ShowcaseTabItem =
      SHOWCASE_TAB_ITEMS.find((showcaseTabItem) => showcaseTabItem.tab === activeTab) ?? SHOWCASE_TAB_ITEMS[0];
   const activeMovies: Movie[] = activeTab === 'NOW_SHOWING' ? nowShowingMovies : comingSoonMovies;

   return (
      <section aria-labelledby="home-movies-heading" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
         <div className="flex flex-wrap items-end justify-between gap-x-6 border-b border-ink-200">
            <div className="flex items-end gap-8">
               <h2 id="home-movies-heading" className="pb-3 text-xl font-bold uppercase tracking-tight text-ink-900">
                  Phim
               </h2>
               <div role="tablist" aria-label="Trạng thái phim" className="flex gap-6">
                  {SHOWCASE_TAB_ITEMS.map((showcaseTabItem) => (
                     <button
                        key={showcaseTabItem.tab}
                        type="button"
                        role="tab"
                        aria-selected={showcaseTabItem.tab === activeTab}
                        onClick={() => setActiveTab(showcaseTabItem.tab)}
                        className={cn(
                           '-mb-px border-b-2 pb-3 text-sm font-semibold uppercase tracking-wide transition-colors',
                           showcaseTabItem.tab === activeTab
                              ? 'border-brand-600 text-brand-700'
                              : 'border-transparent text-ink-500 hover:text-ink-900',
                        )}
                     >
                        {showcaseTabItem.label}
                     </button>
                  ))}
               </div>
            </div>
            <Link
               to={activeTabItem.viewAllTo}
               className="inline-flex items-center gap-1.5 pb-3 text-sm font-semibold text-brand-700 hover:underline"
            >
               Xem tất cả
               <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
         </div>

         <div className="pt-6">
            {isLoading && (
               <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {SKELETON_KEYS.map((skeletonKey) => (
                     <div key={skeletonKey} className="space-y-3" aria-hidden="true">
                        <div className="aspect-[2/3] animate-pulse rounded-lg bg-ink-100" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
                     </div>
                  ))}
               </div>
            )}
            {!isLoading && activeMovies.length === 0 && (
               <p className="rounded-lg bg-white p-10 text-center text-sm text-ink-500 ring-1 ring-ink-200">
                  {activeTabItem.emptyMessage}
               </p>
            )}
            {!isLoading && activeMovies.length > 0 && (
               <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {activeMovies.map((movie) => (
                     <MovieCard key={movie.id} movie={movie} />
                  ))}
               </div>
            )}
         </div>
      </section>
   );
}

export default MovieShowcase;
