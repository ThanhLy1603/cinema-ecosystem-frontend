import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { CopyPlus, Check, Eye, X } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { copyShowtimeDay, duplicateShowtime } from '@/api/showtimeApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import {
   addDaysToDate,
   formatDisplayDate,
   getWeekdayLabel,
   toVietnamDate,
   toVietnamTimeOfDay,
   todayInVietnam,
} from '@/lib/common/vietnamTime';
import { cn } from '@/lib/common/utils';
import type { Hall } from '@/types/cinema/cinema';
import type { BulkShowtimeResult, Showtime } from '@/types/showtime/showtime';
import { ALL_WEEKDAYS, expandDates, validateDateRepeat, type DateRepeatValue } from '../utils/dateRepeat';
import BulkResultList from './BulkResultList';
import DateRepeatPicker from './DateRepeatPicker';

export type BulkPanelState =
   | { mode: 'duplicate'; showtime: Showtime }
   | { mode: 'copyDay'; cinemaId: number; sourceDate: string; sourceShowtimeCount: number };

interface BulkShowtimePanelProps {
   panelState: BulkPanelState;
   halls: Hall[];
   onChanged: () => void;
   onClose: () => void;
}

interface BulkRunVariables {
   dryRun: boolean;
   dates: string[];
}

function buildInitialRepeatValue(panelState: BulkPanelState): DateRepeatValue {
   const startDate: string =
      panelState.mode === 'duplicate'
         ? addDaysToDate(toVietnamDate(panelState.showtime.startTime), 1)
         : addDaysToDate(panelState.sourceDate, 1);
   const firstFutureDate: string = startDate < todayInVietnam() ? todayInVietnam() : startDate;
   return { fromDate: firstFutureDate, toDate: firstFutureDate, weekdays: ALL_WEEKDAYS };
}

