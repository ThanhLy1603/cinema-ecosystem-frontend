export type FnbPickupResultCode =
  | 'VALID'
  | 'DELIVERED'
  | 'ALL_DELIVERED'
  | 'NO_FNB'
  | 'NOT_YET_TIME'
  | 'EXPIRED'
  | 'NOT_PAID'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'WRONG_BRANCH'
  | 'NOT_FOUND';

export interface FnbPickupLine {
  detailId: number;
  name: string;
  imageUrl: string | null;
  composition: string | null;
  quantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  deliveredAt: string | null;
  deliveredByStaffName: string | null;
}

export interface FnbPickupBooking {
  bookingId: number;
  bookingCode: string;
  movieTitle: string;
  posterUrl: string | null;
  cinemaName: string | null;
  hallName: string;
  startTime: string;
  endTime: string;
  lines: FnbPickupLine[];
  totalQuantity: number;
  remainingQuantity: number;
}

export interface FnbPickupScanResponse {
  resultCode: FnbPickupResultCode;
  message: string;
  canDeliver: boolean;
  booking: FnbPickupBooking | null;
}

export interface FnbPickupQueueLine {
  name: string;
  remainingQuantity: number;
}

export interface FnbPickupQueueBooking {
  bookingCode: string;
  remainingQuantity: number;
  lines: FnbPickupQueueLine[];
}

export interface FnbPickupShowtimeGroup {
  showtimeId: number;
  movieTitle: string;
  hallName: string;
  startTime: string;
  endTime: string;
  pickupOpensAt: string;
  pickupOpen: boolean;
  pendingBookingCount: number;
  pendingQuantity: number;
  bookings: FnbPickupQueueBooking[];
}

export interface FnbPickupQueue {
  serverTime: string;
  showtimes: FnbPickupShowtimeGroup[];
}

export interface FnbDeliveryLog {
  id: number;
  bookingCode: string;
  productName: string;
  quantity: number;
  staffName: string | null;
  createdAt: string;
}

export interface FnbPickupScanRequest {
  code: string;
  cinemaId: number;
}

export interface FnbPickupDeliverLineRequest {
  detailId: number;
  quantity: number;
}

export interface FnbPickupDeliverRequest {
  code: string;
  cinemaId: number;
  lines?: FnbPickupDeliverLineRequest[];
}
