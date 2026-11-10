import { CreditCard, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';

interface FooterLink {
   label: string;
   to: string;
}

const EXPLORE_LINKS: FooterLink[] = [
   { label: 'Phim đang chiếu', to: '/movies' },
   { label: 'Phim sắp chiếu', to: '/movies?status=COMING_SOON' },
   { label: 'Hệ thống rạp', to: '/cinemas' },
   { label: 'Khuyến mãi', to: '/promotions' },
];

const ACCOUNT_LINKS: FooterLink[] = [
   { label: 'Đăng nhập', to: '/login' },
   { label: 'Đăng ký thành viên', to: '/register' },
   { label: 'Vé của tôi', to: '/tickets' },
   { label: 'Cộng đồng & Blog', to: '/community' },
];

function renderLinkColumn(title: string, footerLinks: FooterLink[]): ReactElement {
   return (
      <div>
         <h3 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
         <ul className="mt-5 space-y-3 text-sm">
            {footerLinks.map((footerLink) => (
               <li key={footerLink.to}>
                  <Link to={footerLink.to} className="text-white/70 transition-colors hover:text-white">
                     {footerLink.label}
                  </Link>
               </li>
            ))}
         </ul>
      </div>
   );
}

export function Footer(): ReactElement {
   return (
      <footer className="bg-brand-900 text-white">
         <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:px-8">
            <div className="space-y-5">
               <Logo tone="light" />
               <p className="max-w-xs text-sm leading-relaxed text-white/70">
                  Đặt vé xem phim trực tuyến nhanh chóng, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên điện
                  thoại.
               </p>
            </div>

            {renderLinkColumn('Khám phá', EXPLORE_LINKS)}
            {renderLinkColumn('Tài khoản', ACCOUNT_LINKS)}

            <div>
               <h3 className="text-sm font-bold uppercase tracking-wider text-white">Liên hệ & thanh toán</h3>
               <ul className="mt-5 space-y-3 text-sm text-white/70">
                  <li className="flex items-center gap-2.5">
                     <Phone className="size-4 text-accent-300" aria-hidden="true" />
                     Hotline hỗ trợ
                  </li>
                  <li className="flex items-center gap-2.5">
                     <Mail className="size-4 text-accent-300" aria-hidden="true" />
                     Email hỗ trợ khách hàng
                  </li>
                  <li className="flex items-center gap-2.5">
                     <MapPin className="size-4 text-accent-300" aria-hidden="true" />
                     Hệ thống rạp toàn quốc
                  </li>
                  <li className="flex items-center gap-2.5">
                     <CreditCard className="size-4 text-accent-300" aria-hidden="true" />
                     Thanh toán VNPay & MoMo
                  </li>
               </ul>
            </div>
         </div>

         <div className="border-t border-white/10">
            <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/50 sm:px-6 lg:px-8">
               © 2026 CinemaSphere. Mọi quyền được bảo lưu.
            </p>
         </div>
      </footer>
   );
}

export default Footer;
