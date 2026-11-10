import type { ShowtimeConflict } from '@/types/showtime/showtime';

export function getSuggestedStartTime(
   showtimeConflicts: ShowtimeConflict[],
   attemptedStartTime: string,
): string | null {
   const attemptedStartMilliseconds: number = Date.parse(attemptedStartTime);
   const precedingConflicts: ShowtimeConflict[] = showtimeConflicts.filter(
      (showtimeConflict) => Date.parse(showtimeConflict.startTime) <= attemptedStartMilliseconds,
   );
   if (precedingConflicts.length === 0) {
      return null;
   }
   const latestOccupiedUntil: number = Math.max(
      ...precedingConflicts.map((showtimeConflict) => Date.parse(showtimeConflict.occupiedUntil)),
   );
   return new Date(latestOccupiedUntil).toISOString();
}
