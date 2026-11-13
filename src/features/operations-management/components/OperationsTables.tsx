import type { ReactElement, ReactNode } from 'react';
import { formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import { AUDIT_ACTION_LABELS, CHECK_IN_RESULT_LABELS, SCAN_ACTION_LABELS } from '@/lib/staff/operationsLabels';
import type { OperationsAuditLog, OperationsFnbDelivery, OperationsScanLog } from '@/types/staff/operations';

interface TableShellProps {
   headers: string[];
   isEmpty: boolean;
   children: ReactNode;
}

function formatInstant(isoInstant: string): string {
   return `${toVietnamTimeOfDay(isoInstant)} ${formatDisplayDate(toVietnamDate(isoInstant))}`;
}

function TableShell({ headers, isEmpty, children }: TableShellProps): ReactElement {
   if (isEmpty) {
      return (
         <p className="rounded-xl bg-white p-6 text-center text-sm text-ink-500 ring-1 ring-ink-100">
            Không có dữ liệu trong khoảng đã chọn.
         </p>
      );
   }
   return (
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-ink-100">
         <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
               <tr>
                  {headers.map((header: string) => (
                     <th key={header} className="px-4 py-2.5 font-semibold">
                        {header}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">{children}</tbody>
         </table>
      </div>
   );
}

interface ScanLogTableProps {
   operationsScanLogs: OperationsScanLog[];
}

export function ScanLogTable({ operationsScanLogs }: ScanLogTableProps): ReactElement {
   return (
      <TableShell
         headers={['Thời gian', 'Chi nhánh', 'Nhân viên', 'Mã đơn', 'Thao tác', 'Kết quả', 'Số ghế']}
         isEmpty={operationsScanLogs.length === 0}
      >
         {operationsScanLogs.map((operationsScanLog: OperationsScanLog) => (
            <tr key={operationsScanLog.id}>
               <td className="whitespace-nowrap px-4 py-2.5">{formatInstant(operationsScanLog.createdAt)}</td>
               <td className="px-4 py-2.5">{operationsScanLog.cinemaName}</td>
               <td className="px-4 py-2.5">{operationsScanLog.staffName}</td>
               <td className="px-4 py-2.5 font-mono text-xs font-bold">
                  {operationsScanLog.bookingCode ?? operationsScanLog.scannedCode}
               </td>
               <td className="px-4 py-2.5">{SCAN_ACTION_LABELS[operationsScanLog.action]}</td>
               <td className="px-4 py-2.5">
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-800">
                     {CHECK_IN_RESULT_LABELS[operationsScanLog.resultCode]}
                  </span>
               </td>
               <td className="px-4 py-2.5 text-right font-bold">{operationsScanLog.ticketCount}</td>
            </tr>
         ))}
      </TableShell>
   );
}

interface FnbDeliveryTableProps {
   operationsFnbDeliveries: OperationsFnbDelivery[];
}

export function FnbDeliveryTable({ operationsFnbDeliveries }: FnbDeliveryTableProps): ReactElement {
   return (
      <TableShell
         headers={['Thời gian', 'Chi nhánh', 'Nhân viên', 'Mã đơn', 'Sản phẩm', 'Số lượng']}
         isEmpty={operationsFnbDeliveries.length === 0}
      >
         {operationsFnbDeliveries.map((operationsFnbDelivery: OperationsFnbDelivery) => (
            <tr key={operationsFnbDelivery.id}>
               <td className="whitespace-nowrap px-4 py-2.5">{formatInstant(operationsFnbDelivery.createdAt)}</td>
               <td className="px-4 py-2.5">{operationsFnbDelivery.cinemaName}</td>
               <td className="px-4 py-2.5">{operationsFnbDelivery.staffName}</td>
               <td className="px-4 py-2.5 font-mono text-xs font-bold">{operationsFnbDelivery.bookingCode}</td>
               <td className="px-4 py-2.5">{operationsFnbDelivery.productName}</td>
               <td className="px-4 py-2.5 text-right font-bold">{operationsFnbDelivery.quantity}</td>
            </tr>
         ))}
      </TableShell>
   );
}

interface AuditLogTableProps {
   operationsAuditLogs: OperationsAuditLog[];
}

export function AuditLogTable({ operationsAuditLogs }: AuditLogTableProps): ReactElement {
   return (
      <TableShell
         headers={['Thời gian', 'Chi nhánh', 'Người thực hiện', 'Thao tác', 'Đối tượng', 'Chi tiết']}
         isEmpty={operationsAuditLogs.length === 0}
      >
         {operationsAuditLogs.map((operationsAuditLog: OperationsAuditLog) => (
            <tr key={operationsAuditLog.id}>
               <td className="whitespace-nowrap px-4 py-2.5">{formatInstant(operationsAuditLog.createdAt)}</td>
               <td className="px-4 py-2.5">{operationsAuditLog.cinemaName ?? ''}</td>
               <td className="px-4 py-2.5">{operationsAuditLog.actorName ?? ''}</td>
               <td className="px-4 py-2.5">
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-800">
                     {AUDIT_ACTION_LABELS[operationsAuditLog.action]}
                  </span>
               </td>
               <td className="px-4 py-2.5 font-mono text-xs font-bold">{operationsAuditLog.targetCode ?? ''}</td>
               <td className="px-4 py-2.5 text-ink-700">{operationsAuditLog.detail ?? ''}</td>
            </tr>
         ))}
      </TableShell>
   );
}
