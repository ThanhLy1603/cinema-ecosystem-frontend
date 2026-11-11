import { ArrowRight, Calendar, Film, MapPin, Sparkles } from 'lucide-react';
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
      <form
         onSubmit={handleSubmit}
         aria-label="Đặt vé nhanh"
         noValidate
         className="relative z-20 mx-auto -mt-8 max-w-6xl animate-fade-up px-4 sm:px-6"
      >
         <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-ink-100 pb-3">
               <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-600 sm:text-sm">
                  <Sparkles className="size-4" aria-hidden="true" />
                  Mua vé trực tuyến nhanh
               </p>
               <p className="hidden text-xs font-medium text-ink-500 sm:block">
                  Chọn phim, rạp và ngày chiếu để xem suất chiếu ngay
               </p>
            </div>
            <div className="grid items-start gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
               <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
                     <Film className="size-3.5 text-brand-600" aria-hidden="true" />
                     1. Chọn phim
                  </p>
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
               <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
                     <MapPin className="size-3.5 text-brand-600" aria-hidden="true" />
                     2. Chọn cụm rạp
                  </p>
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
               <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
                     <Calendar className="size-3.5 text-brand-600" aria-hidden="true" />
                     3. Ngày chiếu
                  </p>
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
               <div className="space-y-1.5">
                  <p className="text-xs font-bold text-transparent select-none" aria-hidden="true">
                     4.
                  </p>
                  <Button
                     type="submit"
                     fullWidth
                     className="h-10"
                     icon={<ArrowRight className="order-last size-4" aria-hidden="true" />}
                  >
                     Xem suất chiếu
                  </Button>
               </div>
            </div>
         </div>
      </form>
   );
}

export default QuickBookingBar;
