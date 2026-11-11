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

const PAYMENT_PARTNERS: string[] = ['MoMo', 'VNPAY', 'VietQR', 'Visa / Master'];

function renderLinkColumn(title: string, footerLinks: FooterLink[]): ReactElement {
   return (
      <div className="space-y-3">
         <h3 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
         <ul className="space-y-2 text-xs">
            {footerLinks.map((footerLink) => (
               <li key={footerLink.to}>
                  <Link to={footerLink.to} className="text-ink-400 transition-colors hover:text-brand-400">
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
      <footer className="bg-ink-900 text-ink-300">
         <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:px-12">
            <div className="grid gap-8 border-b border-ink-800 pb-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
               <div className="space-y-3">
                  <Logo tone="light" variant="cinema" />
                  <p className="max-w-xs text-xs leading-relaxed text-ink-400">
                     Đặt vé xem phim trực tuyến nhanh chóng, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên
                     điện thoại.
                  </p>
               </div>

               {renderLinkColumn('Khám phá', EXPLORE_LINKS)}
               {renderLinkColumn('Tài khoản', ACCOUNT_LINKS)}

               <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Chăm sóc khách hàng</h3>
                  <ul className="space-y-2 text-xs text-ink-400">
                     <li className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-brand-400" aria-hidden="true" />
                        Hotline hỗ trợ
                     </li>
                     <li className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-brand-400" aria-hidden="true" />
                        Email hỗ trợ khách hàng
                     </li>
                     <li className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-brand-400" aria-hidden="true" />
                        Hệ thống rạp toàn quốc
                     </li>
                     <li className="flex items-center gap-1.5">
                        <CreditCard className="size-3.5 text-brand-400" aria-hidden="true" />
                        Đối tác thanh toán
                     </li>
                  </ul>
                  <ul className="flex flex-wrap gap-1.5">
                     {PAYMENT_PARTNERS.map((paymentPartner) => (
                        <li
                           key={paymentPartner}
                           className="rounded border border-ink-700 bg-ink-800 px-2 py-0.5 text-[10px] text-ink-200"
                        >
                           {paymentPartner}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            <p className="pt-6 text-center text-xs text-ink-400">© 2026 CinemaSphere. Mọi quyền được bảo lưu.</p>
         </div>
      </footer>
   );
}

export default Footer;
