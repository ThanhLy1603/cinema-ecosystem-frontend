import { CircleAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import type { CinemaOption } from '@/types/cinema';

interface BranchPickerProps {
   cinemaOptions: CinemaOption[];
   selectedCinemaIds: number[];
   primaryCinemaId: number | null;
   onChange: (selectedCinemaIds: number[], primaryCinemaId: number | null) => void;
   error?: string;
   disabled?: boolean;
}

export function BranchPicker({
   cinemaOptions,
   selectedCinemaIds,
   primaryCinemaId,
   onChange,
   error,
   disabled = false,
}: BranchPickerProps): ReactElement {
   function toggleCinema(cinemaId: number): void {
      if (selectedCinemaIds.includes(cinemaId)) {
         const remainingCinemaIds: number[] = selectedCinemaIds.filter(
            (selectedCinemaId) => selectedCinemaId !== cinemaId,
         );
         const nextPrimaryCinemaId: number | null =
            primaryCinemaId === cinemaId ? (remainingCinemaIds[0] ?? null) : primaryCinemaId;
         onChange(remainingCinemaIds, nextPrimaryCinemaId);
         return;
      }
      onChange([...selectedCinemaIds, cinemaId], primaryCinemaId ?? cinemaId);
   }

   if (cinemaOptions.length === 0) {
      return <p className="text-sm text-ink-500">Chưa có chi nhánh nào để chọn.</p>;
   }

   return (
      <fieldset className="space-y-3" disabled={disabled}>
         <legend className="sr-only">Chi nhánh</legend>
         {cinemaOptions.map((cinemaOption) => {
            const isSelected: boolean = selectedCinemaIds.includes(cinemaOption.id);
            return (
               <div
                  key={cinemaOption.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 px-4 py-3"
               >
                  <label className="flex items-center gap-3 text-sm font-semibold text-ink-900">
                     <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCinema(cinemaOption.id)}
                        className="size-4 accent-brand-600"
                     />
                     <span>
                        {cinemaOption.name}
                        <span className="ml-2 text-xs font-normal text-ink-500">{cinemaOption.city}</span>
                     </span>
                  </label>
                  {isSelected && (
                     <label className="flex items-center gap-2 text-xs font-semibold text-ink-600">
                        <input
                           type="radio"
                           name="primary-cinema"
                           checked={primaryCinemaId === cinemaOption.id}
                           onChange={() => onChange(selectedCinemaIds, cinemaOption.id)}
                           className="size-4 accent-brand-600"
                        />
                        Chi nhánh chính
                     </label>
                  )}
               </div>
            );
         })}
         {error && (
            <p role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-danger-700">
               <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
               {error}
            </p>
         )}
      </fieldset>
   );
}

export default BranchPicker;
