import { Wrench } from 'lucide-react';
import { useEffect, useRef, type MouseEvent, type ReactElement } from 'react';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { MINUTES_PER_DAY, formatClockRange, getMinutesFromDayStart, todayInVietnam } from '@/lib/common/vietnamTime';
import { cn } from '@/lib/common/utils';
import type { Hall } from '@/types/cinema/cinema';
import type { Showtime } from '@/types/showtime/showtime';
import {
   HALL_LABEL_WIDTH,
   HEADER_HEIGHT,
   LANE_HEIGHT,
   PIXELS_PER_HOUR,
   PIXELS_PER_MINUTE,
   TIMELINE_WIDTH,
   computeBlockLayout,
   getHourMarks,
   getMovieColorClasses,
   pixelsToTimeOfDay,
   type TimelineBlockLayout,
} from '../utils/timeline';

export interface AttemptedSlot {
   hallId: number;
   startTime: string;
   endTime: string;
   occupiedUntil: string;
}

interface ShowtimeTimelineProps {
   date: string;
   halls: Hall[];
   showtimes: Showtime[];
   conflictShowtimeIds: ReadonlySet<number>;
   attemptedSlot: AttemptedSlot | null;
   selectedShowtimeId: number | null;
   onSelectShowtime: (showtime: Showtime) => void;
   onCreateAt: (hallId: number, timeOfDay: string) => void;
}

const HOUR_MARKS: number[] = getHourMarks();
const INITIAL_SCROLL_HOUR: number = 8;
const GRID_BACKGROUND: string = `repeating-linear-gradient(to right, transparent 0, transparent ${PIXELS_PER_HOUR - 1}px, rgb(208 218 232 / 0.7) ${PIXELS_PER_HOUR - 1}px, rgb(208 218 232 / 0.7) ${PIXELS_PER_HOUR}px)`;
const CLEANING_BACKGROUND: string =
   'repeating-linear-gradient(135deg, rgb(126 146 173 / 0.35) 0, rgb(126 146 173 / 0.35) 4px, transparent 4px, transparent 8px)';

function formatHourLabel(hour: number): string {
   return `${String(hour).padStart(2, '0')}:00`;
}

function getBlockEdgeClasses(timelineBlockLayout: TimelineBlockLayout): string {
   return cn(
      timelineBlockLayout.startsBeforeDay && 'rounded-l-none border-l-0',
      timelineBlockLayout.endsAfterDay && 'rounded-r-none border-r-0',
   );
}

