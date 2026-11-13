export interface BookingFnbLineRequest {
  comboId: number | null;
  itemId: number | null;
  quantity: number;
}

export interface BookingFnbRequest {
  lines: BookingFnbLineRequest[];
}

export interface BookingFnbLine {
  comboId: number | null;
  itemId: number | null;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  deliveredQuantity: number;
  deliveredAt: string | null;
}

export interface BookingFnb {
  bookingId: number | null;
  expiresAt: string | null;
  serverTime: string;
  lines: BookingFnbLine[];
  ticketAmount: number;
  fnbAmount: number;
  totalAmount: number;
}
