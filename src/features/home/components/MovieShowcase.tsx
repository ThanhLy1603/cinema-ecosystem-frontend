import { ArrowRight, Sparkles } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '@/components/common/MovieCard';
import MovieStatusTabs from '@/components/common/MovieStatusTabs';
import Reveal from '@/components/common/Reveal';
import SectionHeader from '@/components/common/SectionHeader';
import type { Movie, MovieStatus } from '@/types/movie/movie';

type ShowcaseStatus = Extract<MovieStatus, 'NOW_SHOWING' | 'COMING_SOON'>;

interface MovieShowcaseProps {
   nowShowingMovies: Movie[];
   comingSoonMovies: Movie[];
   isLoading: boolean;
}

const SHOWCASE_STATUSES: MovieStatus[] = ['NOW_SHOWING', 'COMING_SOON'];
const VIEW_ALL_PATHS: Record<ShowcaseStatus, string> = {
   NOW_SHOWING: '/movies',
   COMING_SOON: '/movies?status=COMING_SOON',
};
const EMPTY_MESSAGES: Record<ShowcaseStatus, string> = {
   NOW_SHOWING: 'Chưa có phim đang chiếu. Vui lòng quay lại sau.',
   COMING_SOON: 'Chưa có phim sắp chiếu. Vui lòng quay lại sau.',
};
const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'];

function toShowcaseStatus(movieStatus: MovieStatus): ShowcaseStatus {
   return movieStatus === 'COMING_SOON' ? 'COMING_SOON' : 'NOW_SHOWING';
}

export function MovieShowcase({ nowShowingMovies, comingSoonMovies, isLoading }: MovieShowcaseProps): ReactElement {
   const [activeStatus, setActiveStatus] = useState<ShowcaseStatus>('NOW_SHOWING');
   const activeMovies: Movie[] = activeStatus === 'NOW_SHOWING' ? nowShowingMovies : comingSoonMovies;

   function handleStatusChange(movieStatus: MovieStatus): void {
      setActiveStatus(toShowcaseStatus(movieStatus));
   }

   return (
      <section aria-labelledby="home-movies-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-12">
         <SectionHeader
            eyebrow="Phim hot tại rạp"
            eyebrowIcon={Sparkles}
            title="Danh sách phim"
            description="Chọn phim yêu thích, xem trailer và đặt vé chỉ trong vài bước."
            headingId="home-movies-heading"
            action={
               <MovieStatusTabs
                  activeStatus={activeStatus}
                  statuses={SHOWCASE_STATUSES}
                  onChange={handleStatusChange}
               />
            }
         />

         {isLoading && (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
               {SKELETON_KEYS.map((skeletonKey) => (
                  <div key={skeletonKey} className="space-y-3" aria-hidden="true">
                     <div className="aspect-[2/3] animate-pulse rounded-2xl bg-ink-100" />
                     <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
                     <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
                  </div>
               ))}
            </div>
         )}
         {!isLoading && activeMovies.length === 0 && (
            <p className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-sm text-ink-500">
               {EMPTY_MESSAGES[activeStatus]}
            </p>
         )}
         {!isLoading && activeMovies.length > 0 && (
            <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
               {activeMovies.map((movie, movieIndex) => (
                  <Reveal key={`${activeStatus}-${movie.id}`} delayMs={(movieIndex % 4) * 90} className="h-full">
                     <MovieCard movie={movie} />
                  </Reveal>
               ))}
            </div>
         )}

         <div className="mt-8 flex justify-center">
            <Link
               to={VIEW_ALL_PATHS[activeStatus]}
               className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline"
            >
               Xem tất cả phim
               <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
         </div>
      </section>
   );
}

export default MovieShowcase;
