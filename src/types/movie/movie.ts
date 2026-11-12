export type AgeRating = 'P' | 'C13' | 'C16' | 'C18';

export type MovieStatus = 'COMING_SOON' | 'NOW_SHOWING' | 'ENDED';

export type CastRoleType = 'DIRECTOR' | 'ACTOR' | 'PRODUCER';

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Person {
  id: number;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface PersonOption {
  id: number;
  name: string;
}

export interface MovieCast {
  personId: number;
  personName: string;
  avatarUrl: string | null;
  roleType: CastRoleType;
  characterName: string | null;
}

export interface Movie {
  id: number;
  title: string;
  slug: string;
  originalTitle: string | null;
  durationMinutes: number;
  releaseDate: string;
  endDate: string | null;
  rated: AgeRating;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  status: MovieStatus;
  genres: Genre[];
  deleted: boolean;
}

export interface MovieDetail {
  id: number;
  title: string;
  slug: string;
  originalTitle: string | null;
  durationMinutes: number;
  releaseDate: string;
  endDate: string | null;
  rated: AgeRating;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  description: string | null;
  status: MovieStatus;
  genres: Genre[];
  casts: MovieCast[];
  deleted: boolean;
}

export interface MovieRatingSummary {
  movieId: number;
  averageRating: number;
  reviewCount: number;
}

export interface MovieSearchParams {
  keyword?: string;
  genreId?: number;
  status?: MovieStatus;
  rated?: AgeRating;
  page: number;
  size: number;
}

export interface AdminMovieSearchParams extends MovieSearchParams {
  deleted: boolean;
}

export interface MovieCastRequest {
  personId: number;
  roleType: CastRoleType;
  characterName: string | null;
}

export interface MovieRequest {
  title: string;
  slug: string | null;
  originalTitle: string | null;
  durationMinutes: number;
  releaseDate: string;
  endDate: string | null;
  rated: AgeRating;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  description: string | null;
  status: MovieStatus;
  genreIds: number[];
  casts: MovieCastRequest[];
}

export interface GenreRequest {
  name: string;
}

export interface PersonRequest {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}
