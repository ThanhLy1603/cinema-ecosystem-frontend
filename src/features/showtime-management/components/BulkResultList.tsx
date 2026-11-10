import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import {
   formatClockRange,
   formatDayMonth,
   getWeekdayLabel,
   toVietnamDate,
   toVietnamTimeOfDay,
} from '@/lib/common/vietnamTime';
import type { BulkItemStatus, BulkShowtimeItem, BulkShowtimeResult, ShowtimeConflict } from '@/types/showtime/showtime';

interface BulkResultListProps {
   bulkShowtimeResult: BulkShowtimeResult;
}

const STATUS_LABELS: Record<BulkItemStatus, string> = {
   READY: 'Sẽ tạo',
   CREATED: 'Đã tạo',
   CONFLICT: 'Trùng giờ',
   INVALID: 'Không hợp lệ',
};

const STATUS_CLASSES: Record<BulkItemStatus, string> = {
   READY: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
   CREATED: 'bg-emerald-600 text-white ring-emerald-600',
   CONFLICT: 'bg-danger-50 text-danger-800 ring-danger-200',
   INVALID: 'bg-amber-50 text-amber-800 ring-amber-200',
};

function describeConflict(showtimeConflict: ShowtimeConflict): string {
   const title: string = showtimeConflict.movieTitle ?? `Suất chiếu #${showtimeConflict.showtimeId}`;
   return `Trùng «${title}» ${formatClockRange(showtimeConflict.startTime, showtimeConflict.endTime)}, phòng bận đến ${toVietnamTimeOfDay(showtimeConflict.occupiedUntil)}`;
}

function describeItemProblem(bulkShowtimeItem: BulkShowtimeItem): string | null {
   if (bulkShowtimeItem.conflicts.length > 0) {
      const extraCount: number = bulkShowtimeItem.conflicts.length - 1;
      return `${describeConflict(bulkShowtimeItem.conflicts[0])}${extraCount > 0 ? ` và ${extraCount} suất khác` : ''}`;
   }
   return bulkShowtimeItem.reason;
}

function renderItem(bulkShowtimeItem: BulkShowtimeItem, itemIndex: number): ReactElement {
   const itemDate: string = toVietnamDate(bulkShowtimeItem.startTime);
   const clock: string = bulkShowtimeItem.endTime
      ? formatClockRange(bulkShowtimeItem.startTime, bulkShowtimeItem.endTime)
      : toVietnamTimeOfDay(bulkShowtimeItem.startTime);
   const problem: string | null = describeItemProblem(bulkShowtimeItem);
   return (
      <li key={`${bulkShowtimeItem.hallId}-${bulkShowtimeItem.startTime}-${itemIndex}`} className="space-y-1 py-2.5">
         <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink-900">
               {getWeekdayLabel(itemDate)} {formatDayMonth(itemDate)} · {clock}
               <span className="ml-2 font-normal text-ink-600">{bulkShowtimeItem.hallName ?? 'Phòng chiếu'}</span>
            </p>
            <span
               className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1',
                  STATUS_CLASSES[bulkShowtimeItem.status],
               )}
            >
               {STATUS_LABELS[bulkShowtimeItem.status]}
            </span>
         </div>
         {problem && <p className="text-[13px] text-ink-600">{problem}</p>}
      </li>
   );
}

export function BulkResultList({ bulkShowtimeResult }: BulkResultListProps): ReactElement {
   const acceptedLabel: string = bulkShowtimeResult.dryRun ? 'sẽ tạo' : 'đã tạo';

   return (
      <div className="space-y-3">
         <p className="text-sm text-ink-700">
            Tổng <strong>{bulkShowtimeResult.totalCount}</strong> suất:{' '}
            <strong className="text-emerald-700">{bulkShowtimeResult.acceptedCount}</strong> {acceptedLabel},{' '}
            <strong className="text-danger-700">{bulkShowtimeResult.conflictCount}</strong> trùng giờ,{' '}
            <strong className="text-amber-700">{bulkShowtimeResult.invalidCount}</strong> không hợp lệ.
         </p>
         <ul className="max-h-72 divide-y divide-ink-100 overflow-y-auto rounded-xl bg-ink-50 px-4 ring-1 ring-ink-100">
            {bulkShowtimeResult.items.map(renderItem)}
         </ul>
      </div>
   );
}

export default BulkResultList;
