import { ArrowRight, Sparkles } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export function AnnouncementBar(): ReactElement {
   return (
      <div className="bg-gradient-to-r from-brand-800 via-brand-600 to-accent-500 text-white">
         <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm font-semibold sm:px-6 lg:px-8">
            <Sparkles className="size-4 text-accent-200" aria-hidden="true" />
            Đặt vé online · Chọn ghế realtime · Nhận vé QR ngay trên điện thoại
            <Link
               to="/movies"
               className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide transition-colors hover:bg-white/30"
            >
               Chốt kèo phim hay
               <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
         </p>
      </div>
   );
}

export default AnnouncementBar;
