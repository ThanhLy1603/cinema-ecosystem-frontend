import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { useState, type ReactElement } from 'react'
import { cn } from '@/lib/utils'

interface TextFieldProps {
   id: string
   label: string
   value: string
   onChange: (value: string) => void
   type?: 'text' | 'email' | 'password' | 'tel'
   icon?: LucideIcon
   error?: string
   hint?: string
   placeholder?: string
   autoComplete?: string
   disabled?: boolean
   optional?: boolean
   maxLength?: number
   autoFocus?: boolean
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
   autoFocus = false,
}: TextFieldProps): ReactElement {
   const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)
   const isPasswordField: boolean = type === 'password'
   const inputType: string = isPasswordField && isPasswordVisible ? 'text' : type
   const messageId: string = `${id}-message`
   const hasError: boolean = Boolean(error)

   return (
      <div className="space-y-1.5">
         <label htmlFor={id} className="flex items-baseline justify-between text-sm font-semibold text-ink-800">
            <span>{label}</span>
            {optional && <span className="text-xs font-normal text-ink-400">Không bắt buộc</span>}
         </label>

         <div className="relative">
            {Icon && (
               <Icon
                  className={cn(
                     'pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 transition-colors',
                     hasError ? 'text-brand-500' : 'text-ink-400',
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
               autoFocus={autoFocus}
               aria-invalid={hasError}
               aria-describedby={error || hint ? messageId : undefined}
               className={cn(
                  'h-12 w-full rounded-xl border bg-white text-[15px] text-ink-900 shadow-sm outline-none transition-all placeholder:text-ink-300 disabled:bg-ink-50 disabled:text-ink-400',
                  Icon ? 'pl-11' : 'pl-4',
                  isPasswordField ? 'pr-12' : 'pr-4',
                  hasError
                     ? 'border-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100'
                     : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
               )}
            />
            {isPasswordField && (
               <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  aria-label={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
               >
                  {isPasswordVisible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
               </button>
            )}
         </div>

         {error ? (
            <p id={messageId} role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-brand-700">
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
   )
}

export default TextField
