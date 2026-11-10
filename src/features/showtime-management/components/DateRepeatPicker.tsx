import type { ReactElement } from 'react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { formatDayMonth, getWeekdayLabel } from '@/lib/common/vietnamTime';
import { cn } from '@/lib/common/utils';
import {
   ALL_WEEKDAYS,
   WEEKDAY_BUTTONS,
   WEEKEND_WEEKDAYS,
   WORKING_WEEKDAYS,
   toggleWeekday,
   type DateRepeatValue,
} from '../utils/dateRepeat';

interface DateRepeatPickerProps {
   idPrefix: string;
   dateRepeatValue: DateRepeatValue;
   dates: string[];
   error?: string;
   onChange: (dateRepeatValue: DateRepeatValue) => void;
}

const PREVIEW_DATE_COUNT: number = 8;

export function DateRepeatPicker({
   idPrefix,
   dateRepeatValue,
   dates,
   error,
   onChange,
}: DateRepeatPickerProps): ReactElement {
   const previewDates: string[] = dates.slice(0, PREVIEW_DATE_COUNT);

   return (
      <div className="space-y-4">
         <div className="grid gap-4 sm:grid-cols-2">
            <TextField
               id={`${idPrefix}-from`}
               label="Từ ngày"
               type="date"
               value={dateRepeatValue.fromDate}
               onChange={(fromDate) => onChange({ ...dateRepeatValue, fromDate })}
            />
            <TextField
               id={`${idPrefix}-to`}
               label="Đến ngày"
               type="date"
               value={dateRepeatValue.toDate}
               onChange={(toDate) => onChange({ ...dateRepeatValue, toDate })}
            />
         </div>

         <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
               <span className="text-sm font-semibold text-ink-800">Lặp vào các thứ</span>
               <div className="flex gap-1">
                  <Button
                     variant="ghost"
                     className="h-8 px-2.5 text-xs"
                     onClick={() => onChange({ ...dateRepeatValue, weekdays: ALL_WEEKDAYS })}
                  >
                     Mọi ngày
                  </Button>
                  <Button
                     variant="ghost"
                     className="h-8 px-2.5 text-xs"
                     onClick={() => onChange({ ...dateRepeatValue, weekdays: WORKING_WEEKDAYS })}
                  >
                     T2–T6
                  </Button>
                  <Button
                     variant="ghost"
                     className="h-8 px-2.5 text-xs"
                     onClick={() => onChange({ ...dateRepeatValue, weekdays: WEEKEND_WEEKDAYS })}
                  >
                     Cuối tuần
                  </Button>
               </div>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn thứ trong tuần">
               {WEEKDAY_BUTTONS.map((weekdayButton) => (
                  <button
                     key={weekdayButton.weekday}
                     type="button"
                     aria-pressed={dateRepeatValue.weekdays.includes(weekdayButton.weekday)}
                     onClick={() =>
                        onChange({
                           ...dateRepeatValue,
                           weekdays: toggleWeekday(dateRepeatValue.weekdays, weekdayButton.weekday),
                        })
                     }
                     className={cn(
                        'size-11 rounded-xl border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
                        dateRepeatValue.weekdays.includes(weekdayButton.weekday)
                           ? 'border-brand-600 bg-brand-600 text-white'
                           : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300',
                     )}
                  >
                     {weekdayButton.label}
                  </button>
               ))}
            </div>
         </div>

         {error ? (
            <p role="alert" className="text-[13px] font-medium text-danger-700">
               {error}
            </p>
         ) : (
            <p className="text-[13px] text-ink-600">
               <strong>{dates.length}</strong> ngày được chọn:{' '}
               {previewDates.map((date) => `${getWeekdayLabel(date)} ${formatDayMonth(date)}`).join(', ')}
               {dates.length > PREVIEW_DATE_COUNT && ` và ${dates.length - PREVIEW_DATE_COUNT} ngày nữa`}
            </p>
         )}
      </div>
   );
}

export default DateRepeatPicker;
