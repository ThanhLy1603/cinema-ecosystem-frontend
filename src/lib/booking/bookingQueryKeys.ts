export function showtimeSeatMapKey(showtimeId: number): readonly (string | number)[] {
   return ['seat-map', showtimeId];
}

export function mySeatHoldKey(showtimeId: number): readonly (string | number)[] {
   return ['my-seat-hold', showtimeId];
}

export function pendingFnbKey(): readonly string[] {
   return ['pending-fnb'];
}
