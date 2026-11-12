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
   { label: 'Giới thiệu', to: '/about' },
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
         <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">{title}</h3>
         <ul className="space-y-2 text-sm">
            {footerLinks.map((footerLink) => (
               <li key={footerLink.to}>
                  <Link to={footerLink.to} className="text-ink-800 transition-colors hover:text-brand-600">
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
      <footer className="mt-10 bg-[#dfeae7] text-ink-700">
         <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:px-12">
            <div className="grid gap-8 border-b border-ink-200 pb-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
               <div className="space-y-3">
                  <Logo variant="cinema" />
                  <p className="max-w-xs text-sm leading-relaxed text-ink-700">
                     Đặt vé xem phim trực tuyến nhanh chóng, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên
                     điện thoại.
                  </p>
               </div>

               {renderLinkColumn('Khám phá', EXPLORE_LINKS)}
               {renderLinkColumn('Tài khoản', ACCOUNT_LINKS)}

               <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">Chăm sóc khách hàng</h3>
                  <ul className="space-y-2 text-sm text-ink-800">
                     <li className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-ink-800" aria-hidden="true" />
                        Hotline hỗ trợ
                     </li>
                     <li className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-ink-800" aria-hidden="true" />
                        Email hỗ trợ khách hàng
                     </li>
                     <li className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-ink-800" aria-hidden="true" />
                        Hệ thống rạp toàn quốc
                     </li>
                     <li className="flex items-center gap-1.5">
                        <CreditCard className="size-3.5 text-ink-800" aria-hidden="true" />
                        Đối tác thanh toán
                     </li>
                  </ul>
                  <ul className="flex flex-wrap gap-1.5">
                     {PAYMENT_PARTNERS.map((paymentPartner) => (
                        <li
                           key={paymentPartner}
                           className="rounded border border-ink-300 bg-white px-2 py-0.5 text-[11px] text-ink-700"
                        >
                           {paymentPartner}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            <p className="pt-6 text-center text-xs text-ink-500">© 2026 CinemaSphere. Mọi quyền được bảo lưu.</p>
         </div>
      </footer>
   );
}

export default Footer;
