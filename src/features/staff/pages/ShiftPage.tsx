import {
   useMutation,
   useQuery,
   useQueryClient,
   type QueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { closeShift, getCurrentShift, getMyShifts, getShiftReport, openShift } from '@/api/staff/shiftApi';
import ShiftReportView from '@/components/common/ShiftReportView';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextAreaField from '@/components/ui/TextAreaField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { parseValidMoneyInput } from '@/lib/common/moneyInput';
import { formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import { CURRENT_SHIFT_KEY, MY_SHIFTS_KEY, shiftReportKey } from '@/lib/staff/staffQueryKeys';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import type { CloseShiftRequest, OpenShiftRequest, Shift, ShiftReport } from '@/types/staff/shift';

const CURRENT_SHIFT_REFETCH_INTERVAL_MS: number = 15_000;

function formatShiftTime(isoInstant: string): string {
   return `${toVietnamTimeOfDay(isoInstant)} ${formatDisplayDate(toVietnamDate(isoInstant))}`;
}

export function ShiftPage(): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const cinemaId: number | null = staffBranchSelection.currentBranch?.cinemaId ?? null;
   const [openingCashInput, setOpeningCashInput] = useState<string>('');
   const [countedCashInput, setCountedCashInput] = useState<string>('');
   const [note, setNote] = useState<string>('');
   const [closedReport, setClosedReport] = useState<ShiftReport | null>(null);
   const [viewedShiftId, setViewedShiftId] = useState<number | null>(null);
   const currentShiftQuery: UseQueryResult<ShiftReport | null> = useQuery<ShiftReport | null>({
      queryKey: CURRENT_SHIFT_KEY,
      queryFn: getCurrentShift,
      refetchInterval: CURRENT_SHIFT_REFETCH_INTERVAL_MS,
   });
   const myShiftsQuery: UseQueryResult<Shift[]> = useQuery<Shift[]>({
      queryKey: MY_SHIFTS_KEY,
      queryFn: getMyShifts,
   });
   const viewedReportQuery: UseQueryResult<ShiftReport> = useQuery<ShiftReport>({
      queryKey: shiftReportKey(viewedShiftId ?? 0),
      queryFn: () => getShiftReport(viewedShiftId ?? 0),
      enabled: viewedShiftId !== null,
   });
   const openMutation: UseMutationResult<ShiftReport, unknown, OpenShiftRequest> = useMutation<
      ShiftReport,
      unknown,
      OpenShiftRequest
   >({
      mutationFn: openShift,
      onSuccess(): void {
         setOpeningCashInput('');
         setClosedReport(null);
         void queryClient.invalidateQueries({ queryKey: CURRENT_SHIFT_KEY });
         void queryClient.invalidateQueries({ queryKey: MY_SHIFTS_KEY });
      },
   });
   const closeMutation: UseMutationResult<ShiftReport, unknown, CloseShiftRequest> = useMutation<
      ShiftReport,
      unknown,
      CloseShiftRequest
   >({
      mutationFn: closeShift,
      onSuccess(shiftReport: ShiftReport): void {
         setClosedReport(shiftReport);
         setCountedCashInput('');
         setNote('');
         void queryClient.invalidateQueries({ queryKey: CURRENT_SHIFT_KEY });
         void queryClient.invalidateQueries({ queryKey: MY_SHIFTS_KEY });
      },
   });
   const currentShiftReport: ShiftReport | null = currentShiftQuery.data ?? null;
   const openingCash: number | null = parseValidMoneyInput(openingCashInput);
   const countedCash: number | null = parseValidMoneyInput(countedCashInput);
   const expectedCash: number = currentShiftReport?.shift.expectedCash ?? 0;
   const previewDifference: number | null = countedCash === null ? null : countedCash - expectedCash;

   function handleOpenShift(): void {
      if (cinemaId !== null && openingCash !== null) {
         openMutation.mutate({ cinemaId, openingCash });
      }
   }

   function handleCloseShift(): void {
      if (countedCash !== null) {
         const trimmedNote: string = note.trim();
         closeMutation.mutate({ countedCash, note: trimmedNote === '' ? undefined : trimmedNote });
      }
   }

   function handlePrint(): void {
      window.print();
   }

   function renderPastShift(shift: Shift): ReactElement {
      const isViewed: boolean = viewedShiftId === shift.id;
      return (
         <li key={shift.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
            <span className="font-bold text-ink-900">{formatShiftTime(shift.openedAt)}</span>
            <span className="text-ink-600">{shift.cinemaName}</span>
            <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-800">
               {shift.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
            </span>
            <span className="ml-auto font-bold text-ink-900">{formatVnd(shift.totalSales)}</span>
            {shift.cashDifference !== null && shift.cashDifference !== 0 && (
               <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">
                  Lệch {formatVnd(shift.cashDifference)}
               </span>
            )}
            <Button size="sm" variant="secondary" onClick={() => setViewedShiftId(isViewed ? null : shift.id)}>
               {isViewed ? 'Ẩn báo cáo' : 'Xem báo cáo'}
            </Button>
         </li>
      );
   }

   function renderOpenForm(): ReactElement {
      return (
         <section className="max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-700">Mở ca mới</h2>
            <TextField
               id="shift-opening-cash"
               label="Tiền đầu ca trong két"
               value={openingCashInput}
               onChange={setOpeningCashInput}
               placeholder="Nhập số tiền mặt hiện có"
               error={openingCashInput.trim() !== '' && openingCash === null ? 'Số tiền không hợp lệ' : undefined}
            />
            {openMutation.isError && <Alert variant="error">{getErrorMessage(openMutation.error)}</Alert>}
            <Button
               fullWidth
               className="h-12 text-base"
               disabled={cinemaId === null || openingCash === null}
               isLoading={openMutation.isPending}
               onClick={handleOpenShift}
            >
               Mở ca
            </Button>
         </section>
      );
   }

   function renderCloseForm(): ReactElement {
      return (
         <section className="space-y-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-700">Đóng ca</h2>
            <p className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3 text-sm font-bold text-ink-900">
               <span>Tiền mặt dự kiến trong két</span>
               <span className="text-lg font-extrabold">{formatVnd(expectedCash)}</span>
            </p>
            <TextField
               id="shift-counted-cash"
               label="Tiền mặt đếm được"
               value={countedCashInput}
               onChange={setCountedCashInput}
               placeholder="Đếm tiền trong két rồi nhập vào"
               error={countedCashInput.trim() !== '' && countedCash === null ? 'Số tiền không hợp lệ' : undefined}
            />
            {previewDifference !== null && (
               <p
                  className={
                     previewDifference === 0
                        ? 'rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800'
                        : 'rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700'
                  }
               >
                  {previewDifference === 0
                     ? 'Tiền mặt khớp với số liệu hệ thống.'
                     : `Chênh lệch ${previewDifference > 0 ? '+' : ''}${formatVnd(previewDifference)}. Nên ghi chú lý do.`}
               </p>
            )}
            <TextAreaField
               id="shift-note"
               label="Ghi chú cuối ca"
               value={note}
               onChange={setNote}
               rows={2}
               maxLength={500}
               optional
            />
            {closeMutation.isError && <Alert variant="error">{getErrorMessage(closeMutation.error)}</Alert>}
            <Button
               fullWidth
               className="h-12 text-base"
               disabled={countedCash === null}
               isLoading={closeMutation.isPending}
               onClick={handleCloseShift}
            >
               Xác nhận đóng ca
            </Button>
         </section>
      );
   }

   function renderBody(): ReactElement {
      if (closedReport !== null && currentShiftReport === null) {
         return (
            <div className="space-y-4">
               <Alert variant="success">Đã đóng ca. Báo cáo cuối ca được ghi lại, bạn có thể in để bàn giao.</Alert>
               <div id="counter-receipt-print">
                  <ShiftReportView shiftReport={closedReport} />
               </div>
               <div className="flex flex-wrap gap-3 print:hidden">
                  <Button icon={<Printer className="size-5" aria-hidden="true" />} onClick={handlePrint}>
                     In báo cáo cuối ca
                  </Button>
                  <Button variant="secondary" onClick={() => setClosedReport(null)}>
                     Mở ca mới
                  </Button>
               </div>
            </div>
         );
      }
      if (currentShiftReport === null) {
         return renderOpenForm();
      }
      return (
         <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <ShiftReportView shiftReport={currentShiftReport} />
            {renderCloseForm()}
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <header className="space-y-1 print:hidden">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Ca làm việc</h1>
            <p className="text-sm text-ink-700">
               Mở ca với tiền đầu ca, theo dõi thu tiền theo phương thức, đóng ca và đối soát tiền mặt.
            </p>
         </header>

         {currentShiftQuery.isError && <Alert variant="error">{getErrorMessage(currentShiftQuery.error)}</Alert>}
         {currentShiftQuery.isPending ? <p className="text-sm text-ink-500">Đang tải ca làm việc...</p> : renderBody()}

         <section className="space-y-3 print:hidden">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-500">Các ca gần đây của tôi</h2>
            {myShiftsQuery.data !== undefined && myShiftsQuery.data.length === 0 && (
               <p className="text-sm text-ink-500">Bạn chưa mở ca nào.</p>
            )}
            {myShiftsQuery.data !== undefined && myShiftsQuery.data.length > 0 && (
               <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100">
                  {myShiftsQuery.data.map(renderPastShift)}
               </ul>
            )}
            {viewedShiftId !== null && viewedReportQuery.data !== undefined && (
               <ShiftReportView shiftReport={viewedReportQuery.data} />
            )}
         </section>
      </div>
   );
}

export default ShiftPage;
