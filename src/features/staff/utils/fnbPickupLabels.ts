import { Ban, CircleCheck, CircleHelp, Clock, CreditCard, MapPinOff, PackageCheck, Popcorn } from 'lucide-react';
import type { FnbPickupResultCode } from '@/types/staff/fnbPickup';
import type { CheckInResultStyle } from './checkInLabels';

export const FNB_PICKUP_RESULT_STYLES: Record<FnbPickupResultCode, CheckInResultStyle> = {
   VALID: { title: 'Đơn có bắp nước chờ giao', tone: 'success', icon: CircleCheck },
   DELIVERED: { title: 'Đã giao bắp nước', tone: 'success', icon: PackageCheck },
   ALL_DELIVERED: { title: 'Đã nhận đủ bắp nước', tone: 'warning', icon: PackageCheck },
   NO_FNB: { title: 'Đơn không có bắp nước', tone: 'warning', icon: Popcorn },
   NOT_YET_TIME: { title: 'Chưa tới giờ nhận bắp nước', tone: 'warning', icon: Clock },
   EXPIRED: { title: 'Suất chiếu đã kết thúc', tone: 'danger', icon: Clock },
   NOT_PAID: { title: 'Đơn chưa thanh toán', tone: 'danger', icon: CreditCard },
   CANCELLED: { title: 'Đơn đã bị hủy', tone: 'danger', icon: Ban },
   REFUNDED: { title: 'Đơn đã hoàn tiền', tone: 'danger', icon: Ban },
   WRONG_BRANCH: { title: 'Sai chi nhánh', tone: 'danger', icon: MapPinOff },
   NOT_FOUND: { title: 'Không tìm thấy vé', tone: 'danger', icon: CircleHelp },
};
