import { addDaysToDate, getWeekdayIndex, isValidDate } from '@/lib/common/vietnamTime';

export interface DateRepeatValue {
   fromDate: string;
   toDate: string;
   weekdays: number[];
}

export interface WeekdayButton {
   weekday: number;
   label: string;
}

export const MAX_REPEAT_DATES: number = 62;
export const ALL_WEEKDAYS: number[] = [1, 2, 3, 4, 5, 6, 0];
export const WEEKEND_WEEKDAYS: number[] = [6, 0];
export const WORKING_WEEKDAYS: number[] = [1, 2, 3, 4, 5];
export const WEEKDAY_BUTTONS: WeekdayButton[] = [
   { weekday: 1, label: 'T2' },
   { weekday: 2, label: 'T3' },
   { weekday: 3, label: 'T4' },
   { weekday: 4, label: 'T5' },
   { weekday: 5, label: 'T6' },
   { weekday: 6, label: 'T7' },
   { weekday: 0, label: 'CN' },
];

const MAX_SCANNED_DAYS: number = 400;

export function expandDates(dateRepeatValue: DateRepeatValue, excludedDate: string | null): string[] {
   if (!isValidDate(dateRepeatValue.fromDate) || !isValidDate(dateRepeatValue.toDate)) {
      return [];
   }
   const dates: string[] = [];
   let currentDate: string = dateRepeatValue.fromDate;
   for (let scannedDays = 0; currentDate <= dateRepeatValue.toDate && scannedDays < MAX_SCANNED_DAYS; scannedDays++) {
      if (dateRepeatValue.weekdays.includes(getWeekdayIndex(currentDate)) && currentDate !== excludedDate) {
         dates.push(currentDate);
      }
      currentDate = addDaysToDate(currentDate, 1);
   }
   return dates;
}

export function validateDateRepeat(dateRepeatValue: DateRepeatValue, dates: string[]): string | undefined {
   if (!isValidDate(dateRepeatValue.fromDate) || !isValidDate(dateRepeatValue.toDate)) {
      return 'Vui lòng chọn khoảng ngày hợp lệ';
   }
   if (dateRepeatValue.toDate < dateRepeatValue.fromDate) {
      return 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu';
   }
   if (dateRepeatValue.weekdays.length === 0) {
      return 'Vui lòng chọn ít nhất một thứ trong tuần';
   }
   if (dates.length === 0) {
      return 'Không có ngày nào trong khoảng đã chọn khớp với các thứ đã chọn';
   }
   return dates.length > MAX_REPEAT_DATES ? `Tối đa ${MAX_REPEAT_DATES} ngày mỗi lượt` : undefined;
}

export function toggleWeekday(weekdays: number[], weekday: number): number[] {
   return weekdays.includes(weekday)
      ? weekdays.filter((selectedWeekday) => selectedWeekday !== weekday)
      : [...weekdays, weekday];
}
