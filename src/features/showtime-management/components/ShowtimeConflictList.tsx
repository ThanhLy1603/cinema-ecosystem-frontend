import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import { formatClockRange, toVietnamTimeOfDay } from '@/lib/vietnamTime';
import { cn } from '@/lib/utils';
import type { ShowtimeConflict } from '@/types/showtime';
import { CONFLICT_TYPE_LABELS } from '../utils/labels';

interface ShowtimeConflictListProps {
   showtimeConflicts: ShowtimeConflict[];
   suggestedStartTime: string | null;
   onUseSuggestedStartTime: (startTime: string) => void;
}

export function ShowtimeConflictList({
   showtimeConflicts,
   suggestedStartTime,
   onUseSuggestedStartTime,
}: ShowtimeConflictListProps): ReactElement {
   return (
      <div role="alert" className="space-y-3 rounded-xl border border-danger-200 bg-danger-50 p-4 text-danger-900">
         <p className="flex items-start gap-2 text-sm font-bold">
            <TriangleAlert className="mt-0.5 size-[18px] shrink-0" aria-hidden="true" />
            Không thể lưu: phòng chiếu đang bận hoặc chưa đủ 15 phút dọn phòng giữa hai suất.
         </p>
         <ul className="space-y-2">
            {showtimeConflicts.map((showtimeConflict) => (
               <li
                  key={showtimeConflict.showtimeId}
                  className="rounded-lg bg-white/80 px-3 py-2 text-sm ring-1 ring-danger-100"
               >
                  <p className="font-bold">
                     {showtimeConflict.movieTitle ?? `Suất chiếu #${showtimeConflict.showtimeId}`}
                  </p>
                  <p className="text-[13px]">
                     Chiếu {formatClockRange(showtimeConflict.startTime, showtimeConflict.endTime)} · phòng bận đến{' '}
                     <strong>{toVietnamTimeOfDay(showtimeConflict.occupiedUntil)}</strong>
                  </p>
                  <span
                     className={cn(
                        'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold',
                        showtimeConflict.conflictType === 'OVERLAP'
                           ? 'bg-danger-600 text-white'
                           : 'bg-amber-100 text-amber-800',
                     )}
                  >
                     {CONFLICT_TYPE_LABELS[showtimeConflict.conflictType]}
                  </span>
               </li>
            ))}
         </ul>
         {suggestedStartTime && (
            <button
               type="button"
               onClick={() => onUseSuggestedStartTime(suggestedStartTime)}
               className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-danger-700 ring-1 ring-danger-200 transition-colors hover:bg-danger-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger-200"
            >
               Dùng giờ sớm nhất có thể: {toVietnamTimeOfDay(suggestedStartTime)}
            </button>
         )}
      </div>
   );
}

export default ShowtimeConflictList;
