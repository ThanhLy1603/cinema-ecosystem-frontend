import type { ReactElement } from 'react';
import { MOVIE_STATUSES, MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import { cn } from '@/lib/common/utils';
import type { MovieStatus } from '@/types/movie/movie';

interface MovieStatusTabsProps {
   activeStatus: MovieStatus;
   statuses?: MovieStatus[];
   onChange: (movieStatus: MovieStatus) => void;
}

export function MovieStatusTabs({
   activeStatus,
   statuses = MOVIE_STATUSES,
   onChange,
}: MovieStatusTabsProps): ReactElement {
   return (
      <div role="tablist" aria-label="Trạng thái phim" className="flex flex-wrap gap-2">
         {statuses.map((movieStatus) => (
            <button
               key={movieStatus}
               type="button"
               role="tab"
               aria-selected={movieStatus === activeStatus}
               onClick={() => onChange(movieStatus)}
               className={cn(
                  'whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
                  movieStatus === activeStatus
                     ? 'bg-brand-500 text-white shadow-glow'
                     : 'border border-ink-200 bg-white text-ink-700 shadow-xs hover:text-brand-600',
               )}
            >
               {MOVIE_STATUS_LABELS[movieStatus]}
            </button>
         ))}
      </div>
   );
}

export default MovieStatusTabs;
