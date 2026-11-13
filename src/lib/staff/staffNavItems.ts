import { LayoutDashboard, PackageCheck, Popcorn, ScanLine, Ticket, Timer, type LucideIcon } from 'lucide-react';

export interface StaffNavItem {
   label: string;
   to: string;
   icon: LucideIcon;
   description: string;
   end?: boolean;
   isReady: boolean;
}

export const STAFF_NAV_ITEMS: StaffNavItem[] = [
   {
      label: 'Tổng quan',
      to: '/staff',
      icon: LayoutDashboard,
      description: 'Theo dõi suất chiếu và công việc trong ca.',
      end: true,
      isReady: true,
   },
   {
      label: 'Soát vé',
      to: '/staff/check-in',
      icon: ScanLine,
      description: 'Quét mã QR và cho khách vào phòng chiếu.',
      isReady: true,
   },
   {
      label: 'Giao bắp nước',
      to: '/staff/fnb-pickup',
      icon: PackageCheck,
      description: 'Xác nhận khách đã nhận combo và đồ uống đã đặt.',
      isReady: true,
   },
   {
      label: 'Bán vé',
      to: '/staff/ticket-sales',
      icon: Ticket,
      description: 'Bán vé tại quầy: chọn suất, chọn ghế và thu tiền.',
      isReady: true,
   },
   {
      label: 'Bán bắp nước',
      to: '/staff/fnb-sales',
      icon: Popcorn,
      description: 'Bán combo và đồ uống lẻ tại quầy.',
      isReady: false,
   },
   {
      label: 'Ca làm việc',
      to: '/staff/shifts',
      icon: Timer,
      description: 'Mở ca, đóng ca và đối soát tiền thu.',
      isReady: false,
   },
];
