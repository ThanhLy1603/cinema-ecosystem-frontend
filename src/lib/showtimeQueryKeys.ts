export const PUBLIC_SHOWTIMES_KEY: readonly string[] = ['public-showtimes'];

export function publicShowtimeListKey(
   cinemaId: number,
   date: string,
   movieId: number | null,
): readonly (string | number | null)[] {
   return ['public-showtimes', 'list', cinemaId, date, movieId];
}
