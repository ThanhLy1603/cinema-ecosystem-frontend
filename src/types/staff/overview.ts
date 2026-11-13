import type { ScreenType } from '@/types/cinema/cinema';
import type { ShiftReport } from '@/types/staff/shift';

export interface ShowtimeOverview {
  showtimeId: number;
  movieTitle: string;
  hallName: string;
  screenType: ScreenType | null;
  startTime: string;
  endTime: string;
  nowShowing: boolean;
  capacity: number;
  soldSeats: number;
  heldSeats: number;
  availableSeats: number;
  checkedInSeats: number;
}

export interface StaffOverview {
  serverTime: string;
  showtimes: ShowtimeOverview[];
  pendingFnbBookingCount: number;
  pendingCheckInTicketCount: number;
  currentShift: ShiftReport | null;
}
