import type { ReactElement } from 'react';
import { FNB_STATUS_LABELS } from '@/lib/fnb/fnbLabels';
import { cn } from '@/lib/common/utils';
import type { FnbStatus } from '@/types/fnb/fnb';

interface FnbStatusBadgeProps {
   fnbStatus: FnbStatus;
   isDeleted?: boolean;
}

const STATUS_CLASSES: Record<FnbStatus, string> = {
   AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
   UNAVAILABLE: 'bg-amber-50 text-ink-800 ring-amber-200',
};

export function FnbStatusBadge({ fnbStatus, isDeleted = false }: FnbStatusBadgeProps): ReactElement {
   if (isDeleted) {
      return (
         <span className="inline-flex items-center whitespace-nowrap rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-500 ring-1 ring-ink-200">
            Đã xóa
         </span>
      );
   }
   return (
      <span
         className={cn(
            'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
            STATUS_CLASSES[fnbStatus],
         )}
      >
         {FNB_STATUS_LABELS[fnbStatus]}
      </span>
   );
}

export default FnbStatusBadge;
