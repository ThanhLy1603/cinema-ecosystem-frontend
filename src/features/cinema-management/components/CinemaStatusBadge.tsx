import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { CinemaStatus, HallStatus } from '@/types/cinema';
import { CINEMA_STATUS_LABELS, HALL_STATUS_LABELS } from '../utils/labels';

interface CinemaStatusBadgeProps {
   cinemaStatus?: CinemaStatus;
   hallStatus?: HallStatus;
}

const STATUS_CLASSES: Record<CinemaStatus | HallStatus, string> = {
   ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
   INACTIVE: 'bg-gold-50 text-ink-800 ring-gold-200',
   MAINTENANCE: 'bg-gold-50 text-ink-800 ring-gold-200',
   DELETED: 'bg-ink-100 text-ink-500 ring-ink-200',
};

export function CinemaStatusBadge({ cinemaStatus, hallStatus }: CinemaStatusBadgeProps): ReactElement | null {
   const status: CinemaStatus | HallStatus | undefined = cinemaStatus ?? hallStatus;
   if (!status) {
      return null;
   }
   const label: string = cinemaStatus ? CINEMA_STATUS_LABELS[cinemaStatus] : HALL_STATUS_LABELS[status as HallStatus];
   return (
      <span
         className={cn(
            'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
            STATUS_CLASSES[status],
         )}
      >
         {label}
      </span>
   );
}

export default CinemaStatusBadge;
