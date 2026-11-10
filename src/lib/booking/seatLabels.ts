import { getSeatLabel } from '@/lib/cinema/seatMap';
import type { ShowtimeSeat } from '@/types/booking/seatMap';

export const MAX_SEATS_PER_BOOKING: number = 8;

export function getShowtimeSeatLabel(showtimeSeat: ShowtimeSeat): string {
   return getSeatLabel(showtimeSeat.row, showtimeSeat.number);
}

export function compareShowtimeSeats(firstShowtimeSeat: ShowtimeSeat, secondShowtimeSeat: ShowtimeSeat): number {
   return (
      firstShowtimeSeat.row.localeCompare(secondShowtimeSeat.row) ||
      firstShowtimeSeat.number - secondShowtimeSeat.number
   );
}
