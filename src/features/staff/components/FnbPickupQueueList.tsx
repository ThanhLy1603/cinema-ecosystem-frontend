import { Clock, Film } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import { formatClockRange, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type { FnbPickupQueueBooking, FnbPickupQueueLine, FnbPickupShowtimeGroup } from '@/types/staff/fnbPickup';

interface FnbPickupQueueListProps {
   fnbPickupShowtimeGroups: FnbPickupShowtimeGroup[];
   isLoading: boolean;
   isBusy: boolean;
   onSelectBooking: (bookingCode: string) => void;
}

export function FnbPickupQueueList({
   fnbPickupShowtimeGroups,
   isLoading,
   isBusy,
   onSelectBooking,
}: FnbPickupQueueListProps): ReactElement {
   if (isLoading) {
      return <p className="text-sm text-ink-500">Đang tải danh sách đơn chờ giao...</p>;
   }
   if (fnbPickupShowtimeGroups.length === 0) {
      return (
         <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
            Không có đơn bắp nước nào đang chờ giao trong 24 giờ tới.
         </p>
      );
   }

   function renderQueueBooking(fnbPickupQueueBooking: FnbPickupQueueBooking, isPickupOpen: boolean): ReactElement {
      return (
         <li key={fnbPickupQueueBooking.bookingCode}>
            <button
               type="button"
               disabled={isBusy}
               onClick={() => onSelectBooking(fnbPickupQueueBooking.bookingCode)}
               className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm transition-colors hover:bg-ink-50 disabled:opacity-60"
            >
               <span className="w-40 shrink-0 font-mono text-xs font-bold text-ink-900">
                  {fnbPickupQueueBooking.bookingCode}
               </span>
               <span className="min-w-0 flex-1 text-ink-700">
                  {fnbPickupQueueBooking.lines
                     .map(
                        (fnbPickupQueueLine: FnbPickupQueueLine) =>
                           `${fnbPickupQueueLine.remainingQuantity} × ${fnbPickupQueueLine.name}`,
                     )
                     .join(', ')}
               </span>
               <span
                  className={cn(
                     'rounded-md px-2 py-0.5 text-xs font-bold',
                     isPickupOpen ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-600',
                  )}
               >
                  {fnbPickupQueueBooking.remainingQuantity} phần
               </span>
            </button>
         </li>
      );
   }

   function renderGroup(fnbPickupShowtimeGroup: FnbPickupShowtimeGroup): ReactElement {
      return (
         <section
            key={fnbPickupShowtimeGroup.showtimeId}
            className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100"
         >
            <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ink-100 bg-ink-50 px-4 py-3">
               <h3 className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                  <Film className="size-4 text-brand-600" aria-hidden="true" />
                  {fnbPickupShowtimeGroup.movieTitle}
               </h3>
               <span className="text-xs text-ink-600">
                  {fnbPickupShowtimeGroup.hallName} ·{' '}
                  {formatClockRange(fnbPickupShowtimeGroup.startTime, fnbPickupShowtimeGroup.endTime)}
               </span>
               <span className="ml-auto flex items-center gap-2 text-xs">
                  <span className="font-bold text-ink-700">
                     {fnbPickupShowtimeGroup.pendingBookingCount} đơn · {fnbPickupShowtimeGroup.pendingQuantity} phần
                  </span>
                  <span
                     className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-0.5 font-bold',
                        fnbPickupShowtimeGroup.pickupOpen
                           ? 'bg-brand-100 text-brand-800'
                           : 'bg-accent-50 text-accent-700',
                     )}
                  >
                     <Clock className="size-3.5" aria-hidden="true" />
                     {fnbPickupShowtimeGroup.pickupOpen
                        ? 'Đang giao'
                        : `Giao từ ${toVietnamTimeOfDay(fnbPickupShowtimeGroup.pickupOpensAt)}`}
                  </span>
               </span>
            </header>
            <ul className="divide-y divide-ink-100">
               {fnbPickupShowtimeGroup.bookings.map((fnbPickupQueueBooking) =>
                  renderQueueBooking(fnbPickupQueueBooking, fnbPickupShowtimeGroup.pickupOpen),
               )}
            </ul>
         </section>
      );
   }

   return <div className="space-y-4">{fnbPickupShowtimeGroups.map(renderGroup)}</div>;
}

export default FnbPickupQueueList;
