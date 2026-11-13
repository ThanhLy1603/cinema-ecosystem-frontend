import type { ReactElement } from 'react';
import { toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type { FnbDeliveryLog } from '@/types/staff/fnbPickup';

interface FnbPickupHistoryListProps {
   fnbDeliveryLogs: FnbDeliveryLog[];
   isLoading: boolean;
}

interface FnbDeliveryGroup {
   key: string;
   bookingCode: string;
   createdAt: string;
   staffName: string | null;
   fnbDeliveryLogs: FnbDeliveryLog[];
}

function groupDeliveryLogs(fnbDeliveryLogs: FnbDeliveryLog[]): FnbDeliveryGroup[] {
   const groupsByKey: Map<string, FnbDeliveryGroup> = new Map<string, FnbDeliveryGroup>();
   for (const fnbDeliveryLog of fnbDeliveryLogs) {
      const key: string = `${fnbDeliveryLog.bookingCode}|${fnbDeliveryLog.createdAt}|${fnbDeliveryLog.staffName ?? ''}`;
      const existingGroup: FnbDeliveryGroup | undefined = groupsByKey.get(key);
      if (existingGroup) {
         existingGroup.fnbDeliveryLogs.push(fnbDeliveryLog);
      } else {
         groupsByKey.set(key, {
            key,
            bookingCode: fnbDeliveryLog.bookingCode,
            createdAt: fnbDeliveryLog.createdAt,
            staffName: fnbDeliveryLog.staffName,
            fnbDeliveryLogs: [fnbDeliveryLog],
         });
      }
   }
   return Array.from(groupsByKey.values());
}

export function FnbPickupHistoryList({ fnbDeliveryLogs, isLoading }: FnbPickupHistoryListProps): ReactElement {
   if (isLoading) {
      return <p className="text-sm text-ink-500">Đang tải lịch sử...</p>;
   }
   if (fnbDeliveryLogs.length === 0) {
      return (
         <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
            Chưa có lượt giao bắp nước nào ở chi nhánh này.
         </p>
      );
   }
   return (
      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100">
         {groupDeliveryLogs(fnbDeliveryLogs).map((fnbDeliveryGroup) => (
            <li key={fnbDeliveryGroup.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
               <span className="w-36 shrink-0 text-xs text-ink-500">
                  {toVietnamTimeOfDay(fnbDeliveryGroup.createdAt)} ·{' '}
                  {toVietnamDate(fnbDeliveryGroup.createdAt).slice(8, 10)}/
                  {toVietnamDate(fnbDeliveryGroup.createdAt).slice(5, 7)}
               </span>
               <span className="w-40 shrink-0 font-mono text-xs font-bold text-ink-900">
                  {fnbDeliveryGroup.bookingCode}
               </span>
               <span className="flex min-w-0 flex-1 flex-wrap gap-2">
                  {fnbDeliveryGroup.fnbDeliveryLogs.map((fnbDeliveryLog) => (
                     <span
                        key={fnbDeliveryLog.id}
                        className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800"
                     >
                        {fnbDeliveryLog.quantity} × {fnbDeliveryLog.productName}
                     </span>
                  ))}
               </span>
               <span className="ml-auto text-xs text-ink-600">{fnbDeliveryGroup.staffName}</span>
            </li>
         ))}
      </ul>
   );
}

export default FnbPickupHistoryList;
