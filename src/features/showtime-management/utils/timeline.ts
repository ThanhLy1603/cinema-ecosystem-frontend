import { MINUTES_PER_DAY, getMinutesFromDayStart } from '@/lib/common/vietnamTime';

export const PIXELS_PER_HOUR: number = 96;
export const PIXELS_PER_MINUTE: number = PIXELS_PER_HOUR / 60;
export const HALL_LABEL_WIDTH: number = 168;
export const LANE_HEIGHT: number = 88;
export const HEADER_HEIGHT: number = 36;
export const HOURS_PER_DAY: number = 24;
export const TIMELINE_WIDTH: number = HOURS_PER_DAY * PIXELS_PER_HOUR;
export const CLICK_SNAP_MINUTES: number = 5;

const MOVIE_COLOR_CLASSES: string[] = [
   'border-brand-300 bg-brand-50 text-brand-900',
   'border-accent-300 bg-accent-50 text-ink-900',
   'border-emerald-300 bg-emerald-50 text-emerald-900',
   'border-amber-300 bg-amber-50 text-amber-900',
   'border-violet-300 bg-violet-50 text-violet-900',
   'border-rose-300 bg-rose-50 text-rose-900',
];

export interface TimelineBlockLayout {
   left: number;
   width: number;
   cleaningLeft: number;
   cleaningWidth: number;
   startsBeforeDay: boolean;
   endsAfterDay: boolean;
}

export function getMovieColorClasses(movieId: number): string {
   return MOVIE_COLOR_CLASSES[movieId % MOVIE_COLOR_CLASSES.length];
}

function clampMinutes(minutes: number): number {
   return Math.min(Math.max(minutes, 0), MINUTES_PER_DAY);
}

export function computeBlockLayout(
   startTime: string,
   endTime: string,
   occupiedUntil: string,
   date: string,
): TimelineBlockLayout | null {
   const rawStartMinutes: number = getMinutesFromDayStart(startTime, date);
   const rawEndMinutes: number = getMinutesFromDayStart(endTime, date);
   const rawOccupiedMinutes: number = getMinutesFromDayStart(occupiedUntil, date);
   if (rawEndMinutes <= 0 || rawStartMinutes >= MINUTES_PER_DAY) {
      return null;
   }
   const startMinutes: number = clampMinutes(rawStartMinutes);
   const endMinutes: number = clampMinutes(rawEndMinutes);
   const occupiedMinutes: number = clampMinutes(rawOccupiedMinutes);
   return {
      left: startMinutes * PIXELS_PER_MINUTE,
      width: Math.max((endMinutes - startMinutes) * PIXELS_PER_MINUTE, 2),
      cleaningLeft: endMinutes * PIXELS_PER_MINUTE,
      cleaningWidth: Math.max(occupiedMinutes - endMinutes, 0) * PIXELS_PER_MINUTE,
      startsBeforeDay: rawStartMinutes < 0,
      endsAfterDay: rawEndMinutes > MINUTES_PER_DAY,
   };
}

export function pixelsToTimeOfDay(offsetX: number): string {
   const rawMinutes: number = Math.round(offsetX / PIXELS_PER_MINUTE / CLICK_SNAP_MINUTES) * CLICK_SNAP_MINUTES;
   const minutes: number = Math.min(Math.max(rawMinutes, 0), MINUTES_PER_DAY - CLICK_SNAP_MINUTES);
   const hours: string = String(Math.floor(minutes / 60)).padStart(2, '0');
   const remainingMinutes: string = String(minutes % 60).padStart(2, '0');
   return `${hours}:${remainingMinutes}`;
}

export function getHourMarks(): number[] {
   return Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour);
}
