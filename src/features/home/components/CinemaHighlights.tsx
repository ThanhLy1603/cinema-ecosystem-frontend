import { ArrowRight, Armchair, Building2, MapPin } from 'lucide-react';
import Reveal from '@/components/common/Reveal';
import SectionHeader from '@/components/common/SectionHeader';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Cinema } from '@/types/cinema/cinema';

interface CinemaHighlightsProps {
   cinemas: Cinema[];
}

const MAX_HIGHLIGHTED_CINEMAS: number = 6;

export function CinemaHighlights({ cinemas }: CinemaHighlightsProps): ReactElement | null {
   if (cinemas.length === 0) {
      return null;
   }

   return (
      <section aria-labelledby="home-cinemas-heading" className="border-t border-ink-200 bg-white py-16">
         <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
            <SectionHeader
               eyebrow="Rạp chiếu toàn quốc"
               eyebrowIcon={MapPin}
               title="Hệ thống rạp"
               description="Chọn cụm rạp gần bạn để xem lịch chiếu chi tiết."
               headingId="home-cinemas-heading"
               action={
                  <Link
                     to="/cinemas"
                     className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline"
                  >
                     Xem tất cả rạp
                     <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
               }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {cinemas.slice(0, MAX_HIGHLIGHTED_CINEMAS).map((cinema, cinemaIndex) => (
                  <Reveal key={cinema.id} delayMs={(cinemaIndex % 3) * 90} className="h-full">
                     <Link
                        to={`/cinemas/${cinema.slug}`}
                        className="group flex gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
                     >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                           <Building2 className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 space-y-1">
                           <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                              {cinema.city}
                           </p>
                           <h3 className="truncate text-[15px] font-semibold text-ink-900 group-hover:text-brand-700">
                              {cinema.name}
                           </h3>
                           <p className="flex items-start gap-1.5 text-[13px] text-ink-500">
                              <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                              <span className="line-clamp-2">{cinema.address}</span>
                           </p>
                           <p className="flex items-center gap-1.5 text-xs text-ink-600">
                              <Armchair className="size-3.5 text-ink-400" aria-hidden="true" />
                              {cinema.hallCount} phòng chiếu
                           </p>
                        </div>
                     </Link>
                  </Reveal>
               ))}
            </div>
         </div>
      </section>
   );
}

export default CinemaHighlights;
