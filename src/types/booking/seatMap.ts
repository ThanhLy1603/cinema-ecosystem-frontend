import type { ScreenType } from '@/types/cinema/cinema';
import type { AgeRating } from '@/types/movie/movie';

export type SeatAvailability = 'AVAILABLE' | 'HELD' | 'SOLD' | 'UNAVAILABLE';

export interface ShowtimeSeat {
  id: number;
  row: string;
  number: number;
  type: string;
  span: number;
  price: number;
  state: SeatAvailability;
}

export interface ShowtimeSeatMap {
  showtimeId: number;
  movieId: number;
  movieSlug: string;
  movieTitle: string;
  posterUrl: string | null;
  rated: AgeRating;
  durationMinutes: number;
  cinemaId: number;
  cinemaName: string;
  hallId: number;
  hallName: string;
  screenType: ScreenType;
  startTime: string;
  endTime: string;
  serverTime: string;
  rows: string[];
  columns: number;
  seats: ShowtimeSeat[];
}

export interface SeatStateChange {
  seatId: number;
  state: SeatAvailability;
}

export interface SeatStatusMessage {
  showtimeId: number;
  changes: SeatStateChange[];
  occurredAt: string;
}
