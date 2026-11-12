import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { MapPin, Phone } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { getPublicCinemas } from '@/api/cinemaApi';
import Reveal from '@/components/common/Reveal';
import Alert from '@/components/ui/Alert';
import { publicCinemaListKey } from '@/lib/cinema/cinemaQueryKeys';
import { getErrorMessage } from '@/lib/common/apiError';
import type { Cinema } from '@/types/cinema/cinema';

const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2'];

export function AboutCinemaList(): ReactElement {
   const cinemasQuery: UseQueryResult<Cinema[]> = useQuery<Cinema[]>({
      queryKey: publicCinemaListKey(''),
      queryFn: () => getPublicCinemas(undefined),
   });
   const cinemas: Cinema[] = cinemasQuery.data ?? [];

   return (
      <div>
         {cinemasQuery.isError && <Alert variant="error">{getErrorMessage(cinemasQuery.error)}</Alert>}
         {cinemasQuery.isPending && (
            <div className="grid gap-5 sm:grid-cols-2" aria-hidden="true">
               {SKELETON_KEYS.map((skeletonKey) => (
                  <div key={skeletonKey} className="h-36 animate-pulse rounded-2xl bg-white" />
               ))}
            </div>
         )}
         {cinemasQuery.isSuccess && cinemas.length === 0 && (
            <p className="rounded-2xl bg-white py-10 text-center text-sm text-ink-500 shadow-md">
               Danh sách rạp đang được cập nhật.
            </p>
         )}
         {cinemas.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2">
               {cinemas.map((cinema, cinemaIndex) => (
                  <li key={cinema.id}>
                     <Reveal delayMs={cinemaIndex * 80} className="h-full">
                        <Link
                           to={`/cinemas/${cinema.slug}`}
                           className="group block h-full space-y-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        >
                           <h3 className="text-lg font-extrabold text-ink-900 group-hover:text-brand-700">
                              {cinema.name}
                           </h3>
                           <p className="flex items-start gap-2 text-sm text-ink-700">
                              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
                              {cinema.address}, {cinema.city}
                           </p>
                           {cinema.phone && (
                              <p className="flex items-center gap-2 text-sm text-ink-700">
                                 <Phone className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
                                 Hotline: {cinema.phone}
                              </p>
                           )}
                           <p className="text-xs font-semibold text-ink-600">{cinema.hallCount} phòng chiếu</p>
                        </Link>
                     </Reveal>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}

export default AboutCinemaList;
