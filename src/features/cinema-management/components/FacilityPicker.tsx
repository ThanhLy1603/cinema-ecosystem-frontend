import type { ReactElement } from 'react';
import type { Facility } from '@/types/cinema';

interface FacilityPickerProps {
   facilities: Facility[];
   selectedFacilityIds: number[];
   onChange: (selectedFacilityIds: number[]) => void;
   disabled?: boolean;
}

export function FacilityPicker({
   facilities,
   selectedFacilityIds,
   onChange,
   disabled = false,
}: FacilityPickerProps): ReactElement {
   function toggleFacility(facilityId: number): void {
      if (selectedFacilityIds.includes(facilityId)) {
         onChange(selectedFacilityIds.filter((selectedFacilityId) => selectedFacilityId !== facilityId));
         return;
      }
      onChange([...selectedFacilityIds, facilityId]);
   }

   if (facilities.length === 0) {
      return <p className="text-sm text-ink-500">Chưa có tiện ích nào trong danh mục.</p>;
   }

   return (
      <fieldset className="grid gap-3 sm:grid-cols-2" disabled={disabled}>
         <legend className="sr-only">Tiện ích của rạp</legend>
         {facilities.map((facility) => (
            <label
               key={facility.id}
               className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm transition-colors hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"
            >
               <input
                  type="checkbox"
                  checked={selectedFacilityIds.includes(facility.id)}
                  onChange={() => toggleFacility(facility.id)}
                  className="mt-0.5 size-4 accent-brand-600"
               />
               <span>
                  <span className="block font-semibold text-ink-900">{facility.name}</span>
                  {facility.description && <span className="block text-xs text-ink-500">{facility.description}</span>}
               </span>
            </label>
         ))}
      </fieldset>
   );
}

export default FacilityPicker;
