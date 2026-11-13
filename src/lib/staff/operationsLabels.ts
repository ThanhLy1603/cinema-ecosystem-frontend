import type { CheckInResultCode, TicketScanAction } from '@/types/staff/checkIn';
import type { AuditAction, RevenueChannelCode } from '@/types/staff/operations';

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
   VNPAY: 'VNPAY',
   CASH: 'Tiền mặt',
   CARD: 'Thẻ',
   TRANSFER: 'Chuyển khoản',
};

export const REVENUE_CHANNEL_LABELS: Record<RevenueChannelCode, string> = {
   ONLINE: 'Bán online',
   COUNTER_TICKET: 'Vé bán tại quầy',
   COUNTER_FNB: 'Bắp nước bán lẻ tại quầy',
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
   UNDO_CHECK_IN: 'Hoàn tác soát vé',
   REFUND_BOOKING: 'Hoàn tiền đơn vé',
   REISSUE_TICKET: 'Cấp lại vé',
   COUNTER_TICKET_SALE: 'Bán vé tại quầy',
   COUNTER_FNB_SALE: 'Bán bắp nước lẻ',
   SHIFT_OPENED: 'Mở ca',
   SHIFT_CLOSED: 'Đóng ca',
   SCAN_RATE_LIMITED: 'Quét quá giới hạn',
};

export const SCAN_ACTION_LABELS: Record<TicketScanAction, string> = {
   LOOKUP: 'Tra mã',
   CHECK_IN: 'Xác nhận vào rạp',
   UNDO: 'Hoàn tác',
};

export const CHECK_IN_RESULT_LABELS: Record<CheckInResultCode, string> = {
   VALID: 'Vé hợp lệ',
   CHECKED_IN: 'Đã cho vào rạp',
   UNDONE: 'Đã hoàn tác',
   ALREADY_USED: 'Vé đã dùng',
   NOT_YET_TIME: 'Chưa tới giờ',
   EXPIRED: 'Suất đã kết thúc',
   NOT_PAID: 'Chưa thanh toán',
   CANCELLED: 'Đã hủy',
   REFUNDED: 'Đã hoàn tiền',
   WRONG_BRANCH: 'Sai chi nhánh',
   NOT_FOUND: 'Không tìm thấy mã',
};
