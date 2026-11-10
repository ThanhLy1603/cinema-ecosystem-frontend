import type { ScreenType } from '@/types/cinema/cinema';
import type { AgeRating, MovieStatus } from '@/types/movie/movie';

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
  slug: string;
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
  movieSlug: string;
  title: string;
  posterUrl: string | null;
  rated: AgeRating;
  durationMinutes: number;
  showtimes: PublicShowtime[];
}

export type BulkItemStatus = 'READY' | 'CREATED' | 'CONFLICT' | 'INVALID';

export interface BulkShowtimeItem {
  hallId: number;
  hallName: string | null;
  movieId: number;
  startTime: string;
  endTime: string | null;
  status: BulkItemStatus;
  reason: string | null;
  conflicts: ShowtimeConflict[];
  showtimeId: number | null;
}

export interface BulkShowtimeResult {
  dryRun: boolean;
  totalCount: number;
  acceptedCount: number;
  conflictCount: number;
  invalidCount: number;
  items: BulkShowtimeItem[];
}

export interface ShowtimeDuplicateRequest {
  sourceShowtimeId: number;
  hallIds: number[];
  dates: string[];
  dryRun: boolean;
}

export interface ShowtimeDayCopyRequest {
  cinemaId: number;
  sourceDate: string;
  targetDates: string[];
  dryRun: boolean;
}
