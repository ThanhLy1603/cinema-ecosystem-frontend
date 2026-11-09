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
   { label: 'Hệ thống rạp', to: '/cinemas' },
   { label: 'Khuyến mãi', to: '/promotions' },
   { label: 'Cộng đồng & Blog', to: '/community' },
];

const ACCOUNT_LINKS: FooterLink[] = [
   { label: 'Đăng nhập', to: '/login' },
   { label: 'Đăng ký thành viên', to: '/register' },
   { label: 'Vé của tôi', to: '/tickets' },
];

export function Footer(): ReactElement {
   return (
      <footer className="border-t border-ink-100 bg-sand/60">
         <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
            <div className="space-y-4">
               <Logo />
               <p className="max-w-xs text-sm leading-relaxed text-ink-500">
                  Đặt vé xem phim trực tuyến nhanh chóng, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên điện
                  thoại.
               </p>
            </div>

            <div>
               <h3 className="text-sm font-bold text-ink-900">Khám phá</h3>
               <ul className="mt-4 space-y-2.5 text-sm">
                  {EXPLORE_LINKS.map((footerLink) => (
                     <li key={footerLink.to}>
                        <Link to={footerLink.to} className="text-ink-500 transition-colors hover:text-brand-700">
                           {footerLink.label}
                        </Link>
                     </li>
                  ))}
               </ul>
            </div>

            <div>
               <h3 className="text-sm font-bold text-ink-900">Tài khoản</h3>
               <ul className="mt-4 space-y-2.5 text-sm">
                  {ACCOUNT_LINKS.map((footerLink) => (
                     <li key={footerLink.to}>
                        <Link to={footerLink.to} className="text-ink-500 transition-colors hover:text-brand-700">
                           {footerLink.label}
                        </Link>
                     </li>
                  ))}
               </ul>
            </div>

            <div>
               <h3 className="text-sm font-bold text-ink-900">Liên hệ & thanh toán</h3>
               <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
                  <li className="flex items-center gap-2.5">
                     <Phone className="size-4 text-brand-500" aria-hidden="true" />
                     Hotline hỗ trợ
                  </li>
                  <li className="flex items-center gap-2.5">
                     <Mail className="size-4 text-brand-500" aria-hidden="true" />
                     Email hỗ trợ khách hàng
                  </li>
                  <li className="flex items-center gap-2.5">
                     <MapPin className="size-4 text-brand-500" aria-hidden="true" />
                     Hệ thống rạp toàn quốc
                  </li>
                  <li className="flex items-center gap-2.5">
                     <CreditCard className="size-4 text-brand-500" aria-hidden="true" />
                     Thanh toán VNPay & MoMo
                  </li>
               </ul>
            </div>
         </div>

         <div className="border-t border-ink-100">
            <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-ink-400 sm:px-6 lg:px-8">
               © 2026 CinemaSphere. Mọi quyền được bảo lưu.
            </p>
         </div>
      </footer>
   );
}

export default Footer;
