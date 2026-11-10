import { ArrowRight, Armchair, Building2, MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Cinema } from '@/types/cinema';

interface CinemaHighlightsProps {
   cinemas: Cinema[];
}

const MAX_HIGHLIGHTED_CINEMAS: number = 6;

export function CinemaHighlights({ cinemas }: CinemaHighlightsProps): ReactElement | null {
   if (cinemas.length === 0) {
      return null;
   }

   return (
      <section className="bg-sand/70">
         <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
               <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">Hệ thống rạp</h2>
                  <p className="text-ink-500">Chọn cụm rạp gần bạn để xem phòng chiếu và sơ đồ ghế.</p>
               </div>
               <Link
                  to="/cinemas"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:underline"
               >
                  Xem tất cả rạp
                  <ArrowRight className="size-4" aria-hidden="true" />
               </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
               {cinemas.slice(0, MAX_HIGHLIGHTED_CINEMAS).map((cinema) => (
                  <Link
                     key={cinema.id}
                     to={`/cinemas/${cinema.slug}`}
                     className="group flex gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                  >
                     <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                        <Building2 className="size-7" aria-hidden="true" />
                     </span>
                     <div className="min-w-0 space-y-1.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{cinema.city}</p>
                        <h3 className="truncate text-lg font-bold text-ink-900 group-hover:text-brand-700">
                           {cinema.name}
                        </h3>
                        <p className="flex items-start gap-1.5 text-sm text-ink-500">
                           <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
                           <span className="line-clamp-2">{cinema.address}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                           <Armchair className="size-3.5 text-brand-500" aria-hidden="true" />
                           {cinema.hallCount} phòng chiếu
                        </p>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>
   );
}

export default CinemaHighlights;
