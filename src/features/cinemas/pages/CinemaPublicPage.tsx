import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Navigation, Phone } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicCinema } from '@/api/cinemaApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { publicCinemaDetailKey } from '@/lib/cinema/cinemaQueryKeys';
import { cn } from '@/lib/common/utils';
import type { CinemaDetail, Hall } from '@/types/cinema/cinema';
import CinemaShowtimeSection from '../components/CinemaShowtimeSection';
import FacilityChips from '../components/FacilityChips';
import HallSeatPreview from '../components/HallSeatPreview';
import { buildMapUrl, formatCoordinates } from '../utils/mapLink';

export function CinemaPublicPage(): ReactElement {
   const { slug = '' } = useParams<{ slug: string }>();
   const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
   const cinemaQuery: UseQueryResult<CinemaDetail> = useQuery<CinemaDetail>({
      queryKey: publicCinemaDetailKey(slug),
      queryFn: () => getPublicCinema(slug),
      enabled: slug.length > 0,
   });

   const backLink: ReactElement = (
      <Link to="/cinemas" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
         <ArrowLeft className="size-4" aria-hidden="true" />
         Tất cả rạp chiếu
      </Link>
   );

   if (cinemaQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (cinemaQuery.isError) {
      return (
         <section className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12">
            <Alert variant="error">{getErrorMessage(cinemaQuery.error)}</Alert>
            {backLink}
         </section>
      );
   }

   const cinemaDetail: CinemaDetail = cinemaQuery.data;
   const activeHall: Hall | undefined =
      cinemaDetail.halls.find((hall) => hall.id === selectedHallId) ?? cinemaDetail.halls[0];

   return (
      <section className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 sm:px-6">
         {backLink}

         <header className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-xs sm:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{cinemaDetail.city}</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{cinemaDetail.name}</h1>
            <ul className="space-y-2 text-sm text-ink-600">
               <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  {cinemaDetail.address}
               </li>
               {cinemaDetail.phone && (
                  <li className="flex items-center gap-2">
                     <Phone className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                     <a href={`tel:${cinemaDetail.phone}`} className="font-medium hover:text-brand-700">
                        {cinemaDetail.phone}
                     </a>
                  </li>
               )}
               {cinemaDetail.latitude !== null && cinemaDetail.longitude !== null && (
                  <li className="flex flex-wrap items-center gap-2">
                     <Navigation className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                     <a
                        href={buildMapUrl(cinemaDetail.latitude, cinemaDetail.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-brand-700"
                     >
                        Xem trên bản đồ
                     </a>
                     <span className="text-xs text-ink-400">
                        ({formatCoordinates(cinemaDetail.latitude, cinemaDetail.longitude)})
                     </span>
                  </li>
               )}
            </ul>
            <FacilityChips facilities={cinemaDetail.facilities} />
         </header>

         <CinemaShowtimeSection cinemaId={cinemaDetail.id} />

         <section className="space-y-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-xs sm:p-8">
            <h2 className="text-xl font-bold text-ink-900">Phòng chiếu & sơ đồ ghế</h2>
            {cinemaDetail.halls.length === 0 && (
               <p className="text-sm text-ink-500">Cụm rạp này chưa mở phòng chiếu nào.</p>
            )}
            {activeHall && (
               <>
                  <div role="tablist" aria-label="Chọn phòng chiếu" className="flex flex-wrap gap-2">
                     {cinemaDetail.halls.map((hall) => (
                        <button
                           key={hall.id}
                           type="button"
                           role="tab"
                           aria-selected={hall.id === activeHall.id}
                           onClick={() => setSelectedHallId(hall.id)}
                           className={cn(
                              'rounded-xl border px-4 py-2 text-sm font-bold transition-all',
                              hall.id === activeHall.id
                                 ? 'border-brand-500 bg-brand-500 text-white shadow-glow'
                                 : 'border-ink-200 bg-ink-100 text-ink-700 hover:text-brand-600',
                           )}
                        >
                           {hall.name}
                           <span
                              className={cn(
                                 'ml-2 rounded-full px-2 py-0.5 text-xs font-bold',
                                 hall.id === activeHall.id ? 'bg-white/25 text-white' : 'bg-white text-ink-700',
                              )}
                           >
                              {hall.screenType}
                           </span>
                        </button>
                     ))}
                  </div>
                  <HallSeatPreview key={activeHall.id} hallId={activeHall.id} />
               </>
            )}
         </section>
      </section>
   );
}

export default CinemaPublicPage;
