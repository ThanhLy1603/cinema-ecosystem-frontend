export const ADMIN_CINEMA_LIST_KEY: readonly string[] = ['admin-cinemas', 'list'];
export const ADMIN_FACILITIES_KEY: readonly string[] = ['admin-cinemas', 'facilities'];

export function adminCinemaDetailKey(cinemaId: number): readonly (string | number)[] {
   return ['admin-cinemas', 'detail', cinemaId];
}

export function adminSeatMapKey(hallId: number): readonly (string | number)[] {
   return ['admin-cinemas', 'seat-map', hallId];
}
