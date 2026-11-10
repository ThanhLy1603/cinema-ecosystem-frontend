import { validateRequiredSelection } from '@/lib/common/formValidation';
import { validateMoneyInput } from '@/lib/common/moneyInput';
import { isValidDate, isValidTimeOfDay, toVietnamInstant } from '@/lib/common/vietnamTime';

export interface ShowtimeFormValues {
   hallId: string;
   movieId: string;
   date: string;
   startTime: string;
   basePrice: string;
}

export type ShowtimeFormErrors = Partial<Record<keyof ShowtimeFormValues, string>>;

interface StartMomentErrors {
   date?: string;
   startTime?: string;
}

function validateStartMoment(date: string, startTime: string): StartMomentErrors {
   const dateError: string | undefined = isValidDate(date) ? undefined : 'Vui lòng chọn ngày chiếu hợp lệ';
   const timeError: string | undefined = isValidTimeOfDay(startTime) ? undefined : 'Vui lòng nhập giờ bắt đầu (HH:mm)';
   if (dateError || timeError) {
      return { date: dateError, startTime: timeError };
   }
   const isInPast: boolean = Date.parse(toVietnamInstant(date, startTime)) <= Date.now();
   return { startTime: isInPast ? 'Giờ bắt đầu phải nằm trong tương lai' : undefined };
}

export function validateShowtimeForm(showtimeFormValues: ShowtimeFormValues): ShowtimeFormErrors {
   const startMomentErrors: StartMomentErrors = validateStartMoment(
      showtimeFormValues.date,
      showtimeFormValues.startTime,
   );
   return {
      hallId: validateRequiredSelection(showtimeFormValues.hallId, 'Vui lòng chọn phòng chiếu'),
      movieId: validateRequiredSelection(showtimeFormValues.movieId, 'Vui lòng chọn phim'),
      date: startMomentErrors.date,
      startTime: startMomentErrors.startTime,
      basePrice: validateMoneyInput(showtimeFormValues.basePrice, 'Vui lòng nhập giá vé gốc', 'Giá vé gốc'),
   };
}

export function hasErrors(showtimeFormErrors: ShowtimeFormErrors): boolean {
   return Object.values(showtimeFormErrors).some((errorMessage) => errorMessage !== undefined);
}
