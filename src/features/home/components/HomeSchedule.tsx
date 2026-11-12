import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { CalendarX, ChevronLeft, ChevronRight, Clapperboard, Phone } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { getPublicShowtimes } from '@/api/showtime/showtimeApi';
import AgeRatingLabel from '@/components/common/AgeRatingLabel';
import SectionHeading from '@/components/common/SectionHeading';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import {
   addDaysToDate,
   formatDayMonth,
   getWeekdayLabel,
   toVietnamTimeOfDay,
   todayInVietnam,
} from '@/lib/common/vietnamTime';
import { formatDuration } from '@/lib/movie/movieFormat';
import { getMovieBookingPath, getMovieDetailPath } from '@/lib/movie/moviePath';
import { publicShowtimeListKey } from '@/lib/showtime/showtimeQueryKeys';
import type { Cinema } from '@/types/cinema/cinema';
import type { PublicMovieShowtimes, PublicShowtime } from '@/types/showtime/showtime';

interface HomeScheduleProps {
   cinemas: Cinema[];
}

const VISIBLE_DAY_COUNT: number = 7;
const MAX_DATE_OFFSET: number = 21;
const DATE_ARROW_CLASS_NAME: string =
   'grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink-700 shadow-md transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40';
const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2'];

function buildBookingLink(movieSlug: string, date: string, cinemaId: number, showtimeId: number): string {
   const urlSearchParams: URLSearchParams = new URLSearchParams({
      date,
      cinema: String(cinemaId),
      showtime: String(showtimeId),
   });
   return `${getMovieBookingPath(movieSlug)}?${urlSearchParams.toString()}`;
}

