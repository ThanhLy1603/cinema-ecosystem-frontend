export function showtimeSeatMapKey(showtimeId: number): readonly (string | number)[] {
   return ['seat-map', showtimeId];
}

export function mySeatHoldKey(showtimeId: number): readonly (string | number)[] {
   return ['my-seat-hold', showtimeId];
}

export function pendingFnbKey(): readonly string[] {
   return ['pending-fnb'];
}

export function pendingBookingKey(): readonly string[] {
   return ['pending-booking'];
}

export function myBookingsKey(): readonly string[] {
   return ['my-bookings'];
}

export function paymentResultKey(transactionRef: string): readonly string[] {
   return ['payment-result', transactionRef];
}
