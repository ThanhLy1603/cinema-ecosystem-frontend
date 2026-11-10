export const ADMIN_SHOWTIMES_KEY: readonly string[] = ['admin-showtimes'];
export const SCHEDULABLE_MOVIES_KEY: readonly string[] = ['admin-showtimes', 'movie-options'];

export function adminShowtimeListKey(cinemaId: number, date: string): readonly (string | number)[] {
   return ['admin-showtimes', 'list', cinemaId, date];
}

export function adminShowtimeHallsKey(cinemaId: number): readonly (string | number)[] {
   return ['admin-showtimes', 'halls', cinemaId];
}
