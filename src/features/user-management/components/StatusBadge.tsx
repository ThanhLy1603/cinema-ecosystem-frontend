import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { UserStatus } from '@/types/admin';
import { USER_STATUS_LABELS } from '../utils/labels';

interface StatusBadgeProps {
   userStatus: UserStatus;
}

const STATUS_CLASSES: Record<UserStatus, string> = {
   ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
   LOCKED: 'bg-gold-50 text-ink-800 ring-gold-200',
   SUSPENDED: 'bg-brand-50 text-brand-700 ring-brand-200',
   DELETED: 'bg-ink-100 text-ink-500 ring-ink-200',
};

export function StatusBadge({ userStatus }: StatusBadgeProps): ReactElement {
   return (
      <span
         className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
            STATUS_CLASSES[userStatus],
         )}
      >
         {USER_STATUS_LABELS[userStatus]}
      </span>
   );
}

export default StatusBadge;
