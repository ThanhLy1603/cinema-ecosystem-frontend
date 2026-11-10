import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import { addDaysToDate, formatDayMonth, getWeekdayLabel } from '@/lib/common/vietnamTime';

interface ShowtimeDateTabsProps {
   startDate: string;
   dayCount: number;
   selectedDate: string;
   onSelectDate: (date: string) => void;
}

export function ShowtimeDateTabs({
   startDate,
   dayCount,
   selectedDate,
   onSelectDate,
}: ShowtimeDateTabsProps): ReactElement {
   const dates: string[] = Array.from({ length: dayCount }, (_, dayOffset) => addDaysToDate(startDate, dayOffset));

   return (
      <div role="tablist" aria-label="Chọn ngày chiếu" className="flex gap-2 overflow-x-auto pb-1">
         {dates.map((date) => (
            <button
               key={date}
               type="button"
               role="tab"
               aria-selected={date === selectedDate}
               onClick={() => onSelectDate(date)}
               className={cn(
                  'flex min-w-[76px] shrink-0 flex-col items-center rounded-2xl border px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
                  date === selectedDate
                     ? 'border-brand-500 bg-brand-600 text-white shadow-glow'
                     : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
               )}
            >
               <span className="text-lg font-extrabold leading-tight">{formatDayMonth(date)}</span>
               <span className="text-xs font-semibold opacity-80">
                  {date === startDate ? 'Hôm nay' : getWeekdayLabel(date)}
               </span>
            </button>
         ))}
      </div>
   );
}

export default ShowtimeDateTabs;
