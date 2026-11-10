import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/common/utils';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
   variant?: AlertVariant;
   children: ReactNode;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
   error: 'border-danger-200 bg-danger-50 text-danger-800',
   success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
   info: 'border-accent-200 bg-accent-50 text-ink-800',
};

const VARIANT_ICONS: Record<AlertVariant, LucideIcon> = {
   error: CircleAlert,
   success: CircleCheck,
   info: Info,
};

export function Alert({ variant = 'info', children }: AlertProps): ReactElement {
   const Icon: LucideIcon = VARIANT_ICONS[variant];
   return (
      <div
         role={variant === 'error' ? 'alert' : 'status'}
         className={cn(
            'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium',
            VARIANT_CLASSES[variant],
         )}
      >
         <Icon className="mt-0.5 size-[18px] shrink-0" aria-hidden="true" />
         <div className="leading-relaxed">{children}</div>
      </div>
   );
}

export default Alert;
