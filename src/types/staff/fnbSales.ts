import type { BookingFnbLineRequest } from '@/types/booking/bookingFnb';
import type { CounterPaymentMethod, ReceiptPaymentMethod } from '@/types/staff/ticketSales';

export interface CounterFnbCheckoutRequest {
  cinemaId: number;
  paymentMethod: CounterPaymentMethod;
  cashReceived?: number;
  lines: BookingFnbLineRequest[];
}

export interface CounterFnbReceiptLine {
  comboId: number | null;
  itemId: number | null;
  name: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface CounterFnbReceipt {
  orderCode: string;
  cinemaId: number;
  cinemaName: string;
  lines: CounterFnbReceiptLine[];
  totalAmount: number;
  paymentMethod: ReceiptPaymentMethod;
  cashReceived: number | null;
  changeAmount: number | null;
  soldByStaffName: string | null;
  paidAt: string;
}
