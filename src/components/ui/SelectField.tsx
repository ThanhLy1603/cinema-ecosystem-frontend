import { ChevronDown, CircleAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
   value: string;
   label: string;
}

interface SelectFieldProps {
   id: string;
   label: string;
   value: string;
   onChange: (value: string) => void;
   options: SelectOption[];
   error?: string;
   disabled?: boolean;
   optional?: boolean;
}

export function SelectField({
   id,
   label,
   value,
   onChange,
   options,
   error,
   disabled = false,
   optional = false,
}: SelectFieldProps): ReactElement {
   const messageId: string = `${id}-message`;
   const hasError: boolean = Boolean(error);

   return (
      <div className="space-y-1.5">
         <label htmlFor={id} className="flex items-baseline justify-between text-sm font-semibold text-ink-800">
            <span>{label}</span>
            {optional && <span className="text-xs font-normal text-ink-400">Không bắt buộc</span>}
         </label>

         <div className="relative">
            <select
               id={id}
               name={id}
               value={value}
               disabled={disabled}
               onChange={(changeEvent) => onChange(changeEvent.target.value)}
               aria-invalid={hasError}
               aria-describedby={error ? messageId : undefined}
               className={cn(
                  'h-12 w-full appearance-none rounded-xl border bg-white pl-4 pr-11 text-[15px] text-ink-900 shadow-sm outline-none transition-all disabled:bg-ink-50 disabled:text-ink-400',
                  hasError
                     ? 'border-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100'
                     : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
               )}
            >
               {options.map((selectOption) => (
                  <option key={selectOption.value} value={selectOption.value}>
                     {selectOption.label}
                  </option>
               ))}
            </select>
            <ChevronDown
               className="pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400"
               aria-hidden="true"
            />
         </div>

         {error && (
            <p id={messageId} role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-brand-700">
               <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
               {error}
            </p>
         )}
      </div>
   );
}

export default SelectField;
