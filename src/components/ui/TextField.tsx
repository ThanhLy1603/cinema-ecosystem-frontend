import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { cn } from '@/lib/common/utils';

interface TextFieldProps {
   id: string;
   label: string;
   value: string;
   onChange: (value: string) => void;
   type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'time';
   icon?: LucideIcon;
   error?: string;
   hint?: string;
   placeholder?: string;
   autoComplete?: string;
   disabled?: boolean;
   optional?: boolean;
   maxLength?: number;
   max?: string;
   autoFocus?: boolean;
   hideLabel?: boolean;
}

export function TextField({
   id,
   label,
   value,
   onChange,
   type = 'text',
   icon: Icon,
   error,
   hint,
   placeholder,
   autoComplete,
   disabled = false,
   optional = false,
   maxLength,
   max,
   autoFocus = false,
   hideLabel = false,
}: TextFieldProps): ReactElement {
   const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
   const isPasswordField: boolean = type === 'password';
   const inputType: string = isPasswordField && isPasswordVisible ? 'text' : type;
   const messageId: string = `${id}-message`;
   const hasError: boolean = Boolean(error);

   return (
      <div className="space-y-1">
         <label
            htmlFor={id}
            className={cn(
               'flex items-baseline justify-between text-[13px] font-semibold text-ink-700',
               hideLabel && 'sr-only',
            )}
         >
            <span>{label}</span>
            {optional && <span className="text-xs font-normal text-ink-400">Không bắt buộc</span>}
         </label>

         <div className="relative">
            {Icon && (
               <Icon
                  className={cn(
                     'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors',
                     hasError ? 'text-danger-500' : 'text-ink-400',
                  )}
                  aria-hidden="true"
               />
            )}
            <input
               id={id}
               name={id}
               type={inputType}
               value={value}
               onChange={(changeEvent) => onChange(changeEvent.target.value)}
               placeholder={placeholder}
               autoComplete={autoComplete}
               disabled={disabled}
               maxLength={maxLength}
               max={max}
               autoFocus={autoFocus}
               aria-invalid={hasError}
               aria-describedby={error || hint ? messageId : undefined}
               className={cn(
                  'h-10 w-full rounded-lg border bg-white text-sm text-ink-900 shadow-sm outline-none transition-colors placeholder:text-ink-300 disabled:bg-ink-50 disabled:text-ink-400',
                  Icon ? 'pl-10' : 'pl-3',
                  isPasswordField ? 'pr-11' : 'pr-3',
                  hasError
                     ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-100'
                     : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
               )}
            />
            {isPasswordField && (
               <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  aria-label={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
               >
                  {isPasswordVisible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
               </button>
            )}
         </div>

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

export default TextField;
