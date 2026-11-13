import type { BookingDetail } from '@/types/booking/bookingDetail';
import type { CheckInResultCode, TicketScanAction } from '@/types/staff/checkIn';
import type { Shift } from '@/types/staff/shift';
import type { ReceiptPaymentMethod } from '@/types/staff/ticketSales';

export type AuditAction =
  | 'UNDO_CHECK_IN'
  | 'REFUND_BOOKING'
  | 'REISSUE_TICKET'
  | 'COUNTER_TICKET_SALE'
  | 'COUNTER_FNB_SALE'
  | 'SHIFT_OPENED'
  | 'SHIFT_CLOSED'
  | 'SCAN_RATE_LIMITED';

export type RevenueChannelCode = 'ONLINE' | 'COUNTER_TICKET' | 'COUNTER_FNB';

export interface OperationsScanLog {
  id: number;
  bookingCode: string | null;
  scannedCode: string;
  action: TicketScanAction;
  resultCode: CheckInResultCode;
  ticketCount: number;
  staffUserId: number;
  staffName: string;
  cinemaId: number;
  cinemaName: string;
  createdAt: string;
}

export interface OperationsFnbDelivery {
  id: number;
  bookingCode: string;
  productName: string;
  quantity: number;
  staffUserId: number;
  staffName: string;
  cinemaId: number;
  cinemaName: string;
  createdAt: string;
}

export interface OperationsAuditLog {
  id: number;
  action: AuditAction;
  actorName: string | null;
  cinemaId: number | null;
  cinemaName: string | null;
  targetType: string | null;
  targetCode: string | null;
  detail: string | null;
  createdAt: string;
}

export interface RevenueChannel {
  channel: RevenueChannelCode;
  orderCount: number;
  amount: number;
}

export interface StaffRevenue {
  staffUserId: number;
  staffName: string;
  orderCount: number;
  amount: number;
}

export interface RevenueReport {
  totalAmount: number;
  totalOrders: number;
  channels: RevenueChannel[];
  staff: StaffRevenue[];
  shifts: Shift[];
}

export interface BookingException {
  booking: BookingDetail;
  salesChannel: 'ONLINE' | 'COUNTER';
  paymentMethod: ReceiptPaymentMethod | null;
  checkedInTicketCount: number;
  canRefund: boolean;
  refundBlockedReason: string | null;
  canReissue: boolean;
  reissueBlockedReason: string | null;
  refundedAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
}

export interface BookingExceptionActionRequest {
  reason: string;
}

export interface OperationsFilter {
  cinemaId?: number;
  staffUserId?: number;
  from?: string;
  to?: string;
  page: number;
  size: number;
}
