import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { getAuditLogs } from '@/api/adminUserApi';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import type { AuditLog } from '@/types/auth/admin';
import type { PageResponse } from '@/types/common/api';
import { AUDIT_ACTION_LABELS } from '../utils/labels';
import { describeAuditDetails, formatDateTime } from '../utils/format';
import { adminUserAuditKey } from '../utils/queryKeys';

interface AuditLogCardProps {
   userId: number;
}

const AUDIT_PAGE_SIZE: number = 10;

export function AuditLogCard({ userId }: AuditLogCardProps): ReactElement {
   const [page, setPage] = useState<number>(0);
   const auditQuery: UseQueryResult<PageResponse<AuditLog>> = useQuery<PageResponse<AuditLog>>({
      queryKey: adminUserAuditKey(userId, page),
      queryFn: () => getAuditLogs(userId, page, AUDIT_PAGE_SIZE),
      placeholderData: keepPreviousData,
   });

   if (auditQuery.isError) {
      return <Alert variant="error">{getErrorMessage(auditQuery.error)}</Alert>;
   }
   if (!auditQuery.data) {
      return <p className="text-sm text-ink-500">Đang tải nhật ký...</p>;
   }
   const auditPage: PageResponse<AuditLog> = auditQuery.data;
   if (auditPage.content.length === 0) {
      return <p className="text-sm text-ink-500">Chưa có thao tác nào được ghi lại.</p>;
   }

   return (
      <div className="space-y-5">
         <ul className="divide-y divide-ink-100">
            {auditPage.content.map((auditLog) => (
               <li key={auditLog.id} className="space-y-1 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                     <span className="font-semibold text-ink-900">{AUDIT_ACTION_LABELS[auditLog.action]}</span>
                     <span className="text-xs text-ink-500">{formatDateTime(auditLog.createdAt)}</span>
                  </div>
                  <p className="text-ink-600">
                     Thực hiện bởi {auditLog.actorName ?? 'Hệ thống'}
                     {auditLog.ipAddress ? ` · ${auditLog.ipAddress}` : ''}
                  </p>
                  {describeAuditDetails(auditLog) && (
                     <p className="break-words text-xs text-ink-500">{describeAuditDetails(auditLog)}</p>
                  )}
               </li>
            ))}
         </ul>
         <Pagination
            page={auditPage.page}
            totalPages={auditPage.totalPages}
            totalElements={auditPage.totalElements}
            onPageChange={setPage}
         />
      </div>
   );
}

export default AuditLogCard;
