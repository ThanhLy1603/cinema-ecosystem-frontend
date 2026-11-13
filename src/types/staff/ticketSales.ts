import type { BookingDetail } from '@/types/booking/bookingDetail';

export type CounterPaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export type ReceiptPaymentMethod = CounterPaymentMethod | 'VNPAY';

export interface CustomerLookup {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  tier: 'STAR' | 'GOLD' | 'DIAMOND';
  loyaltyPoints: number;
}

export interface CounterCheckoutRequest {
  cinemaId: number;
  paymentMethod: CounterPaymentMethod;
  cashReceived?: number;
  customerUserId?: number;
  receiptEmail?: string;
}

export interface CounterReceipt {
  booking: BookingDetail;
  paymentMethod: ReceiptPaymentMethod;
  cashReceived: number | null;
  changeAmount: number | null;
  soldByStaffName: string | null;
  customerName: string | null;
  paidAt: string;
}
