import { Minus, Plus } from 'lucide-react';
import type { ReactElement } from 'react';

interface GridSizeStepperProps {
   label: string;
   value: number;
   minimum: number;
   maximum: number;
   onChange: (value: number) => void;
}

export function GridSizeStepper({ label, value, minimum, maximum, onChange }: GridSizeStepperProps): ReactElement {
   return (
      <div className="flex items-center justify-between gap-3">
         <span className="text-sm font-semibold text-ink-800">{label}</span>
         <div className="flex items-center gap-2">
            <button
               type="button"
               aria-label={`Giảm ${label.toLowerCase()}`}
               disabled={value <= minimum}
               onClick={() => onChange(value - 1)}
               className="grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
               <Minus className="size-4" aria-hidden="true" />
            </button>
            <output aria-label={label} className="w-8 text-center text-sm font-bold text-ink-900">
               {value}
            </output>
            <button
               type="button"
               aria-label={`Tăng ${label.toLowerCase()}`}
               disabled={value >= maximum}
               onClick={() => onChange(value + 1)}
               className="grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
               <Plus className="size-4" aria-hidden="true" />
            </button>
         </div>
      </div>
   );
}

export default GridSizeStepper;
