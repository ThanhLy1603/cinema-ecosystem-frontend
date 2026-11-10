import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { CalendarX } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { getPublicShowtimes } from '@/api/showtimeApi';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/apiError';
import { publicShowtimeListKey } from '@/lib/showtimeQueryKeys';
import { formatDisplayDate, todayInVietnam } from '@/lib/vietnamTime';
import type { PublicMovieShowtimes } from '@/types/showtime';
import MovieShowtimeCard from './MovieShowtimeCard';
import ShowtimeDateTabs from './ShowtimeDateTabs';

interface CinemaShowtimeSectionProps {
   cinemaId: number;
}

const VISIBLE_DAY_COUNT: number = 7;

export function CinemaShowtimeSection({ cinemaId }: CinemaShowtimeSectionProps): ReactElement {
   const startDate: string = todayInVietnam();
   const [selectedDate, setSelectedDate] = useState<string>(startDate);
   const showtimesQuery: UseQueryResult<PublicMovieShowtimes[]> = useQuery<PublicMovieShowtimes[]>({
      queryKey: publicShowtimeListKey(cinemaId, selectedDate, null),
      queryFn: () => getPublicShowtimes(cinemaId, selectedDate, null),
   });

   return (
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
         <h2 className="text-xl font-bold text-ink-900">Lịch chiếu</h2>
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