export function ShowtimeTimeline({
   date,
   halls,
   showtimes,
   conflictShowtimeIds,
   attemptedSlot,
   selectedShowtimeId,
   onSelectShowtime,
   onCreateAt,
}: ShowtimeTimelineProps): ReactElement {
   const scrollContainerRef = useRef<HTMLDivElement>(null);
   const isToday: boolean = date === todayInVietnam();
   const nowMinutes: number = getMinutesFromDayStart(new Date().toISOString(), date);

   function scrollToWorkingHours(): void {
      if (scrollContainerRef.current) {
         scrollContainerRef.current.scrollLeft = INITIAL_SCROLL_HOUR * PIXELS_PER_HOUR;
      }
   }
   useEffect(scrollToWorkingHours, [date]);

   function handleLaneClick(hall: Hall, mouseEvent: MouseEvent<HTMLDivElement>): void {
      if (hall.status !== 'ACTIVE') {
         return;
      }
      const laneBounds: DOMRect = mouseEvent.currentTarget.getBoundingClientRect();
      onCreateAt(hall.id, pixelsToTimeOfDay(mouseEvent.clientX - laneBounds.left));
   }

   function handleShowtimeClick(showtime: Showtime, mouseEvent: MouseEvent<HTMLButtonElement>): void {
      mouseEvent.stopPropagation();
      onSelectShowtime(showtime);
   }

   function renderShowtimeBlock(showtime: Showtime): ReactElement | null {
      const timelineBlockLayout: TimelineBlockLayout | null = computeBlockLayout(
         showtime.startTime,
         showtime.endTime,
         showtime.occupiedUntil,
         date,
      );
      if (!timelineBlockLayout) {
         return null;
      }
      const isConflicting: boolean = conflictShowtimeIds.has(showtime.id);
      const isSelected: boolean = selectedShowtimeId === showtime.id;
      const clockRange: string = formatClockRange(showtime.startTime, showtime.endTime);
      return (
         <div key={showtime.id}>
            {timelineBlockLayout.cleaningWidth > 0 && (
               <div
                  title="Thời gian dọn phòng 15 phút"
                  className={cn(
                     'absolute top-3 bottom-3 rounded-r-lg',
                     isConflicting && 'bg-danger-100 ring-1 ring-danger-300',
                  )}
                  style={{
                     left: timelineBlockLayout.cleaningLeft,
                     width: timelineBlockLayout.cleaningWidth,
                     backgroundImage: isConflicting ? undefined : CLEANING_BACKGROUND,
                  }}
               />
            )}
            <button
               type="button"
               onClick={(mouseEvent) => handleShowtimeClick(showtime, mouseEvent)}
               aria-label={`${showtime.movieTitle}, ${showtime.hallName}, ${clockRange}${isConflicting ? ', đang trùng giờ' : ''}`}
               aria-pressed={isSelected}
               title={`${showtime.movieTitle}\n${clockRange}`}
               className={cn(
                  'absolute top-3 bottom-3 flex flex-col justify-between overflow-hidden rounded-lg border px-2 py-1.5 text-left shadow-sm transition-all hover:z-20 hover:shadow-md focus-visible:z-20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200',
                  getBlockEdgeClasses(timelineBlockLayout),
                  isConflicting
                     ? 'z-10 animate-pulse border-danger-500 bg-danger-100 text-danger-900 ring-4 ring-danger-300'
                     : getMovieColorClasses(showtime.movieId),
                  isSelected && !isConflicting && 'ring-4 ring-brand-300',
               )}
               style={{ left: timelineBlockLayout.left, width: timelineBlockLayout.width }}
            >
               <span className="block truncate text-xs font-extrabold leading-tight">{showtime.movieTitle}</span>
               <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <AgeRatingBadge ageRating={showtime.rated} className="min-w-0 px-1 py-0 text-[10px]" />
                  <span className="truncate">{clockRange}</span>
               </span>
            </button>
         </div>
      );
   }

   function renderAttemptedSlot(hall: Hall): ReactElement | null {
      if (!attemptedSlot || attemptedSlot.hallId !== hall.id) {
         return null;
      }
      const timelineBlockLayout: TimelineBlockLayout | null = computeBlockLayout(
         attemptedSlot.startTime,
         attemptedSlot.endTime,
         attemptedSlot.occupiedUntil,
         date,
      );
      if (!timelineBlockLayout) {
         return null;
      }
      return (
         <div
            className="pointer-events-none absolute top-1 bottom-1 z-30 flex items-start rounded-lg border-2 border-dashed border-danger-600 bg-danger-500/10 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-danger-700"
            style={{
               left: timelineBlockLayout.left,
               width: timelineBlockLayout.width + timelineBlockLayout.cleaningWidth,
            }}
         >
            Giờ bị từ chối
         </div>
      );
   }

   function renderHallLane(hall: Hall): ReactElement {
      const hallShowtimes: Showtime[] = showtimes.filter((showtime) => showtime.hallId === hall.id);
      const isBookable: boolean = hall.status === 'ACTIVE';
      return (
         <div key={hall.id} className="flex border-b border-ink-100 last:border-b-0">
            <div
               className="sticky left-0 z-30 flex shrink-0 flex-col justify-center gap-1 border-r border-ink-100 bg-white px-4"
               style={{ width: HALL_LABEL_WIDTH, height: LANE_HEIGHT }}
            >
               <span className="truncate text-sm font-extrabold text-ink-900">{hall.name}</span>
               <span className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-bold text-brand-700">
                     {hall.screenType}
                  </span>
                  {!isBookable && (
                     <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                        <Wrench className="size-3" aria-hidden="true" />
                        Bảo trì
                     </span>
                  )}
               </span>
            </div>
            <div
               onClick={(mouseEvent) => handleLaneClick(hall, mouseEvent)}
               className={cn(
                  'relative shrink-0',
                  isBookable ? 'cursor-copy hover:bg-brand-50/40' : 'cursor-not-allowed bg-ink-50',
               )}
               style={{
                  width: TIMELINE_WIDTH,
                  height: LANE_HEIGHT,
                  backgroundImage: GRID_BACKGROUND,
               }}
            >
               {hallShowtimes.map(renderShowtimeBlock)}
               {renderAttemptedSlot(hall)}
               {isToday && nowMinutes >= 0 && nowMinutes <= MINUTES_PER_DAY && (
                  <div
                     aria-hidden="true"
                     className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-danger-500"
                     style={{ left: nowMinutes * PIXELS_PER_MINUTE }}
                  />
               )}
            </div>
         </div>
      );
   }

   return (
      <div
         ref={scrollContainerRef}
         className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-ink-200/80"
         role="region"
         aria-label="Lịch chiếu theo phòng chiếu"
         tabIndex={0}
      >
         <div style={{ width: HALL_LABEL_WIDTH + TIMELINE_WIDTH }}>
            <div className="flex border-b border-ink-100 bg-ink-50/60" style={{ height: HEADER_HEIGHT }}>
               <div
                  className="sticky left-0 z-40 flex shrink-0 items-center border-r border-ink-100 bg-ink-50 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-500"
                  style={{ width: HALL_LABEL_WIDTH }}
               >
                  Phòng chiếu
               </div>
               <div className="relative" style={{ width: TIMELINE_WIDTH }}>
                  {HOUR_MARKS.map((hour) => (
                     <span
                        key={hour}
                        className="absolute top-0 flex h-full items-center border-l border-ink-200 pl-2 text-[11px] font-semibold text-ink-500"
                        style={{ left: hour * PIXELS_PER_HOUR }}
                     >
                        {formatHourLabel(hour)}
                     </span>
                  ))}
               </div>
            </div>

            {halls.map(renderHallLane)}
         </div>
      </div>
   );
}

export default ShowtimeTimeline;
