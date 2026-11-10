import type { ReactElement } from 'react';
import { MOVIE_STATUS_LABELS } from '@/lib/movieLabels';
import { cn } from '@/lib/utils';
import type { MovieStatus } from '@/types/movie';

interface MovieStatusBadgeProps {
   movieStatus: MovieStatus;
   isDeleted?: boolean;
}

const STATUS_CLASSES: Record<MovieStatus, string> = {
   NOW_SHOWING: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
   COMING_SOON: 'bg-amber-50 text-ink-800 ring-amber-200',
   ENDED: 'bg-ink-100 text-ink-600 ring-ink-200',
};

export function MovieStatusBadge({ movieStatus, isDeleted = false }: MovieStatusBadgeProps): ReactElement {
   if (isDeleted) {
      return (
         <span className="inline-flex items-center whitespace-nowrap rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-500 ring-1 ring-ink-200">
            Đã xóa
         </span>
      );
   }
   return (
      <span
         className={cn(
            'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
            STATUS_CLASSES[movieStatus],
         )}
      >
         {MOVIE_STATUS_LABELS[movieStatus]}
      </span>
   );
}

export default MovieStatusBadge;
