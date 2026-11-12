import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';

export type FnbBadgeKind = 'BEST_SELLER' | 'PROMO' | 'SOLD_OUT';

interface FnbBadgeProps {
   kind: FnbBadgeKind;
   className?: string;
}

const FNB_BADGE_LABELS: Record<FnbBadgeKind, string> = {
   BEST_SELLER: 'Bán chạy',
   PROMO: 'Ưu đãi',
   SOLD_OUT: 'Tạm hết',
};

const FNB_BADGE_CLASS_NAMES: Record<FnbBadgeKind, string> = {
   BEST_SELLER: 'bg-danger-600 text-white',
   PROMO: 'bg-accent-500 text-white',
   SOLD_OUT: 'bg-ink-600 text-white',
};

export function FnbBadge({ kind, className }: FnbBadgeProps): ReactElement {
   return (
      <span
         className={cn(
            'inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm',
            FNB_BADGE_CLASS_NAMES[kind],
            className,
         )}
      >
         {FNB_BADGE_LABELS[kind]}
      </span>
   );
}

export default FnbBadge;