export function HomeSchedule({ cinemas }: HomeScheduleProps): ReactElement | null {
   const today: string = todayInVietnam();
   const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
   const [selectedDate, setSelectedDate] = useState<string>(today);
   const [dateOffset, setDateOffset] = useState<number>(0);
   const activeCinema: Cinema | undefined = cinemas.find((cinema) => cinema.id === selectedCinemaId) ?? cinemas[0];
   const showtimesQuery: UseQueryResult<PublicMovieShowtimes[]> = useQuery<PublicMovieShowtimes[]>({
      queryKey: publicShowtimeListKey(activeCinema?.id ?? 0, selectedDate, null),
      queryFn: () => getPublicShowtimes(activeCinema?.id ?? 0, selectedDate, null),
      enabled: activeCinema !== undefined,
   });

   if (activeCinema === undefined) {
      return null;
   }

   const dates: string[] = Array.from({ length: VISIBLE_DAY_COUNT }, (_, dayOffset) =>
      addDaysToDate(today, dateOffset + dayOffset),
   );
   const publicMovieShowtimes: PublicMovieShowtimes[] = showtimesQuery.data ?? [];

   function showPreviousDates(): void {
      setDateOffset(Math.max(0, dateOffset - 1));
   }

   function showNextDates(): void {
      setDateOffset(Math.min(MAX_DATE_OFFSET, dateOffset + 1));
   }

   return (
      <section
         id="schedule-section"
         aria-labelledby="home-schedule-heading"
         className="px-4 py-10 sm:px-6 sm:py-12 lg:px-12"
      >
         <div className="mx-auto max-w-5xl">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
               <SectionHeading
                  title="Lịch chiếu"
                  headingId="home-schedule-heading"
                  isCentered={false}
                  className="shrink-0"
               />
               <div role="tablist" aria-label="Chọn rạp" className="flex flex-wrap items-center gap-2.5 md:justify-end">
                  {cinemas.map((cinema) => (
                     <button
                        key={cinema.id}
                        type="button"
                        role="tab"
                        aria-selected={cinema.id === activeCinema.id}
                        onClick={() => setSelectedCinemaId(cinema.id)}
                        className={cn(
                           'rounded-lg border px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:text-sm',
                           cinema.id === activeCinema.id
                              ? 'border-brand-700 bg-brand-600 text-white shadow-md'
                              : 'border-ink-300 bg-white text-ink-700 hover:border-brand-600 hover:text-brand-700',
                        )}
                     >
                        {cinema.name}
                     </button>
                  ))}
               </div>
            </div>

            <div className="mb-8 flex flex-col items-start justify-between gap-2 text-xs text-ink-700 sm:flex-row sm:items-center sm:text-sm">
               <p>
                  <span className="font-bold text-ink-900">{activeCinema.name}: </span>
                  {activeCinema.address}
               </p>
               {activeCinema.phone && (
                  <p className="flex shrink-0 items-center gap-1.5 font-semibold text-ink-900">
                     <Phone className="size-4" aria-hidden="true" />
                     Hotline: {activeCinema.phone}
                  </p>
               )}
            </div>

            <div className="mb-8 flex items-center justify-center gap-3">
               <button
                  type="button"
                  onClick={showPreviousDates}
                  disabled={dateOffset === 0}
                  aria-label="Các ngày trước"
                  className={DATE_ARROW_CLASS_NAME}
               >
                  <ChevronLeft className="size-5" aria-hidden="true" />
               </button>
               <div
                  role="tablist"
                  aria-label="Chọn ngày chiếu"
                  className="flex justify-start gap-3 overflow-x-auto px-1 pb-3 pt-1 sm:justify-center"
               >
                  {dates.map((date) => (
                     <button
                        key={date}
                        type="button"
                        role="tab"
                        aria-selected={date === selectedDate}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                           'min-w-[4.5rem] shrink-0 rounded-2xl px-2 py-2.5 text-center transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
                           date === selectedDate
                              ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/30'
                              : 'bg-white text-ink-900 shadow-md hover:-translate-y-0.5 hover:shadow-lg',
                        )}
                     >
                        <span className="block text-[11px] font-bold uppercase tracking-wide">
                           {date === today ? 'Hôm nay' : getWeekdayLabel(date)}
                        </span>
                        <span className="block text-2xl font-black leading-tight">{date.slice(8, 10)}</span>
                        <span className="block text-[11px] opacity-80">{formatDayMonth(date)}</span>
                     </button>
                  ))}
               </div>
               <button
                  type="button"
                  onClick={showNextDates}
                  disabled={dateOffset === MAX_DATE_OFFSET}
                  aria-label="Các ngày sau"
                  className={DATE_ARROW_CLASS_NAME}
               >
                  <ChevronRight className="size-5" aria-hidden="true" />
               </button>
            </div>

            {showtimesQuery.isError && <Alert variant="error">{getErrorMessage(showtimesQuery.error)}</Alert>}
            {showtimesQuery.isPending && (
               <div className="space-y-4" aria-hidden="true">
                  {SKELETON_KEYS.map((skeletonKey) => (
                     <div key={skeletonKey} className="h-28 animate-pulse rounded-xl bg-white" />
                  ))}
               </div>
            )}
            {showtimesQuery.isSuccess && publicMovieShowtimes.length === 0 && (
               <p className="flex flex-col items-center gap-2 rounded-xl bg-white py-12 text-center text-sm text-ink-500 shadow-md">
                  <CalendarX className="size-8 text-brand-300" aria-hidden="true" />
                  Chưa có suất chiếu trong ngày này. Hãy chọn ngày khác.
               </p>
            )}
            {showtimesQuery.isSuccess && publicMovieShowtimes.length > 0 && (
               <ul className="space-y-4">
                  {publicMovieShowtimes.map((movieShowtimes) => (
                     <li
                        key={movieShowtimes.movieId}
                        className="flex flex-col items-start justify-between gap-5 rounded-xl bg-white p-4 shadow-md ring-1 ring-ink-100 transition-shadow hover:shadow-lg sm:p-5 md:flex-row md:items-center"
                     >
                        <div className="flex w-full items-center gap-4 md:w-5/12">
                           <Link
                              to={getMovieDetailPath(movieShowtimes.movieSlug)}
                              aria-label={`Xem phim ${movieShowtimes.title}`}
                              className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md bg-brand-100 shadow"
                           >
                              {movieShowtimes.posterUrl ? (
                                 <img
                                    src={movieShowtimes.posterUrl}
                                    alt={`Poster phim ${movieShowtimes.title}`}
                                    loading="lazy"
                                    className="size-full object-cover"
                                 />
                              ) : (
                                 <span className="grid size-full place-items-center text-brand-300">
                                    <Clapperboard className="size-6" aria-hidden="true" />
                                 </span>
                              )}
                           </Link>
                           <div className="min-w-0 space-y-1">
                              <AgeRatingLabel ageRating={movieShowtimes.rated} className="text-xs text-ink-700" />
                              <h3 className="truncate text-lg font-bold text-ink-900">
                                 <Link to={getMovieDetailPath(movieShowtimes.movieSlug)}>{movieShowtimes.title}</Link>
                              </h3>
                              <p className="text-sm text-ink-700">{formatDuration(movieShowtimes.durationMinutes)}</p>
                           </div>
                        </div>

                        <ul className="flex w-full flex-wrap gap-3 md:w-7/12">
                           {movieShowtimes.showtimes.map((publicShowtime: PublicShowtime) => (
                              <li key={publicShowtime.id} className="space-y-1 text-center">
                                 <Link
                                    to={buildBookingLink(
                                       movieShowtimes.movieSlug,
                                       selectedDate,
                                       activeCinema.id,
                                       publicShowtime.id,
                                    )}
                                    title={`${publicShowtime.hallName} · giá gốc ${formatVnd(publicShowtime.basePrice)}`}
                                    className="group block min-w-16 rounded-xl border-2 border-brand-600 bg-white px-4 py-1.5 transition-colors hover:bg-brand-600"
                                 >
                                    <span className="block text-base font-extrabold leading-tight text-ink-900 group-hover:text-white">
                                       {toVietnamTimeOfDay(publicShowtime.startTime)}
                                    </span>
                                    <span className="block text-xs font-bold text-ink-900 group-hover:text-white">
                                       {publicShowtime.screenType}
                                    </span>
                                 </Link>
                                 <span className="block text-xs text-ink-600">{publicShowtime.hallName}</span>
                              </li>
                           ))}
                        </ul>
                     </li>
                  ))}
               </ul>
            )}
         </div>
      </section>
   );
}

export default HomeSchedule;
