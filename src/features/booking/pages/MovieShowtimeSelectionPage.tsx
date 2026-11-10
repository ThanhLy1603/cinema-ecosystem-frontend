import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, CalendarX } from 'lucide-react';
import { useMemo, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicCinemas } from '@/api/cinemaApi';
import { getPublicMovie } from '@/api/movieApi';
import { getMovieShowtimeDates, getMovieShowtimesByDate } from '@/api/showtimeApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { getErrorMessage } from '@/lib/common/apiError';
import {
   addMonthsToMonth,
   currentMonthInVietnam,
   formatDisplayDate,
   toMonth,
   todayInVietnam,
} from '@/lib/common/vietnamTime';
import { publicCinemaListKey } from '@/lib/cinema/cinemaQueryKeys';
import { getSeatSelectionPath } from '@/lib/booking/bookingPaths';
import { getMovieDetailPath, isValidMovieSlug } from '@/lib/movie/moviePath';
import { publicMovieDetailKey } from '@/lib/movie/movieQueryKeys';
import { movieShowtimeDatesKey, movieShowtimesByDateKey } from '@/lib/showtime/showtimeQueryKeys';
import type { Cinema } from '@/types/cinema/cinema';
import type { MovieDetail } from '@/types/movie/movie';
import type { BookableShowtime, CinemaShowtimes, MovieShowtimeDates } from '@/types/showtime/showtime';
import BookingStepper from '../components/BookingStepper';
import BookingSummaryAside from '../components/BookingSummaryAside';
import CinemaShowtimeGroup from '../components/CinemaShowtimeGroup';
import ShowtimeCalendar from '../components/ShowtimeCalendar';
import { useShowtimeSelectionParams, type ShowtimeSelectionParams } from '../hooks/useShowtimeSelectionParams';
import { MAX_MONTHS_AHEAD } from '../utils/selectionParams';

const ALL_CINEMAS_OPTION: SelectOption = { value: '', label: 'Tất cả rạp' };

