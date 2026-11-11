import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import {
   formatDisplayDate,
   formatMonthLabel,
   getDatesInMonth,
   getMondayFirstWeekdayIndex,
} from '@/lib/common/vietnamTime';

interface ShowtimeCalendarProps {
   month: string;
   today: string;
   availableDates: string[];
   selectedDate: string;
   isLoading: boolean;
   canGoPrevious: boolean;
   canGoNext: boolean;
   onChangeMonth: (monthOffset: number) => void;
   onSelectDate: (date: string) => void;
}

const WEEKDAY_HEADERS: string[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface CalendarDayButtonProps {
   date: string;
   today: string;
   hasShowtimes: boolean;
   isSelected: boolean;
   onSelectDate: (date: string) => void;
}

function CalendarDayButton({
   date,
   today,
   hasShowtimes,
   isSelected,
   onSelectDate,
}: CalendarDayButtonProps): ReactElement {
   const isSelectable: boolean = hasShowtimes && date >= today;
   const availabilityLabel: string = hasShowtimes ? ', có suất chiếu' : ', không có suất chiếu';
   return (
      <button
         type="button"
         disabled={!isSelectable}
         aria-pressed={isSelected}
         aria-label={`${formatDisplayDate(date)}${availabilityLabel}`}
         onClick={() => onSelectDate(date)}
         className={cn(
            'relative flex h-12 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
            isSelected && 'animate-pop bg-brand-600 text-white shadow-glow',
            !isSelected && isSelectable && 'text-ink-900 hover:scale-105 hover:bg-brand-50',
            !isSelectable && 'cursor-not-allowed text-ink-300',
            date === today && !isSelected && 'ring-1 ring-brand-300',
         )}
      >
         {Number(date.slice(8, 10))}
         {isSelectable && (
            <span
               className={cn('absolute bottom-1.5 size-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-emerald-500')}
               aria-hidden="true"
            />
         )}
      </button>
   );
}

export function ShowtimeCalendar({
   month,
   today,
   availableDates,
   selectedDate,
   isLoading,
   canGoPrevious,
   canGoNext,
   onChangeMonth,
   onSelectDate,
}: ShowtimeCalendarProps): ReactElement {
   const dates: string[] = getDatesInMonth(month);
   const leadingBlankCount: number = getMondayFirstWeekdayIndex(dates[0]);
   const availableDateSet: Set<string> = new Set<string>(availableDates);

   return (
      <div className="space-y-3" aria-busy={isLoading}>
         <div className="flex items-center justify-between">
            <button
               type="button"
               aria-label="Tháng trước"
               disabled={!canGoPrevious}
               onClick={() => onChangeMonth(-1)}
               className="grid size-9 place-items-center rounded-full text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent"
            >
               <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <h3 className="text-base font-bold text-ink-900" aria-live="polite">
               {formatMonthLabel(month)}
            </h3>
            <button
               type="button"
               aria-label="Tháng sau"
               disabled={!canGoNext}
               onClick={() => onChangeMonth(1)}
               className="grid size-9 place-items-center rounded-full text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent"
            >
               <ChevronRight className="size-5" aria-hidden="true" />
            </button>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-500">
            {WEEKDAY_HEADERS.map((weekdayHeader) => (
               <span key={weekdayHeader}>{weekdayHeader}</span>
            ))}
         </div>
         <div className={cn('grid grid-cols-7 gap-1', isLoading && 'opacity-60')}>
            {Array.from({ length: leadingBlankCount }, (_, blankIndex) => (
               <span key={`blank-${blankIndex}`} aria-hidden="true" />
            ))}
            {dates.map((date) => (
               <CalendarDayButton
                  key={date}
                  date={date}
                  today={today}
                  hasShowtimes={availableDateSet.has(date)}
                  isSelected={date === selectedDate}
                  onSelectDate={onSelectDate}
               />
            ))}
         </div>
         <p className="flex items-center gap-2 text-xs text-ink-500">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Ngày có suất chiếu
         </p>
      </div>
   );
}

export default ShowtimeCalendar;
