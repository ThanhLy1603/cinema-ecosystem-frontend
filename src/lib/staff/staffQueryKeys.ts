export const STAFF_CONTEXT_KEY: readonly string[] = ['staff', 'context'];

export function checkInHistoryKey(cinemaId: number): readonly (string | number)[] {
   return ['staff', 'check-in', 'history', cinemaId];
}

export function fnbPickupQueueKey(cinemaId: number): readonly (string | number)[] {
   return ['staff', 'fnb-pickup', 'queue', cinemaId];
}

export function fnbPickupHistoryKey(cinemaId: number): readonly (string | number)[] {
   return ['staff', 'fnb-pickup', 'history', cinemaId];
}

export function checkInQueueKey(cinemaId: number): readonly (string | number)[] {
   return ['staff', 'check-in', 'queue', cinemaId];
}
