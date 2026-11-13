import type { ScreenType } from '@/types/cinema/cinema';
import type { AgeRating } from '@/types/movie/movie';

export type CheckInResultCode =
  | 'VALID'
  | 'CHECKED_IN'
  | 'UNDONE'
  | 'ALREADY_USED'
  | 'NOT_YET_TIME'
  | 'EXPIRED'
  | 'NOT_PAID'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'WRONG_BRANCH'
  | 'NOT_FOUND';

export type ScanBookingStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUND_REQUIRED';

export type TicketScanAction = 'LOOKUP' | 'CHECK_IN' | 'UNDO';

export interface ScanTicket {
  ticketId: number;
  seatLabel: string;
  seatTypeName: string | null;
  seatTypeCode: string | null;
  price: number | null;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface ScanFnbLine {
  name: string;
  imageUrl: string | null;
  composition: string | null;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface ScanBooking {
  bookingId: number;
  bookingCode: string;
  bookingStatus: ScanBookingStatus;
  bookedAt: string;
  paymentMethod: string | null;
  movieTitle: string;
  posterUrl: string | null;
  rated: AgeRating;
  cinemaName: string | null;
  hallName: string;
  screenType: ScreenType;
  startTime: string;
  endTime: string;
  tickets: ScanTicket[];
  fnbLines: ScanFnbLine[];
  finalAmount: number;
}

export interface TicketScanResponse {
  resultCode: CheckInResultCode;
  message: string;
  canCheckIn: boolean;
  pendingTicketCount: number;
  booking: ScanBooking | null;
}

export interface TicketScanLog {
  id: number;
  bookingCode: string;
  action: TicketScanAction;
  resultCode: CheckInResultCode;
  ticketCount: number;
  staffName: string | null;
  createdAt: string;
}

export interface TicketQueueBooking {
  bookingCode: string;
  pendingTicketCount: number;
  totalTicketCount: number;
  pendingSeatLabels: string[];
}

export interface TicketQueueShowtimeGroup {
  showtimeId: number;
  movieTitle: string;
  hallName: string;
  startTime: string;
  endTime: string;
  checkInOpensAt: string;
  checkInOpen: boolean;
  pendingBookingCount: number;
  pendingTicketCount: number;
  bookings: TicketQueueBooking[];
}

export interface TicketQueue {
  serverTime: string;
  showtimes: TicketQueueShowtimeGroup[];
}

export interface TicketScanRequest {
  code: string;
  cinemaId: number;
}

export interface TicketCheckInRequest {
  code: string;
  cinemaId: number;
  ticketIds?: number[];
}

export interface TicketUndoRequest {
  code: string;
  cinemaId: number;
  ticketIds: number[];
}
