import { Ban, CircleCheck, CircleHelp, Clock, CreditCard, MapPinOff, Undo2, type LucideIcon } from 'lucide-react';
import type { CheckInResultCode, ScanBookingStatus, TicketScanAction } from '@/types/staff/checkIn';

export type CheckInTone = 'success' | 'warning' | 'danger';

export interface CheckInResultStyle {
   title: string;
   tone: CheckInTone;
   icon: LucideIcon | null;
}

export const CHECK_IN_RESULT_STYLES: Record<CheckInResultCode, CheckInResultStyle> = {
   VALID: { title: 'Vé hợp lệ', tone: 'success', icon: CircleCheck },
   CHECKED_IN: { title: 'Đã xác nhận vào rạp', tone: 'success', icon: CircleCheck },
   UNDONE: { title: 'Đã hoàn tác', tone: 'warning', icon: Undo2 },
   ALREADY_USED: { title: 'Vé đã được sử dụng', tone: 'warning', icon: null },
   NOT_YET_TIME: { title: 'Chưa tới giờ vào rạp', tone: 'warning', icon: Clock },
   EXPIRED: { title: 'Suất chiếu đã kết thúc', tone: 'danger', icon: Clock },
   NOT_PAID: { title: 'Đơn chưa thanh toán', tone: 'danger', icon: CreditCard },
   CANCELLED: { title: 'Đơn đã bị hủy', tone: 'danger', icon: Ban },
   REFUNDED: { title: 'Đơn đã hoàn tiền', tone: 'danger', icon: Ban },
   WRONG_BRANCH: { title: 'Sai chi nhánh', tone: 'danger', icon: MapPinOff },
   NOT_FOUND: { title: 'Không tìm thấy vé', tone: 'danger', icon: CircleHelp },
};

export const CHECK_IN_TONE_CLASS_NAMES: Record<CheckInTone, string> = {
   success: 'border-brand-600 bg-brand-50 text-brand-800',
   warning: 'border-accent-400 bg-accent-50 text-accent-700',
   danger: 'border-danger-500 bg-danger-50 text-danger-800',
};

export const TICKET_SCAN_ACTION_LABELS: Record<TicketScanAction, string> = {
   LOOKUP: 'Tra cứu',
   CHECK_IN: 'Xác nhận vào rạp',
   UNDO: 'Hoàn tác',
};

export const SCAN_BOOKING_STATUS_LABELS: Record<ScanBookingStatus, string> = {
   PENDING: 'Chờ thanh toán',
   PAID: 'Đã thanh toán',
   EXPIRED: 'Hết hạn giữ chỗ',
   CANCELLED: 'Đã hủy',
   REFUND_REQUIRED: 'Chờ hoàn tiền',
};

export const SCAN_BOOKING_STATUS_TONES: Record<ScanBookingStatus, CheckInTone> = {
   PENDING: 'warning',
   PAID: 'success',
   EXPIRED: 'danger',
   CANCELLED: 'danger',
   REFUND_REQUIRED: 'warning',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
   VNPAY: 'VNPAY',
   CASH: 'Tiền mặt',
   CARD: 'Thẻ',
   TRANSFER: 'Chuyển khoản',
};
