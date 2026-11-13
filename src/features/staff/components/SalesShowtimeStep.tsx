import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState, type ReactElement } from 'react';
import { getPublicShowtimes } from '@/api/showtime/showtimeApi';
import Alert from '@/components/ui/Alert';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { getErrorMessage } from '@/lib/common/apiError';
import { cn } from '@/lib/common/utils';
import {
   addDaysToDate,
   formatClockRange,
   formatDayMonth,
   getWeekdayLabel,
   todayInVietnam,
} from '@/lib/common/vietnamTime';
import { formatVnd } from '@/lib/common/currencyFormat';
import type { PublicMovieShowtimes, PublicShowtime } from '@/types/showtime/showtime';

const DAY_COUNT: number = 5;
const CLOCK_REFRESH_MILLISECONDS: number = 60000;

interface SalesShowtimeStepProps {
   cinemaId: number;
   onSelectShowtime: (showtimeId: number) => void;
}

export function SalesShowtimeStep({ cinemaId, onSelectShowtime }: SalesShowtimeStepProps): ReactElement {
   const today: string = todayInVietnam();
   const [selectedDate, setSelectedDate] = useState<string>(today);
   const [nowMilliseconds, setNowMilliseconds] = useState<number>(() => Date.now());
   const dates: string[] = Array.from({ length: DAY_COUNT }, (_unused, index) => addDaysToDate(today, index));

   useEffect((): (() => void) => {
      function handleTick(): void {
         setNowMilliseconds(Date.now());
      }

      const intervalId: number = window.setInterval(handleTick, CLOCK_REFRESH_MILLISECONDS);

      function handleCleanup(): void {
         window.clearInterval(intervalId);
      }

      return handleCleanup;
   }, []);

   const showtimesQuery: UseQueryResult<PublicMovieShowtimes[]> = useQuery<PublicMovieShowtimes[]>({
      queryKey: ['staff', 'ticket-sales', 'showtimes', cinemaId, selectedDate],
      queryFn: () => getPublicShowtimes(cinemaId, selectedDate, null),
   });
   const publicMovieShowtimesList: PublicMovieShowtimes[] = (showtimesQuery.data ?? [])
      .map((publicMovieShowtimes): PublicMovieShowtimes => ({
         ...publicMovieShowtimes,
         showtimes: publicMovieShowtimes.showtimes.filter(
            (publicShowtime) => Date.parse(publicShowtime.endTime) > nowMilliseconds,
         ),
      }))
      .filter((publicMovieShowtimes) => publicMovieShowtimes.showtimes.length > 0);

   function renderShowtime(publicShowtime: PublicShowtime): ReactElement {
      const isStarted: boolean = Date.parse(publicShowtime.startTime) <= nowMilliseconds;
      return (
         <button
            key={publicShowtime.id}
            type="button"
            onClick={() => onSelectShowtime(publicShowtime.id)}
            className={cn(
               'rounded-xl border px-4 py-2.5 text-left transition-colors hover:border-brand-600 hover:bg-brand-50',
               isStarted ? 'border-accent-300 bg-accent-50' : 'border-ink-200 bg-white',
            )}
         >
            <span className="block text-base font-extrabold text-ink-900">
               {formatClockRange(publicShowtime.startTime, publicShowtime.endTime)}
            </span>
            <span className="block text-xs text-ink-600">
               {publicShowtime.hallName} · {publicShowtime.screenType}
            </span>
            <span className="block text-xs font-bold text-brand-700">Từ {formatVnd(publicShowtime.basePrice)}</span>
            {isStarted && <span className="block text-xs font-bold text-accent-700">Đang chiếu</span>}
         </button>
      );
   }

   function renderMovie(publicMovieShowtimes: PublicMovieShowtimes): ReactElement {
      return (
         <li
            key={publicMovieShowtimes.movieId}
            className="flex gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-ink-100"
         >
            {publicMovieShowtimes.posterUrl ? (
               <img
                  src={publicMovieShowtimes.posterUrl}
                  alt={`Poster phim ${publicMovieShowtimes.title}`}
                  className="aspect-[2/3] w-20 shrink-0 rounded-lg object-cover shadow-md"
               />
            ) : (
               <span className="aspect-[2/3] w-20 shrink-0 rounded-lg bg-ink-100" />
            )}
            <div className="min-w-0 flex-1 space-y-3">
               <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-extrabold uppercase text-ink-900">{publicMovieShowtimes.title}</h3>
                  <AgeRatingBadge ageRating={publicMovieShowtimes.rated} />
                  <span className="text-xs text-ink-500">{publicMovieShowtimes.durationMinutes} phút</span>
               </div>
               <div className="flex flex-wrap gap-3">{publicMovieShowtimes.showtimes.map(renderShowtime)}</div>
            </div>
         </li>
      );
   }

   return (
      <div className="space-y-5">
         <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chọn ngày chiếu">
            {dates.map((date) => (
               <button
                  key={date}
                  type="button"
                  role="tab"
                  aria-selected={date === selectedDate}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                     'rounded-xl border px-4 py-2 text-sm font-bold transition-colors',
                     date === selectedDate
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                  )}
               >
                  <span className="block text-xs font-semibold opacity-80">{getWeekdayLabel(date)}</span>
                  {formatDayMonth(date)}
               </button>
            ))}
         </div>
         {showtimesQuery.isError && <Alert variant="error">{getErrorMessage(showtimesQuery.error)}</Alert>}
         {showtimesQuery.isPending && <p className="text-sm text-ink-500">Đang tải suất chiếu...</p>}
         {showtimesQuery.isSuccess && publicMovieShowtimesList.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
               Không còn suất chiếu nào để bán trong ngày này.
            </p>
         )}
         <ul className="space-y-4">{publicMovieShowtimesList.map(renderMovie)}</ul>
      </div>
   );
}

export default SalesShowtimeStep;
