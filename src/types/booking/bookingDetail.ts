import type { ScreenType } from '@/types/cinema/cinema';
import type { AgeRating } from '@/types/movie/movie';
import type { BookingFnbLine } from '@/types/booking/bookingFnb';

export type BookingStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUND_REQUIRED';

export interface BookingShowtime {
  showtimeId: number;
  startTime: string;
  endTime: string;
  movieId: number;
  movieSlug: string;
  movieTitle: string;
  posterUrl: string | null;
  rated: AgeRating;
  durationMinutes: number;
  cinemaId: number;
  cinemaName: string | null;
  hallId: number;
  hallName: string;
  screenType: ScreenType;
}

export interface BookingSeat {
  seatId: number;
  label: string;
  seatTypeName: string | null;
  price: number;
}

export interface BookingTicket {
  ticketId: number;
  ticketCode: string;
  seatId: number;
  seatLabel: string;
  price: number;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface BookingDetail {
  bookingId: number;
  bookingCode: string;
  status: BookingStatus;
  createdAt: string | null;
  expiresAt: string | null;
  serverTime: string;
  showtime: BookingShowtime;
  seats: BookingSeat[];
  fnbLines: BookingFnbLine[];
  ticketAmount: number;
  fnbAmount: number;
  discountAmount: number;
  totalAmount: number;
  finalAmount: number;
  tickets: BookingTicket[];
  qrCodeDataUrl: string | null;
}
