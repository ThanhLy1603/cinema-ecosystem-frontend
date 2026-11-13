import { Clock, Film } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import { formatClockRange, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type { TicketQueueBooking, TicketQueueShowtimeGroup } from '@/types/staff/checkIn';

interface CheckInQueueListProps {
   ticketQueueShowtimeGroups: TicketQueueShowtimeGroup[];
   isLoading: boolean;
   isBusy: boolean;
   onSelectBooking: (bookingCode: string) => void;
}

export function CheckInQueueList({
   ticketQueueShowtimeGroups,
   isLoading,
   isBusy,
   onSelectBooking,
}: CheckInQueueListProps): ReactElement {
   if (isLoading) {
      return <p className="text-sm text-ink-500">Đang tải danh sách vé chờ soát...</p>;
   }
   if (ticketQueueShowtimeGroups.length === 0) {
      return (
         <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
            Không có vé nào đang chờ soát trong 24 giờ tới.
         </p>
      );
   }

   function renderQueueBooking(ticketQueueBooking: TicketQueueBooking, isCheckInOpen: boolean): ReactElement {
      return (
         <li key={ticketQueueBooking.bookingCode}>
            <button
               type="button"
               disabled={isBusy}
               onClick={() => onSelectBooking(ticketQueueBooking.bookingCode)}
               className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm transition-colors hover:bg-ink-50 disabled:opacity-60"
            >
               <span className="w-40 shrink-0 font-mono text-xs font-bold text-ink-900">
                  {ticketQueueBooking.bookingCode}
               </span>
               <span className="min-w-0 flex-1 text-ink-700">
                  Ghế chưa vào: {ticketQueueBooking.pendingSeatLabels.join(', ')}
               </span>
               <span
                  className={cn(
                     'rounded-md px-2 py-0.5 text-xs font-bold',
                     isCheckInOpen ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-600',
                  )}
               >
                  {ticketQueueBooking.pendingTicketCount}/{ticketQueueBooking.totalTicketCount} ghế
               </span>
            </button>
         </li>
      );
   }

   function renderGroup(ticketQueueShowtimeGroup: TicketQueueShowtimeGroup): ReactElement {
      return (
         <section
            key={ticketQueueShowtimeGroup.showtimeId}
            className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100"
         >
            <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ink-100 bg-ink-50 px-4 py-3">
               <h3 className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                  <Film className="size-4 text-brand-600" aria-hidden="true" />
                  {ticketQueueShowtimeGroup.movieTitle}
               </h3>
               <span className="text-xs text-ink-600">
                  {ticketQueueShowtimeGroup.hallName} ·{' '}
                  {formatClockRange(ticketQueueShowtimeGroup.startTime, ticketQueueShowtimeGroup.endTime)}
               </span>
               <span className="ml-auto flex items-center gap-2 text-xs">
                  <span className="font-bold text-ink-700">
                     {ticketQueueShowtimeGroup.pendingBookingCount} đơn · {ticketQueueShowtimeGroup.pendingTicketCount}{' '}
                     ghế
                  </span>
                  <span
                     className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-0.5 font-bold',
                        ticketQueueShowtimeGroup.checkInOpen
                           ? 'bg-brand-100 text-brand-800'
                           : 'bg-accent-50 text-accent-700',
                     )}
                  >
                     <Clock className="size-3.5" aria-hidden="true" />
                     {ticketQueueShowtimeGroup.checkInOpen
                        ? 'Đang soát vé'
                        : `Soát từ ${toVietnamTimeOfDay(ticketQueueShowtimeGroup.checkInOpensAt)}`}
                  </span>
               </span>
            </header>
            <ul className="divide-y divide-ink-100">
               {ticketQueueShowtimeGroup.bookings.map((ticketQueueBooking) =>
                  renderQueueBooking(ticketQueueBooking, ticketQueueShowtimeGroup.checkInOpen),
               )}
            </ul>
         </section>
      );
   }

   return <div className="space-y-4">{ticketQueueShowtimeGroups.map(renderGroup)}</div>;
}

export default CheckInQueueList;
