import { Armchair, MapPin, Navigation, Phone } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Cinema } from '@/types/cinema/cinema';
import { buildMapUrl } from '../utils/mapLink';
import FacilityChips from './FacilityChips';

interface CinemaCardProps {
   cinema: Cinema;
}

export function CinemaCard({ cinema }: CinemaCardProps): ReactElement {
   return (
      <article className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg">
         <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{cinema.city}</span>
            <h2 className="text-xl font-bold text-ink-900">
               <Link to={`/cinemas/${cinema.slug}`} className="hover:text-brand-700">
                  {cinema.name}
               </Link>
            </h2>
         </div>

         <ul className="space-y-2 text-sm text-ink-600">
            <li className="flex items-start gap-2">
               <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
               <span>{cinema.address}</span>
            </li>
            {cinema.phone && (
               <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  <a href={`tel:${cinema.phone}`} className="font-medium hover:text-brand-700">
                     {cinema.phone}
                  </a>
               </li>
            )}
            <li className="flex items-center gap-2">
               <Armchair className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
               <span>{cinema.hallCount} phòng chiếu</span>
            </li>
         </ul>

         <FacilityChips facilities={cinema.facilities} />

         <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 text-sm font-semibold">
            <Link to={`/cinemas/${cinema.slug}`} className="text-brand-700 hover:underline">
               Xem chi tiết
            </Link>
            {cinema.latitude !== null && cinema.longitude !== null && (
               <a
                  href={buildMapUrl(cinema.latitude, cinema.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-ink-600 hover:text-brand-700"
               >
                  <Navigation className="size-4" aria-hidden="true" />
                  Chỉ đường
               </a>
            )}
         </div>
      </article>
   );
}

export default CinemaCard;