export function BulkShowtimePanel({ panelState, halls, onChanged, onClose }: BulkShowtimePanelProps): ReactElement {
   const [dateRepeatValue, setDateRepeatValue] = useState<DateRepeatValue>(() => buildInitialRepeatValue(panelState));
   const [selectedHallIds, setSelectedHallIds] = useState<number[]>(() =>
      panelState.mode === 'duplicate' ? [panelState.showtime.hallId] : [],
   );
   const [bulkShowtimeResult, setBulkShowtimeResult] = useState<BulkShowtimeResult | null>(null);
   const excludedDate: string | null = panelState.mode === 'copyDay' ? panelState.sourceDate : null;
   const dates: string[] = expandDates(dateRepeatValue, excludedDate);
   const dateError: string | undefined = validateDateRepeat(dateRepeatValue, dates);
   const hallError: string | undefined =
      panelState.mode === 'duplicate' && selectedHallIds.length === 0 ? 'Vui lòng chọn ít nhất một phòng' : undefined;
   const canRun: boolean = dateError === undefined && hallError === undefined;
   const isFinished: boolean = bulkShowtimeResult !== null && !bulkShowtimeResult.dryRun;

   const runMutation: UseMutationResult<BulkShowtimeResult, unknown, BulkRunVariables> = useMutation<
      BulkShowtimeResult,
      unknown,
      BulkRunVariables
   >({
      mutationFn: runBulk,
      onSuccess: handleRunSuccess,
   });

   function runBulk(bulkRunVariables: BulkRunVariables): Promise<BulkShowtimeResult> {
      if (panelState.mode === 'duplicate') {
         return duplicateShowtime({
            sourceShowtimeId: panelState.showtime.id,
            hallIds: selectedHallIds,
            dates: bulkRunVariables.dates,
            dryRun: bulkRunVariables.dryRun,
         });
      }
      return copyShowtimeDay({
         cinemaId: panelState.cinemaId,
         sourceDate: panelState.sourceDate,
         targetDates: bulkRunVariables.dates,
         dryRun: bulkRunVariables.dryRun,
      });
   }

   function handleRunSuccess(result: BulkShowtimeResult): void {
      setBulkShowtimeResult(result);
      if (!result.dryRun) {
         onChanged();
      }
   }

   function closeOnEscape(): () => void {
      function handleKeyDown(keyboardEvent: KeyboardEvent): void {
         if (keyboardEvent.key === 'Escape') {
            onClose();
         }
      }
      window.addEventListener('keydown', handleKeyDown);
      return (): void => window.removeEventListener('keydown', handleKeyDown);
   }
   useEffect(closeOnEscape, [onClose]);

   function changeRepeatValue(nextDateRepeatValue: DateRepeatValue): void {
      setDateRepeatValue(nextDateRepeatValue);
      setBulkShowtimeResult(null);
      runMutation.reset();
   }

   function toggleHall(hallId: number): void {
      setSelectedHallIds(
         selectedHallIds.includes(hallId)
            ? selectedHallIds.filter((selectedHallId) => selectedHallId !== hallId)
            : [...selectedHallIds, hallId],
      );
      setBulkShowtimeResult(null);
      runMutation.reset();
   }

   function renderSourceSummary(): ReactElement {
      if (panelState.mode === 'duplicate') {
         const sourceShowtime: Showtime = panelState.showtime;
         return (
            <p className="text-sm text-ink-700">
               Nhân bản suất <strong>{sourceShowtime.movieTitle}</strong> lúc{' '}
               <strong>{toVietnamTimeOfDay(sourceShowtime.startTime)}</strong> ({sourceShowtime.hallName}, ngày{' '}
               {formatDisplayDate(toVietnamDate(sourceShowtime.startTime))}) sang các phòng và ngày bên dưới. Giờ chiếu
               và giá gốc được giữ nguyên.
            </p>
         );
      }
      return (
         <p className="text-sm text-ink-700">
            Sao chép toàn bộ <strong>{panelState.sourceShowtimeCount} suất chiếu</strong> của{' '}
            <strong>
               {getWeekdayLabel(panelState.sourceDate)}, {formatDisplayDate(panelState.sourceDate)}
            </strong>{' '}
            sang các ngày bên dưới. Mỗi suất giữ nguyên phòng, giờ chiếu và giá gốc.
         </p>
      );
   }

   return (
      <div className="fixed inset-0 z-50 flex justify-end">
         <button
            type="button"
            aria-label="Đóng biểu mẫu"
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/30 backdrop-blur-xs"
         />
         <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-showtime-title"
            className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-soft"
         >
            <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
               <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                     <CopyPlus className="size-5" aria-hidden="true" />
                  </span>
                  <h2 id="bulk-showtime-title" className="text-[15px] font-semibold text-ink-900">
                     {panelState.mode === 'duplicate' ? 'Nhân bản / lặp lại suất chiếu' : 'Sao chép lịch cả ngày'}
                  </h2>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="grid size-9 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
               >
                  <X className="size-5" aria-hidden="true" />
               </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
               {renderSourceSummary()}

               {panelState.mode === 'duplicate' && (
                  <fieldset className="space-y-2" disabled={isFinished}>
                     <legend className="text-sm font-semibold text-ink-800">Phòng chiếu đích</legend>
                     <div className="grid gap-2 sm:grid-cols-2">
                        {halls.map((hall) => (
                           <label
                              key={hall.id}
                              className={cn(
                                 'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                                 selectedHallIds.includes(hall.id)
                                    ? 'border-brand-400 bg-brand-50'
                                    : 'border-ink-200 bg-white hover:border-brand-300',
                                 hall.status !== 'ACTIVE' && 'cursor-not-allowed opacity-50',
                              )}
                           >
                              <input
                                 type="checkbox"
                                 checked={selectedHallIds.includes(hall.id)}
                                 disabled={hall.status !== 'ACTIVE'}
                                 onChange={() => toggleHall(hall.id)}
                                 className="size-4 accent-brand-600"
                              />
                              <span className="font-semibold text-ink-900">{hall.name}</span>
                              <span className="ml-auto text-xs text-ink-500">
                                 {hall.status === 'ACTIVE' ? hall.screenType : 'Bảo trì'}
                              </span>
                           </label>
                        ))}
                     </div>
                     {hallError && (
                        <p role="alert" className="text-[13px] font-medium text-danger-700">
                           {hallError}
                        </p>
                     )}
                  </fieldset>
               )}

               <fieldset disabled={isFinished}>
                  <legend className="mb-2 text-sm font-semibold text-ink-800">Ngày đích</legend>
                  <DateRepeatPicker
                     idPrefix="bulk-showtime"
                     dateRepeatValue={dateRepeatValue}
                     dates={dates}
                     error={dateError}
                     onChange={changeRepeatValue}
                  />
               </fieldset>

               {runMutation.isError && <Alert variant="error">{getErrorMessage(runMutation.error)}</Alert>}
               {bulkShowtimeResult && bulkShowtimeResult.totalCount === 0 && (
                  <Alert variant="info">Ngày nguồn chưa có suất chiếu nào để sao chép.</Alert>
               )}
               {bulkShowtimeResult && bulkShowtimeResult.totalCount > 0 && (
                  <BulkResultList bulkShowtimeResult={bulkShowtimeResult} />
               )}
               {isFinished && bulkShowtimeResult && bulkShowtimeResult.acceptedCount > 0 && (
                  <Alert variant="success">
                     Đã tạo {bulkShowtimeResult.acceptedCount} suất chiếu.
                     {bulkShowtimeResult.totalCount > bulkShowtimeResult.acceptedCount &&
                        ' Các suất trùng giờ hoặc không hợp lệ đã được bỏ qua.'}
                  </Alert>
               )}
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 px-6 py-4">
               <Button variant="ghost" onClick={onClose}>
                  {isFinished ? 'Đóng' : 'Hủy'}
               </Button>
               {!isFinished && (
                  <Button
                     variant="secondary"
                     disabled={!canRun}
                     isLoading={runMutation.isPending && runMutation.variables?.dryRun === true}
                     icon={<Eye className="size-4" aria-hidden="true" />}
                     onClick={() => runMutation.mutate({ dryRun: true, dates })}
                  >
                     Xem trước
                  </Button>
               )}
               {!isFinished && bulkShowtimeResult?.dryRun === true && bulkShowtimeResult.acceptedCount > 0 && (
                  <Button
                     disabled={!canRun}
                     isLoading={runMutation.isPending && runMutation.variables?.dryRun === false}
                     icon={<Check className="size-4" aria-hidden="true" />}
                     onClick={() => runMutation.mutate({ dryRun: false, dates })}
                  >
                     Tạo {bulkShowtimeResult.acceptedCount} suất
                  </Button>
               )}
            </footer>
         </section>
      </div>
   );
}

export default BulkShowtimePanel;
