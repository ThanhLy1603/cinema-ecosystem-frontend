import { CircleAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';

interface TextAreaFieldProps {
   id: string;
   label: string;
   value: string;
   onChange: (value: string) => void;
   rows?: number;
   error?: string;
   hint?: string;
   placeholder?: string;
   disabled?: boolean;
   optional?: boolean;
   maxLength?: number;
}

export function TextAreaField({
   id,
   label,
   value,
   onChange,
   rows = 5,
   error,
   hint,
   placeholder,
   disabled = false,
   optional = false,
   maxLength,
}: TextAreaFieldProps): ReactElement {
   const messageId: string = `${id}-message`;
   const hasError: boolean = Boolean(error);

   return (
      <div className="space-y-1">
         <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-semibold text-ink-700">
            <span>{label}</span>
            {optional && <span className="text-xs font-normal text-ink-400">Không bắt buộc</span>}
         </label>
         <textarea
            id={id}
            name={id}
            value={value}
            rows={rows}
            onChange={(changeEvent) => onChange(changeEvent.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={error || hint ? messageId : undefined}
            className={cn(
               'w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 shadow-sm outline-none transition-colors placeholder:text-ink-300 disabled:bg-ink-50 disabled:text-ink-400',
               hasError
                  ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-100'
                  : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
            )}
         />
         {error ? (
            <p
               id={messageId}
               role="alert"
               className="flex items-center gap-1.5 text-[13px] font-medium text-danger-700"
            >
               <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
               {error}
            </p>
         ) : (
            hint && (
               <p id={messageId} className="text-[13px] text-ink-500">
                  {hint}
               </p>
            )
         )}
      </div>
   );
}

export default TextAreaField;
