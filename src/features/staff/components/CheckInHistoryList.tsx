import type { ReactElement } from 'react';
import { toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import { cn } from '@/lib/common/utils';
import type { TicketScanLog } from '@/types/staff/checkIn';
import {
   CHECK_IN_RESULT_STYLES,
   CHECK_IN_TONE_CLASS_NAMES,
   TICKET_SCAN_ACTION_LABELS,
   type CheckInResultStyle,
} from '../utils/checkInLabels';

interface CheckInHistoryListProps {
   ticketScanLogs: TicketScanLog[];
   isLoading: boolean;
}

interface TicketScanLogGroup {
   key: string;
   ticketScanLog: TicketScanLog;
   ticketCount: number;
   staffNames: string[];
}

function groupTicketScanLogs(ticketScanLogs: TicketScanLog[]): TicketScanLogGroup[] {
   const groupsByKey: Map<string, TicketScanLogGroup> = new Map<string, TicketScanLogGroup>();
   for (const ticketScanLog of ticketScanLogs) {
      const key: string = [ticketScanLog.bookingCode, ticketScanLog.action, ticketScanLog.resultCode].join('|');
      const existingGroup: TicketScanLogGroup | undefined = groupsByKey.get(key);
      if (existingGroup) {
         existingGroup.ticketCount += ticketScanLog.ticketCount;
         if (ticketScanLog.staffName && !existingGroup.staffNames.includes(ticketScanLog.staffName)) {
            existingGroup.staffNames.push(ticketScanLog.staffName);
         }
      } else {
         groupsByKey.set(key, {
            key,
            ticketScanLog,
            ticketCount: ticketScanLog.ticketCount,
            staffNames: ticketScanLog.staffName ? [ticketScanLog.staffName] : [],
         });
      }
   }
   return Array.from(groupsByKey.values());
}

export function CheckInHistoryList({ ticketScanLogs, isLoading }: CheckInHistoryListProps): ReactElement {
   if (isLoading) {
      return <p className="text-sm text-ink-500">Đang tải lịch sử...</p>;
   }
   if (ticketScanLogs.length === 0) {
      return (
         <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
            Chưa có lượt xác nhận vào rạp nào ở chi nhánh này.
         </p>
      );
   }
   return (
      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100">
         {groupTicketScanLogs(ticketScanLogs).map(({ key, ticketScanLog, ticketCount, staffNames }) => {
            const resultStyle: CheckInResultStyle = CHECK_IN_RESULT_STYLES[ticketScanLog.resultCode];
            return (
               <li key={key} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <span className="w-36 shrink-0 text-xs text-ink-500">
                     {toVietnamTimeOfDay(ticketScanLog.createdAt)} ·{' '}
                     {toVietnamDate(ticketScanLog.createdAt).slice(8, 10)}/
                     {toVietnamDate(ticketScanLog.createdAt).slice(5, 7)}
                  </span>
                  <span className="w-40 shrink-0 font-mono text-xs font-bold text-ink-900">
                     {ticketScanLog.bookingCode}
                  </span>
                  <span className="text-ink-700">{TICKET_SCAN_ACTION_LABELS[ticketScanLog.action]}</span>
                  <span
                     className={cn(
                        'rounded-md border px-2 py-0.5 text-xs font-bold',
                        CHECK_IN_TONE_CLASS_NAMES[resultStyle.tone],
                     )}
                  >
                     {resultStyle.title}
                     {ticketCount > 0 ? ` · ${ticketCount} ghế` : ''}
                  </span>
                  <span className="ml-auto text-xs text-ink-600">{staffNames.join(', ')}</span>
               </li>
            );
         })}
      </ul>
   );
}

export default CheckInHistoryList;
