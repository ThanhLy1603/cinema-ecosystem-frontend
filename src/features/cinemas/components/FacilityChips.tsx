import type { ReactElement } from 'react';
import type { Facility } from '@/types/cinema/cinema';

interface FacilityChipsProps {
   facilities: Facility[];
}

export function FacilityChips({ facilities }: FacilityChipsProps): ReactElement | null {
   if (facilities.length === 0) {
      return null;
   }
   return (
      <ul className="flex flex-wrap gap-2">
         {facilities.map((facility) => (
            <li
               key={facility.id}
               className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-ink-800 ring-1 ring-accent-200"
            >
               {facility.iconUrl && <img src={facility.iconUrl} alt="" className="size-4 object-contain" />}
               {facility.name}
            </li>
         ))}
      </ul>
   );
}

export default FacilityChips;
