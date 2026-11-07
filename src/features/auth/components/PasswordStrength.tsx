import type { ReactElement } from 'react'
import { cn } from '@/lib/utils'
import { getPasswordStrength } from '../utils/validation'

interface PasswordStrengthProps {
   password: string
}

const STRENGTH_LABELS: string[] = ['Quá yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
const STRENGTH_BAR_CLASSES: string[] = ['bg-ink-200', 'bg-brand-400', 'bg-gold-400', 'bg-gold-500', 'bg-emerald-500']
const STRENGTH_TEXT_CLASSES: string[] = [
   'text-ink-400',
   'text-brand-600',
   'text-gold-600',
   'text-gold-600',
   'text-emerald-600',
]
const BAR_COUNT: number = 4

export function PasswordStrength({ password }: PasswordStrengthProps): ReactElement | null {
   if (password.length === 0) {
      return null
   }
   const strength: number = getPasswordStrength(password)
   return (
      <div className="space-y-1.5" aria-live="polite">
         <div className="flex gap-1.5">
            {Array.from({ length: BAR_COUNT }, (_unused, barIndex) => (
               <span
                  key={barIndex}
                  className={cn(
                     'h-1.5 flex-1 rounded-full transition-colors duration-300',
                     barIndex < strength ? STRENGTH_BAR_CLASSES[strength] : 'bg-ink-100',
                  )}
               />
            ))}
         </div>
         <p className={cn('text-xs font-semibold', STRENGTH_TEXT_CLASSES[strength])}>
            Độ mạnh mật khẩu: {STRENGTH_LABELS[strength]}
         </p>
      </div>
   )
}

export default PasswordStrength
