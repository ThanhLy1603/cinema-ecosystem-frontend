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

export const CURRENT_SHIFT_KEY: readonly string[] = ['staff', 'shift', 'current'];

export const MY_SHIFTS_KEY: readonly string[] = ['staff', 'shift', 'mine'];

export function staffOverviewKey(cinemaId: number): readonly (string | number)[] {
   return ['staff', 'overview', cinemaId];
}

export function shiftReportKey(shiftId: number): readonly (string | number)[] {
   return ['staff', 'shift', 'report', shiftId];
}
