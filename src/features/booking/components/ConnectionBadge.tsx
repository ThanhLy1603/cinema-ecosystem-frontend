import type { ReactElement } from 'react';
import type { ConnectionState } from '@/api/websocketClient';
import { cn } from '@/lib/common/utils';

interface ConnectionBadgeProps {
   connectionState: ConnectionState;
}

const CONNECTION_LABELS: Record<ConnectionState, string> = {
   connecting: 'Đang kết nối...',
   connected: 'Cập nhật trực tiếp',
   reconnecting: 'Mất kết nối, đang thử lại...',
};

export function ConnectionBadge({ connectionState }: ConnectionBadgeProps): ReactElement {
   return (
      <span
         role="status"
         className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-600"
      >
         <span
            className={cn(
               'size-2 rounded-full',
               connectionState === 'connected' ? 'bg-emerald-500' : 'animate-pulse bg-amber-500',
            )}
            aria-hidden="true"
         />
         {CONNECTION_LABELS[connectionState]}
      </span>
   );
}

export default ConnectionBadge;
