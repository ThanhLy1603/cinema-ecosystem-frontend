import type { MovieSearchParams } from '@/types/movie';

export const PUBLIC_MOVIES_KEY: readonly string[] = ['public-movies'];
export const PUBLIC_GENRES_KEY: readonly string[] = ['public-movies', 'genres'];

export function publicMovieListKey(movieSearchParams: MovieSearchParams): readonly (string | MovieSearchParams)[] {
   return ['public-movies', 'list', movieSearchParams];
}

export function publicMovieDetailKey(movieId: number): readonly (string | number)[] {
   return ['public-movies', 'detail', movieId];
}
