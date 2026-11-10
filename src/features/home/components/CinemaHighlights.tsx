import { ArrowRight, Armchair, Building2, MapPin } from 'lucide-react';
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
      <section aria-labelledby="home-cinemas-heading" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
         <div className="flex flex-wrap items-end justify-between gap-x-6 border-b border-ink-200">
            <h2 id="home-cinemas-heading" className="pb-3 text-xl font-bold uppercase tracking-tight text-ink-900">
               Hệ thống rạp
            </h2>
            <Link
               to="/cinemas"
               className="inline-flex items-center gap-1.5 pb-3 text-sm font-semibold text-brand-700 hover:underline"
            >
               Xem tất cả rạp
               <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
         </div>

         <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {cinemas.slice(0, MAX_HIGHLIGHTED_CINEMAS).map((cinema) => (
               <Link
                  key={cinema.id}
                  to={`/cinemas/${cinema.slug}`}
                  className="group flex gap-4 rounded-lg bg-white p-4 ring-1 ring-ink-200 transition-colors hover:ring-brand-300"
               >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                     <Building2 className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-1">
                     <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{cinema.city}</p>
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
            ))}
         </div>
      </section>
   );
}

export default CinemaHighlights;
