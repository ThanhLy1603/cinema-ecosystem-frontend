import type { ReactElement } from 'react';
import { MOVIE_STATUSES, MOVIE_STATUS_LABELS } from '@/lib/movie/movieLabels';
import { cn } from '@/lib/common/utils';
import type { MovieStatus } from '@/types/movie/movie';

type MovieStatusTabsTone = 'light' | 'dark';

interface MovieStatusTabsProps {
   activeStatus: MovieStatus;
   tone?: MovieStatusTabsTone;
   statuses?: MovieStatus[];
   onChange: (movieStatus: MovieStatus) => void;
}

export function MovieStatusTabs({
   activeStatus,
   tone = 'light',
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
                  'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                  movieStatus === activeStatus
                     ? tone === 'dark'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'bg-brand-600 text-white shadow-sm'
                     : tone === 'dark'
                       ? 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25'
                       : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-brand-700 hover:ring-brand-200',
               )}
            >
               {MOVIE_STATUS_LABELS[movieStatus]}
            </button>
         ))}
      </div>
   );
}

export default MovieStatusTabs;
