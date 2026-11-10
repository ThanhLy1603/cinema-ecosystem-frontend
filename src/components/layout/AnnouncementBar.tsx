import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

interface TopBarLink {
   label: string;
   to: string;
}

const TOP_BAR_LINKS: TopBarLink[] = [
   { label: 'Vé của tôi', to: '/tickets' },
   { label: 'Ưu đãi', to: '/promotions' },
   { label: 'Hệ thống rạp', to: '/cinemas' },
];

export function AnnouncementBar(): ReactElement {
   return (
      <div className="hidden bg-ink-900 text-[12px] text-white/75 sm:block">
         <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
            <p>Đặt vé online · Chọn ghế realtime · Nhận vé QR trên điện thoại</p>
            <nav aria-label="Liên kết nhanh" className="flex items-center gap-5">
               {TOP_BAR_LINKS.map((topBarLink) => (
                  <Link key={topBarLink.to} to={topBarLink.to} className="transition-colors hover:text-white">
                     {topBarLink.label}
                  </Link>
               ))}
            </nav>
         </div>
      </div>
   );
}

export default AnnouncementBar;