export function MovieShowtimeSelectionPage(): ReactElement {
   const { movieSlug: movieSlugParam } = useParams<{ movieSlug: string }>();
   const movieSlug: string = movieSlugParam ?? '';
   const isValidSlug: boolean = isValidMovieSlug(movieSlug);
   const { monthParam, dateParam, cinemaId, showtimeId, updateParams }: ShowtimeSelectionParams =
      useShowtimeSelectionParams();
   const today: string = todayInVietnam();
   const currentMonth: string = currentMonthInVietnam();
   const lastMonth: string = addMonthsToMonth(currentMonth, MAX_MONTHS_AHEAD);
   const requestedMonth: string = monthParam ?? (dateParam ? toMonth(dateParam) : currentMonth);
   const month: string = requestedMonth < currentMonth || requestedMonth > lastMonth ? currentMonth : requestedMonth;

   const movieQuery: UseQueryResult<MovieDetail> = useQuery<MovieDetail>({
      queryKey: publicMovieDetailKey(movieSlug),
      queryFn: () => getPublicMovie(movieSlug),
      enabled: isValidSlug,
   });
   const movieId: number | null = movieQuery.data?.id ?? null;
   const cinemasQuery: UseQueryResult<Cinema[]> = useQuery<Cinema[]>({
      queryKey: publicCinemaListKey(''),
      queryFn: () => getPublicCinemas(undefined),
   });
   const datesQuery: UseQueryResult<MovieShowtimeDates> = useQuery<MovieShowtimeDates>({
      queryKey: movieShowtimeDatesKey(movieId ?? 0, month, cinemaId),
      queryFn: () => getMovieShowtimeDates(movieId ?? 0, month, cinemaId),
      enabled: movieId !== null,
   });
   const availableDates: string[] = useMemo(() => datesQuery.data?.dates ?? [], [datesQuery.data]);
   const selectedDate: string =
      dateParam !== null && availableDates.includes(dateParam) ? dateParam : (availableDates[0] ?? '');
   const showtimesQuery: UseQueryResult<CinemaShowtimes[]> = useQuery<CinemaShowtimes[]>({
      queryKey: movieShowtimesByDateKey(movieId ?? 0, selectedDate, cinemaId),
      queryFn: () => getMovieShowtimesByDate(movieId ?? 0, selectedDate, cinemaId),
      enabled: movieId !== null && selectedDate !== '',
   });
   const cinemaShowtimes: CinemaShowtimes[] = showtimesQuery.data ?? [];
   const selectedCinemaShowtimes: CinemaShowtimes | undefined = cinemaShowtimes.find((cinemaShowtime) =>
      cinemaShowtime.showtimes.some((bookableShowtime) => bookableShowtime.id === showtimeId),
   );
   const selectedShowtime: BookableShowtime | null =
      selectedCinemaShowtimes?.showtimes.find((bookableShowtime) => bookableShowtime.id === showtimeId) ?? null;
   const cinemaOptions: SelectOption[] = [
      ALL_CINEMAS_OPTION,
      ...(cinemasQuery.data ?? []).map((cinema) => ({ value: String(cinema.id), label: cinema.name })),
   ];

   const backLink: ReactElement = (
      <Link to="/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Về danh sách phim
      </Link>
   );

   if (!isValidSlug) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">Đường dẫn phim không hợp lệ.</Alert>
            {backLink}
         </section>
      );
   }
   if (movieQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (movieQuery.isError) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">{getErrorMessage(movieQuery.error)}</Alert>
            {backLink}
         </section>
      );
   }

   const movieDetail: MovieDetail = movieQuery.data;

   function handleChangeMonth(monthOffset: number): void {
      updateParams({ month: addMonthsToMonth(month, monthOffset), date: null, showtime: null });
   }

   function handleSelectDate(date: string): void {
      updateParams({ month: toMonth(date), date, showtime: null });
   }

   function handleSelectCinema(cinemaIdValue: string): void {
      updateParams({ cinema: cinemaIdValue, date: null, showtime: null });
   }

   function handleSelectShowtime(bookableShowtime: BookableShowtime): void {
      updateParams({ month, date: selectedDate, showtime: String(bookableShowtime.id) });
   }

   return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
         <div className="space-y-4">
            <Link
               to={getMovieDetailPath(movieDetail.slug)}
               className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Về trang phim
            </Link>
            <h1 className="text-2xl font-extrabold text-ink-900">Đặt vé: {movieDetail.title}</h1>
            <BookingStepper currentStepIndex={0} />
         </div>

         {movieDetail.status === 'ENDED' && (
            <Alert variant="info">Phim đã kết thúc chiếu nên không còn suất chiếu để đặt vé.</Alert>
         )}

         <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
               <section className="space-y-5 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                     <h2 className="text-lg font-bold text-ink-900">Chọn ngày chiếu</h2>
                     <div className="w-full sm:w-64">
                        <SelectField
                           id="booking-cinema-filter"
                           label="Rạp"
                           hideLabel
                           value={cinemaId === null ? '' : String(cinemaId)}
                           onChange={handleSelectCinema}
                           options={cinemaOptions}
                           placeholder="Tất cả rạp"
                        />
                     </div>
                  </div>
                  {datesQuery.isError && <Alert variant="error">{getErrorMessage(datesQuery.error)}</Alert>}
                  <ShowtimeCalendar
                     month={month}
                     today={today}
                     availableDates={availableDates}
                     selectedDate={selectedDate}
                     isLoading={datesQuery.isFetching}
                     canGoPrevious={month > currentMonth}
                     canGoNext={month < lastMonth}
                     onChangeMonth={handleChangeMonth}
                     onSelectDate={handleSelectDate}
                  />
               </section>

               <section className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:p-6">
                  <h2 className="text-lg font-bold text-ink-900">
                     Chọn suất chiếu{selectedDate !== '' && ` · ${formatDisplayDate(selectedDate)}`}
                  </h2>
                  {selectedDate === '' && !datesQuery.isPending && (
                     <div className="flex flex-col items-center gap-2 rounded-2xl bg-ink-50 px-6 py-10 text-center">
                        <CalendarX className="size-8 text-ink-300" aria-hidden="true" />
                        <p className="text-sm font-semibold text-ink-700">Không có suất chiếu nào trong tháng này.</p>
                        <p className="text-xs text-ink-500">Hãy thử chuyển sang tháng khác hoặc chọn rạp khác.</p>
                     </div>
                  )}
                  {showtimesQuery.isPending && selectedDate !== '' && (
                     <p className="text-sm text-ink-500">Đang tải suất chiếu...</p>
                  )}
                  {showtimesQuery.isError && <Alert variant="error">{getErrorMessage(showtimesQuery.error)}</Alert>}
                  {cinemaShowtimes.map((cinemaShowtime) => (
                     <CinemaShowtimeGroup
                        key={cinemaShowtime.cinemaId}
                        cinemaShowtimes={cinemaShowtime}
                        selectedShowtimeId={showtimeId}
                        onSelectShowtime={handleSelectShowtime}
                     />
                  ))}
               </section>
            </div>

            <BookingSummaryAside
               movieTitle={movieDetail.title}
               posterUrl={movieDetail.posterUrl}
               rated={movieDetail.rated}
               durationMinutes={movieDetail.durationMinutes}
               summaryShowtime={
                  selectedShowtime
                     ? {
                          cinemaName: selectedCinemaShowtimes?.cinemaName ?? null,
                          hallName: selectedShowtime.hallName,
                          screenType: selectedShowtime.screenType,
                          startTime: selectedShowtime.startTime,
                          endTime: selectedShowtime.endTime,
                       }
                     : null
               }
               priceFrom={selectedShowtime?.basePrice ?? null}
               summarySeats={null}
               actionLabel="Tiếp tục chọn ghế"
               actionTo={selectedShowtime ? getSeatSelectionPath(selectedShowtime.id) : null}
               actionHint={selectedShowtime ? null : 'Hãy chọn một suất chiếu để tiếp tục.'}
            />
         </div>
      </div>
   );
}

export default MovieShowtimeSelectionPage;
