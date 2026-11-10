export const PUBLIC_CINEMAS_KEY: readonly string[] = ['public-cinemas'];
export const PUBLIC_CITIES_KEY: readonly string[] = ['public-cinemas', 'cities'];
export const SEAT_TYPES_KEY: readonly string[] = ['seat-types'];
export const CINEMA_OPTIONS_KEY: readonly string[] = ['cinema-options'];

export function publicCinemaListKey(city: string): readonly string[] {
   return ['public-cinemas', 'list', city];
}

export function publicCinemaDetailKey(slug: string): readonly string[] {
   return ['public-cinemas', 'detail', slug];
}

export function publicSeatLayoutKey(hallId: number): readonly (string | number)[] {
   return ['public-cinemas', 'seat-layout', hallId];
}
