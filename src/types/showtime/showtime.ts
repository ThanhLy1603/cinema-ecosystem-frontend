import type { ScreenType } from '@/types/cinema';
import type { AgeRating, MovieStatus } from '@/types/movie';

export type ShowtimeStatus = 'ACTIVE' | 'CANCELLED';

export type ShowtimeConflictType = 'OVERLAP' | 'CLEANING_TIME';

export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  rated: AgeRating;
  movieDurationMinutes: number;
  cinemaId: number;
  hallId: number;
  hallName: string;
  screenType: ScreenType;
  startTime: string;
  endTime: string;
  occupiedUntil: string;
  basePrice: number;
  status: ShowtimeStatus;
  hasBookings: boolean;
  editable: boolean;
  cancellable: boolean;
}

export interface ShowtimeRequest {
  movieId: number;
  hallId: number;
  startTime: string;
  basePrice: number;
}

export interface ShowtimeConflict {
  showtimeId: number;
  movieId: number;
  movieTitle: string | null;
  startTime: string;
  endTime: string;
  occupiedUntil: string;
  conflictType: ShowtimeConflictType;
}

export interface MovieInfo {
  id: number;
  title: string;
  durationMinutes: number;
  rated: AgeRating;
  posterUrl: string | null;
  status: MovieStatus;
  deleted: boolean;
}

export interface AdminShowtimeSearchParams {
  cinemaId: number;
  date: string;
  movieId?: number;
  status?: ShowtimeStatus;
}

export interface PublicShowtime {
  id: number;
  hallId: number;
  hallName: string;
  screenType: ScreenType;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export interface PublicMovieShowtimes {
  movieId: number;
  title: string;
  posterUrl: string | null;
  rated: AgeRating;
  durationMinutes: number;
  showtimes: PublicShowtime[];
}
