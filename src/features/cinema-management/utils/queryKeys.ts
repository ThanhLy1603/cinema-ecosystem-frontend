export const ADMIN_CINEMA_LIST_KEY: readonly string[] = ['admin-cinemas', 'list'];
export const ADMIN_FACILITIES_KEY: readonly string[] = ['admin-cinemas', 'facilities'];

export function adminDeletedHallsKey(cinemaId: number): readonly (string | number)[] {
   return ['admin-cinemas', 'deleted-halls', cinemaId];
}

export function adminCinemaDetailKey(cinemaId: number): readonly (string | number)[] {
   return ['admin-cinemas', 'detail', cinemaId];
}

export function adminSeatMapLockKey(hallId: number): readonly (string | number)[] {
   return ['admin-cinemas', 'seat-map-lock', hallId];
}

export function adminSeatMapKey(hallId: number): readonly (string | number)[] {
   return ['admin-cinemas', 'seat-map', hallId];
}
