import type { BookingStatus } from '@/types/booking/bookingDetail';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type SimulatedPaymentOutcome = 'SUCCESS' | 'FAILED';

export interface PaymentUrl {
  paymentUrl: string;
  transactionRef: string;
  expiresAt: string;
}

export interface PaymentResult {
  transactionRef: string;
  paymentStatus: PaymentStatus;
  bookingId: number;
  bookingStatus: BookingStatus;
  amount: number;
}

export interface SimulatePaymentRequest {
  transactionRef: string;
  outcome: SimulatedPaymentOutcome;
}

export interface GatewayCallbackResult {
  RspCode: string;
  Message: string;
}
