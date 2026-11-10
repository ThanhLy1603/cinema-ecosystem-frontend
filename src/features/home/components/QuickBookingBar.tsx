import { Ticket } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { validateRequiredSelection } from '@/lib/common/formValidation';
import { addDaysToDate, formatDayMonth, getWeekdayLabel, todayInVietnam } from '@/lib/common/vietnamTime';
import type { Cinema } from '@/types/cinema/cinema';
import type { Movie } from '@/types/movie/movie';

interface QuickBookingBarProps {
   movies: Movie[];
   cinemas: Cinema[];
}

const BOOKING_DAY_COUNT: number = 7;

export function QuickBookingBar({ movies, cinemas }: QuickBookingBarProps): ReactElement {
   const today: string = todayInVietnam();
   const [movieId, setMovieId] = useState<string>('');
   const [cinemaSlug, setCinemaSlug] = useState<string>('');
   const [date, setDate] = useState<string>(today);
   const [cinemaError, setCinemaError] = useState<string | undefined>(undefined);
   const navigate: NavigateFunction = useNavigate();

   const movieOptions: SelectOption[] = [
      { value: '', label: 'Tất cả phim' },
      ...movies.map((movie) => ({ value: String(movie.id), label: movie.title })),
   ];
   const cinemaOptions: SelectOption[] = cinemas.map((cinema) => ({ value: cinema.slug, label: cinema.name }));
   const dateOptions: SelectOption[] = Array.from({ length: BOOKING_DAY_COUNT }, (_, dayOffset) => {
      const optionDate: string = addDaysToDate(today, dayOffset);
      const dayLabel: string = dayOffset === 0 ? 'Hôm nay' : getWeekdayLabel(optionDate);
      return { value: optionDate, label: `${dayLabel}, ${formatDayMonth(optionDate)}` };
   });

   function handleCinemaChange(nextCinemaSlug: string): void {
      setCinemaSlug(nextCinemaSlug);
      setCinemaError(undefined);
   }

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const nextCinemaError: string | undefined = validateRequiredSelection(cinemaSlug, 'Vui lòng chọn rạp');
      setCinemaError(nextCinemaError);
      if (nextCinemaError !== undefined) {
         return;
      }
      const urlSearchParams: URLSearchParams = new URLSearchParams({ date: date || today });
      if (movieId) {
         urlSearchParams.set('movie', movieId);
      }
      navigate(`/cinemas/${cinemaSlug}?${urlSearchParams.toString()}`);
   }

   return (
      <form onSubmit={handleSubmit} aria-label="Đặt vé nhanh" noValidate className="border-b border-ink-200 bg-white">
         <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-x-3 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
            <p className="flex h-10 shrink-0 items-center gap-2 pr-3 text-sm font-bold uppercase tracking-wide text-ink-900 lg:border-r lg:border-ink-200">
               <Ticket className="size-5 text-brand-600" aria-hidden="true" />
               Đặt vé nhanh
            </p>
            <div className="min-w-[200px] flex-1">
               <SelectField
                  id="quick-booking-movie"
                  label="Phim"
                  hideLabel
                  value={movieId}
                  onChange={setMovieId}
                  options={movieOptions}
                  placeholder="Chọn phim"
               />
            </div>
            <div className="min-w-[200px] flex-1">
               <SelectField
                  id="quick-booking-cinema"
                  label="Rạp"
                  hideLabel
                  value={cinemaSlug}
                  onChange={handleCinemaChange}
                  options={cinemaOptions}
                  placeholder="Chọn rạp"
                  error={cinemaError}
               />
            </div>
            <div className="min-w-[170px] flex-1 sm:max-w-[200px]">
               <SelectField
                  id="quick-booking-date"
                  label="Ngày chiếu"
                  hideLabel
                  value={date}
                  onChange={setDate}
                  options={dateOptions}
                  placeholder="Chọn ngày"
               />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
               Xem suất chiếu
            </Button>
         </div>
      </form>
   );
}

export default QuickBookingBar;
