import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { CalendarX } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { getPublicShowtimes } from '@/api/showtime/showtimeApi';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { publicShowtimeListKey } from '@/lib/showtime/showtimeQueryKeys';
import { addDaysToDate, formatDisplayDate, isValidDate, todayInVietnam } from '@/lib/common/vietnamTime';
import type { PublicMovieShowtimes } from '@/types/showtime/showtime';
import MovieShowtimeCard from './MovieShowtimeCard';
import ShowtimeDateTabs from './ShowtimeDateTabs';

interface CinemaShowtimeSectionProps {
   cinemaId: number;
}

const VISIBLE_DAY_COUNT: number = 7;

export function CinemaShowtimeSection({ cinemaId }: CinemaShowtimeSectionProps): ReactElement {
   const startDate: string = todayInVietnam();
   const [searchParams, setSearchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
   const requestedDate: string = searchParams.get('date') ?? '';
   const isRequestedDateVisible: boolean =
      isValidDate(requestedDate) &&
      requestedDate >= startDate &&
      requestedDate <= addDaysToDate(startDate, VISIBLE_DAY_COUNT - 1);
   const [selectedDate, setSelectedDate] = useState<string>(isRequestedDateVisible ? requestedDate : startDate);
   const requestedMovieId: number = Number(searchParams.get('movie'));
   const movieId: number | null = Number.isInteger(requestedMovieId) && requestedMovieId > 0 ? requestedMovieId : null;
   const showtimesQuery: UseQueryResult<PublicMovieShowtimes[]> = useQuery<PublicMovieShowtimes[]>({
      queryKey: publicShowtimeListKey(cinemaId, selectedDate, movieId),
      queryFn: () => getPublicShowtimes(cinemaId, selectedDate, movieId),
   });

   function clearMovieFilter(): void {
      const nextSearchParams: URLSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete('movie');
      setSearchParams(nextSearchParams, { replace: true });
   }

   return (
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink-900">Lịch chiếu</h2>
            {movieId !== null && (
               <button
                  type="button"
                  onClick={clearMovieFilter}
                  className="text-sm font-semibold text-brand-700 hover:underline"
               >
                  Đang lọc theo phim đã chọn · Xem tất cả phim
               </button>
            )}
         </div>
         <ShowtimeDateTabs
            startDate={startDate}
            dayCount={VISIBLE_DAY_COUNT}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
         />
         {showtimesQuery.isPending && <p className="text-sm text-ink-500">Đang tải lịch chiếu...</p>}
         {showtimesQuery.isError && <Alert variant="error">{getErrorMessage(showtimesQuery.error)}</Alert>}
         {showtimesQuery.data && showtimesQuery.data.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-ink-50 px-6 py-10 text-center">
               <CalendarX className="size-8 text-ink-300" aria-hidden="true" />
               <p className="text-sm font-semibold text-ink-700">
                  Chưa có suất chiếu nào còn mở trong ngày {formatDisplayDate(selectedDate)}.
               </p>
               <p className="text-xs text-ink-500">Hãy thử chọn một ngày khác.</p>
            </div>
         )}
         {showtimesQuery.data && showtimesQuery.data.length > 0 && (
            <div className="space-y-4">
               {showtimesQuery.data.map((publicMovieShowtimes) => (
                  <MovieShowtimeCard key={publicMovieShowtimes.movieId} publicMovieShowtimes={publicMovieShowtimes} />
               ))}
            </div>
         )}
      </section>
   );
}

export default CinemaShowtimeSection;
