import { validateRequiredSelection } from '@/lib/formValidation';
import { isValidDate, isValidTimeOfDay, toVietnamInstant } from '@/lib/vietnamTime';

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

const MAX_BASE_PRICE: number = 10_000_000;
const PRICE_SEPARATOR_PATTERN: RegExp = /[.,\s]/g;
const DIGITS_PATTERN: RegExp = /^\d+$/;

export function parseBasePrice(rawBasePrice: string): number | null {
   const digits: string = rawBasePrice.replace(PRICE_SEPARATOR_PATTERN, '');
   return DIGITS_PATTERN.test(digits) ? Number(digits) : null;
}

function validateBasePrice(rawBasePrice: string): string | undefined {
   if (rawBasePrice.trim().length === 0) {
      return 'Vui lòng nhập giá vé gốc';
   }
   const basePrice: number | null = parseBasePrice(rawBasePrice);
   if (basePrice === null) {
      return 'Giá vé gốc chỉ gồm chữ số';
   }
   return basePrice > MAX_BASE_PRICE ? 'Giá vé gốc tối đa 10.000.000đ' : undefined;
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
      basePrice: validateBasePrice(showtimeFormValues.basePrice),
   };
}

export function hasErrors(showtimeFormErrors: ShowtimeFormErrors): boolean {
   return Object.values(showtimeFormErrors).some((errorMessage) => errorMessage !== undefined);
}
