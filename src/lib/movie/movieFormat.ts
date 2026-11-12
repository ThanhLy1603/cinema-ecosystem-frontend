const MINUTES_PER_HOUR: number = 60;

export function formatDuration(durationMinutes: number): string {
   const hours: number = Math.floor(durationMinutes / MINUTES_PER_HOUR);
   const minutes: number = durationMinutes % MINUTES_PER_HOUR;
   if (hours === 0) {
      return `${minutes} phút`;
   }
   return minutes === 0 ? `${hours} giờ` : `${hours} giờ ${minutes} phút`;
}

export function formatReleaseDate(isoDate: string): string {
   const [year, month, day]: string[] = isoDate.split('-');
   return `${day}/${month}/${year}`;
}

export function formatCompactDuration(durationMinutes: number): string {
   const hours: number = Math.floor(durationMinutes / MINUTES_PER_HOUR);
   const minutes: number = durationMinutes % MINUTES_PER_HOUR;
   if (hours === 0) {
      return `${minutes}m`;
   }
   return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}m`;
}
