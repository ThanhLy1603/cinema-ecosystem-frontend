export interface HeldSeat {
  seatId: number;
  price: number;
}

export interface SeatHold {
  bookingId: number | null;
  bookingCode: string | null;
  showtimeId: number;
  expiresAt: string | null;
  serverTime: string;
  seats: HeldSeat[];
  totalAmount: number;
}
