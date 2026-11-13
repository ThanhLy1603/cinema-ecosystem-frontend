import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { getFnbDeliveries, getOperationsAuditLogs, getScanLogs } from '@/api/staff/operationsApi';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { cn } from '@/lib/common/utils';
import { useCinemaOptions } from '@/lib/cinema/useCinemaOptions';
import type { PageResponse } from '@/types/common/api';
import type { OperationsAuditLog, OperationsFnbDelivery, OperationsScanLog } from '@/types/staff/operations';
import OperationsFilterBar from '../components/OperationsFilterBar';
import { AuditLogTable, FnbDeliveryTable, ScanLogTable } from '../components/OperationsTables';
import { createDefaultFilterState, toOperationsFilter, type OperationsFilterState } from '../utils/operationsFilters';

type HistoryTab = 'SCAN' | 'FNB' | 'AUDIT';

interface HistoryTabOption {
   tab: HistoryTab;
   label: string;
}

const HISTORY_TABS: HistoryTabOption[] = [
   { tab: 'SCAN', label: 'Soát vé' },
   { tab: 'FNB', label: 'Giao bắp nước' },
   { tab: 'AUDIT', label: 'Nhật ký thao tác nhạy cảm' },
];

export function OperationsHistoryPage(): ReactElement {
   const [activeTab, setActiveTab] = useState<HistoryTab>('SCAN');
   const [operationsFilterState, setOperationsFilterState] = useState<OperationsFilterState>(createDefaultFilterState);
   const [page, setPage] = useState<number>(0);
   const cinemaOptionsQuery = useCinemaOptions();
   const scanLogsQuery: UseQueryResult<PageResponse<OperationsScanLog>> = useQuery<PageResponse<OperationsScanLog>>({
      queryKey: ['operations', 'scan-logs', operationsFilterState, page],
      queryFn: () => getScanLogs(toOperationsFilter(operationsFilterState, page)),
      enabled: activeTab === 'SCAN',
      placeholderData: keepPreviousData,
   });
   const fnbDeliveriesQuery: UseQueryResult<PageResponse<OperationsFnbDelivery>> = useQuery<
      PageResponse<OperationsFnbDelivery>
   >({
      queryKey: ['operations', 'fnb-deliveries', operationsFilterState, page],
      queryFn: () => getFnbDeliveries(toOperationsFilter(operationsFilterState, page)),
      enabled: activeTab === 'FNB',
      placeholderData: keepPreviousData,
   });
   const auditLogsQuery: UseQueryResult<PageResponse<OperationsAuditLog>> = useQuery<PageResponse<OperationsAuditLog>>({
      queryKey: ['operations', 'audit-logs', operationsFilterState, page],
      queryFn: () => getOperationsAuditLogs(toOperationsFilter(operationsFilterState, page)),
      enabled: activeTab === 'AUDIT',
      placeholderData: keepPreviousData,
   });

   function handleFilterChange(nextFilterState: OperationsFilterState): void {
      setOperationsFilterState(nextFilterState);
      setPage(0);
   }

   function handleTabChange(nextTab: HistoryTab): void {
      setActiveTab(nextTab);
      setPage(0);
   }

   function renderActiveTab(): ReactElement {
      if (activeTab === 'SCAN') {
         return renderResult(scanLogsQuery, (pageResponse: PageResponse<OperationsScanLog>) => (
            <ScanLogTable operationsScanLogs={pageResponse.content} />
         ));
      }
      if (activeTab === 'FNB') {
         return renderResult(fnbDeliveriesQuery, (pageResponse: PageResponse<OperationsFnbDelivery>) => (
            <FnbDeliveryTable operationsFnbDeliveries={pageResponse.content} />
         ));
      }
      return renderResult(auditLogsQuery, (pageResponse: PageResponse<OperationsAuditLog>) => (
         <AuditLogTable operationsAuditLogs={pageResponse.content} />
      ));
   }

   function renderResult<T>(
      pageQuery: UseQueryResult<PageResponse<T>>,
      renderTable: (pageResponse: PageResponse<T>) => ReactElement,
   ): ReactElement {
      return (
         <>
            {pageQuery.isError && <Alert variant="error">{getErrorMessage(pageQuery.error)}</Alert>}
            {pageQuery.data && (
               <>
                  {renderTable(pageQuery.data)}
                  <Pagination
                     page={pageQuery.data.page}
                     totalPages={pageQuery.data.totalPages}
                     totalElements={pageQuery.data.totalElements}
                     onPageChange={setPage}
                  />
               </>
            )}
            {pageQuery.isPending && <p className="text-sm text-ink-500">Đang tải dữ liệu...</p>}
         </>
      );
   }

   return (
      <div className="space-y-5">
         <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink-900">Lịch sử vận hành</h1>
            <p className="text-sm text-ink-500">
               Xem lịch sử soát vé, giao bắp nước và các thao tác nhạy cảm theo chi nhánh, nhân viên và ngày.
            </p>
         </header>
         <div role="tablist" aria-label="Loại lịch sử" className="flex flex-wrap gap-2">
            {HISTORY_TABS.map((historyTabOption: HistoryTabOption) => (
               <button
                  key={historyTabOption.tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === historyTabOption.tab}
                  onClick={() => handleTabChange(historyTabOption.tab)}
                  className={cn(
                     'rounded-full px-4 py-1.5 text-sm font-bold transition-colors',
                     activeTab === historyTabOption.tab
                        ? 'bg-brand-600 text-white'
                        : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
                  )}
               >
                  {historyTabOption.label}
               </button>
            ))}
         </div>
         <OperationsFilterBar
            operationsFilterState={operationsFilterState}
            cinemaOptions={cinemaOptionsQuery.data ?? []}
            showStaffFilter
            onChange={handleFilterChange}
         />
         {renderActiveTab()}
      </div>
   );
}

export default OperationsHistoryPage;
