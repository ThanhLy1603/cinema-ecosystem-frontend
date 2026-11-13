import type { ReceiptPaymentMethod } from '@/types/staff/ticketSales';

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CounterMethodTotal {
  paymentMethod: ReceiptPaymentMethod;
  bookingOrders: number;
  bookingAmount: number;
  fnbOrders: number;
  fnbAmount: number;
}

export interface CounterTransaction {
  type: 'TICKET' | 'FNB';
  code: string;
  paymentMethod: ReceiptPaymentMethod;
  amount: number;
  occurredAt: string;
}

export interface Shift {
  id: number;
  staffUserId: number;
  staffName: string;
  cinemaId: number;
  cinemaName: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  expectedCash: number | null;
  countedCash: number | null;
  cashDifference: number | null;
  note: string | null;
  totalSales: number;
  orderCount: number;
}

export interface ShiftReport {
  shift: Shift;
  methodTotals: CounterMethodTotal[];
  cashSales: number;
  transactions: CounterTransaction[];
}

export interface OpenShiftRequest {
  cinemaId: number;
  openingCash: number;
}

export interface CloseShiftRequest {
  countedCash: number;
  note?: string;
}
