export const MOVIE_SLUG_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MOVIE_SLUG_MAX_LENGTH: number = 200;

export function isValidMovieSlug(movieSlug: string): boolean {
   return movieSlug.length <= MOVIE_SLUG_MAX_LENGTH && MOVIE_SLUG_PATTERN.test(movieSlug);
}

export function getMovieDetailPath(movieSlug: string): string {
   return `/movies/${movieSlug}`;
}
