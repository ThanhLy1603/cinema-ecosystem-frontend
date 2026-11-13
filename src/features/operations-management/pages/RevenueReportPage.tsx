import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { getOperationsShiftReport, getRevenueReport } from '@/api/staff/operationsApi';
import ShiftReportView from '@/components/common/ShiftReportView';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import { useCinemaOptions } from '@/lib/cinema/useCinemaOptions';
import { REVENUE_CHANNEL_LABELS } from '@/lib/staff/operationsLabels';
import type { RevenueChannel, RevenueReport, StaffRevenue } from '@/types/staff/operations';
import type { Shift, ShiftReport } from '@/types/staff/shift';
import OperationsFilterBar from '../components/OperationsFilterBar';
import { createDefaultFilterState, type OperationsFilterState } from '../utils/operationsFilters';

function formatInstant(isoInstant: string): string {
   return `${toVietnamTimeOfDay(isoInstant)} ${formatDisplayDate(toVietnamDate(isoInstant))}`;
}

export function RevenueReportPage(): ReactElement {
   const [operationsFilterState, setOperationsFilterState] = useState<OperationsFilterState>(createDefaultFilterState);
   const [viewedShiftId, setViewedShiftId] = useState<number | null>(null);
   const cinemaOptionsQuery = useCinemaOptions();
   const isRangeValid: boolean =
      operationsFilterState.from !== '' &&
      operationsFilterState.to !== '' &&
      operationsFilterState.from <= operationsFilterState.to;
   const revenueQuery: UseQueryResult<RevenueReport> = useQuery<RevenueReport>({
      queryKey: [
         'operations',
         'revenue',
         operationsFilterState.cinemaId,
         operationsFilterState.from,
         operationsFilterState.to,
      ],
      queryFn: () =>
         getRevenueReport(
            operationsFilterState.cinemaId ? Number(operationsFilterState.cinemaId) : undefined,
            operationsFilterState.from,
            operationsFilterState.to,
         ),
      enabled: isRangeValid,
      placeholderData: keepPreviousData,
   });
   const shiftReportQuery: UseQueryResult<ShiftReport> = useQuery<ShiftReport>({
      queryKey: ['operations', 'shift-report', viewedShiftId],
      queryFn: () => getOperationsShiftReport(viewedShiftId ?? 0),
      enabled: viewedShiftId !== null,
   });
   const revenueReport: RevenueReport | undefined = revenueQuery.data;
   const maxChannelAmount: number = Math.max(
      1,
      ...(revenueReport?.channels ?? []).map((revenueChannel: RevenueChannel) => revenueChannel.amount),
   );

   function renderChannel(revenueChannel: RevenueChannel): ReactElement {
      return (
         <li key={revenueChannel.channel} className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
               <span className="flex items-center gap-2 font-bold text-ink-900">
                  {REVENUE_CHANNEL_LABELS[revenueChannel.channel]}
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-700">
                     {revenueChannel.orderCount} đơn
                  </span>
               </span>
               <span className="font-extrabold text-ink-900">{formatVnd(revenueChannel.amount)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
               <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${Math.round((revenueChannel.amount / maxChannelAmount) * 100)}%` }}
               />
            </div>
         </li>
      );
   }

   function renderStaff(staffRevenue: StaffRevenue): ReactElement {
      return (
         <tr key={staffRevenue.staffUserId}>
            <td className="px-4 py-2.5 font-semibold text-ink-900">{staffRevenue.staffName}</td>
            <td className="px-4 py-2.5 text-right">{staffRevenue.orderCount}</td>
            <td className="px-4 py-2.5 text-right font-bold text-ink-900">{formatVnd(staffRevenue.amount)}</td>
         </tr>
      );
   }

   function renderShift(shift: Shift): ReactElement {
      const isViewed: boolean = viewedShiftId === shift.id;
      return (
         <tr key={shift.id}>
            <td className="whitespace-nowrap px-4 py-2.5">{formatInstant(shift.openedAt)}</td>
            <td className="px-4 py-2.5">{shift.staffName}</td>
            <td className="px-4 py-2.5">{shift.cinemaName}</td>
            <td className="px-4 py-2.5">
               <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-800">
                  {shift.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
               </span>
            </td>
            <td className="px-4 py-2.5 text-right font-bold text-ink-900">{formatVnd(shift.totalSales)}</td>
            <td className="px-4 py-2.5 text-right">
               {shift.cashDifference === null ? (
                  ''
               ) : (
                  <span
                     className={
                        shift.cashDifference === 0
                           ? 'rounded-md bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-800'
                           : 'rounded-md bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700'
                     }
                  >
                     {shift.cashDifference > 0 ? '+' : ''}
                     {formatVnd(shift.cashDifference)}
                  </span>
               )}
            </td>
            <td className="px-4 py-2.5 text-right">
               <Button size="sm" variant="secondary" onClick={() => setViewedShiftId(isViewed ? null : shift.id)}>
                  {isViewed ? 'Ẩn' : 'Chi tiết'}
               </Button>
            </td>
         </tr>
      );
   }

   return (
      <div className="space-y-5">
         <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink-900">Báo cáo doanh thu</h1>
            <p className="text-sm text-ink-500">
               Doanh thu theo kênh bán, theo nhân viên và theo ca. Đơn đã hoàn tiền không được tính.
            </p>
         </header>
         <OperationsFilterBar
            operationsFilterState={operationsFilterState}
            cinemaOptions={cinemaOptionsQuery.data ?? []}
            showStaffFilter={false}
            onChange={setOperationsFilterState}
         />
         {!isRangeValid && (
            <Alert variant="error">Khoảng ngày không hợp lệ, ngày bắt đầu phải trước ngày kết thúc.</Alert>
         )}
         {revenueQuery.isError && <Alert variant="error">{getErrorMessage(revenueQuery.error)}</Alert>}
         {revenueQuery.isPending && isRangeValid && <p className="text-sm text-ink-500">Đang tính doanh thu...</p>}
         {revenueReport && (
            <>
               <section className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl bg-white p-5 ring-1 ring-ink-100">
                  <div>
                     <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Tổng doanh thu</p>
                     <p className="text-3xl font-extrabold text-brand-700">{formatVnd(revenueReport.totalAmount)}</p>
                  </div>
                  <div>
                     <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Tổng số đơn</p>
                     <p className="text-3xl font-extrabold text-ink-900">{revenueReport.totalOrders}</p>
                  </div>
               </section>

               <section className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-ink-100">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-500">Theo kênh bán</h2>
                  <ul className="space-y-4">{revenueReport.channels.map(renderChannel)}</ul>
               </section>

               <section className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-500">Theo nhân viên quầy</h2>
                  {revenueReport.staff.length === 0 ? (
                     <p className="rounded-xl bg-white p-5 text-sm text-ink-500 ring-1 ring-ink-100">
                        Chưa có doanh thu bán tại quầy.
                     </p>
                  ) : (
                     <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-ink-100">
                        <table className="w-full text-sm">
                           <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                              <tr>
                                 <th className="px-4 py-2.5 font-semibold">Nhân viên</th>
                                 <th className="px-4 py-2.5 text-right font-semibold">Số đơn</th>
                                 <th className="px-4 py-2.5 text-right font-semibold">Doanh thu</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-ink-100">{revenueReport.staff.map(renderStaff)}</tbody>
                        </table>
                     </div>
                  )}
               </section>

               <section className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-500">Theo ca làm việc</h2>
                  {revenueReport.shifts.length === 0 ? (
                     <p className="rounded-xl bg-white p-5 text-sm text-ink-500 ring-1 ring-ink-100">
                        Không có ca nào được mở trong khoảng này.
                     </p>
                  ) : (
                     <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-ink-100">
                        <table className="w-full text-sm">
                           <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                              <tr>
                                 <th className="px-4 py-2.5 font-semibold">Mở ca</th>
                                 <th className="px-4 py-2.5 font-semibold">Nhân viên</th>
                                 <th className="px-4 py-2.5 font-semibold">Chi nhánh</th>
                                 <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                                 <th className="px-4 py-2.5 text-right font-semibold">Doanh thu ca</th>
                                 <th className="px-4 py-2.5 text-right font-semibold">Chênh lệch tiền mặt</th>
                                 <th className="px-4 py-2.5" />
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-ink-100">{revenueReport.shifts.map(renderShift)}</tbody>
                        </table>
                     </div>
                  )}
                  {viewedShiftId !== null && shiftReportQuery.data && (
                     <ShiftReportView shiftReport={shiftReportQuery.data} />
                  )}
               </section>
            </>
         )}
      </div>
   );
}

export default RevenueReportPage;
