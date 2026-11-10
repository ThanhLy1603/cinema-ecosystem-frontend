import { MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import { formatClockRange, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type { BookableShowtime, CinemaShowtimes } from '@/types/showtime/showtime';

interface CinemaShowtimeGroupProps {
   cinemaShowtimes: CinemaShowtimes;
   selectedShowtimeId: number | null;
   onSelectShowtime: (bookableShowtime: BookableShowtime) => void;
}

interface ShowtimeButtonProps {
   bookableShowtime: BookableShowtime;
   isSelected: boolean;
   onSelectShowtime: (bookableShowtime: BookableShowtime) => void;
}

function ShowtimeButton({ bookableShowtime, isSelected, onSelectShowtime }: ShowtimeButtonProps): ReactElement {
   return (
      <button
         type="button"
         disabled={bookableShowtime.soldOut}
         aria-pressed={isSelected}
         title={formatClockRange(bookableShowtime.startTime, bookableShowtime.endTime)}
         onClick={() => onSelectShowtime(bookableShowtime)}
         className={cn(
            'min-w-[104px] rounded-xl border px-3 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
            isSelected && 'border-brand-600 bg-brand-600 text-white shadow-glow',
            !isSelected &&
               !bookableShowtime.soldOut &&
               'border-brand-200 bg-brand-50 text-brand-800 hover:border-brand-400',
            bookableShowtime.soldOut && 'cursor-not-allowed border-ink-200 bg-ink-50 text-ink-400',
         )}
      >
         <span className="block text-base font-extrabold">{toVietnamTimeOfDay(bookableShowtime.startTime)}</span>
         <span className="block text-[11px] font-semibold opacity-80">
            {bookableShowtime.screenType} · {bookableShowtime.hallName}
         </span>
         <span className="block text-[11px] font-semibold">
            {bookableShowtime.soldOut ? 'Hết vé' : `Còn ${bookableShowtime.availableSeats} ghế`}
         </span>
      </button>
   );
}

export function CinemaShowtimeGroup({
   cinemaShowtimes,
   selectedShowtimeId,
   onSelectShowtime,
}: CinemaShowtimeGroupProps): ReactElement {
   return (
      <section className="space-y-3 rounded-2xl border border-ink-100 bg-white p-4">
         <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase text-brand-700">
            <MapPin className="size-4" aria-hidden="true" />
            {cinemaShowtimes.cinemaName}
         </h3>
         <ul className="flex flex-wrap gap-2">
            {cinemaShowtimes.showtimes.map((bookableShowtime) => (
               <li key={bookableShowtime.id}>
                  <ShowtimeButton
                     bookableShowtime={bookableShowtime}
                     isSelected={bookableShowtime.id === selectedShowtimeId}
                     onSelectShowtime={onSelectShowtime}
                  />
               </li>
            ))}
         </ul>
      </section>
   );
}

export default CinemaShowtimeGroup;
