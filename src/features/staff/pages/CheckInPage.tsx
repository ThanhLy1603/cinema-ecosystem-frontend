import {
   useMutation,
   useQuery,
   useQueryClient,
   type QueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import { confirmCheckIn, getCheckInHistory, getCheckInQueue, scanTicket, undoCheckIn } from '@/api/staff/checkInApi';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { checkInHistoryKey, checkInQueueKey } from '@/lib/staff/staffQueryKeys';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth/auth';
import type {
   TicketCheckInRequest,
   TicketQueue,
   TicketScanLog,
   TicketScanRequest,
   TicketScanResponse,
   TicketUndoRequest,
} from '@/types/staff/checkIn';
import CheckInHistoryList from '../components/CheckInHistoryList';
import CheckInQueueList from '../components/CheckInQueueList';
import CheckInResultCard from '../components/CheckInResultCard';
import QrScannerPanel from '../components/QrScannerPanel';
import { useQrScanner } from '../hooks/useQrScanner';
import { CHECK_IN_RESULT_STYLES } from '../utils/checkInLabels';
import { playResultTone } from '../utils/resultTone';

const QUEUE_REFRESH_INTERVAL_MILLISECONDS: number = 15000;

export function CheckInPage(): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const user: User | null = useAuthStore((authState) => authState.user);
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const cinemaId: number | null = staffBranchSelection.currentBranch?.cinemaId ?? null;
   const canUndo: boolean = Boolean(user?.roles.includes('ROLE_MANAGER') || user?.roles.includes('ROLE_ADMIN'));
   const [manualCode, setManualCode] = useState<string>('');
   const [activeCode, setActiveCode] = useState<string>('');
   const [scanResponse, setScanResponse] = useState<TicketScanResponse | null>(null);
   const inputContainerRef = useRef<HTMLDivElement>(null);

   const historyQuery: UseQueryResult<TicketScanLog[]> = useQuery<TicketScanLog[]>({
      queryKey: checkInHistoryKey(cinemaId ?? 0),
      queryFn: () => getCheckInHistory(cinemaId ?? 0),
      enabled: cinemaId !== null,
   });

   const queueQuery: UseQueryResult<TicketQueue> = useQuery<TicketQueue>({
      queryKey: checkInQueueKey(cinemaId ?? 0),
      queryFn: () => getCheckInQueue(cinemaId ?? 0),
      enabled: cinemaId !== null,
      refetchInterval: QUEUE_REFRESH_INTERVAL_MILLISECONDS,
   });

   function focusCodeInput(): void {
      inputContainerRef.current?.querySelector('input')?.focus();
   }

   function handleResult(ticketScanResponse: TicketScanResponse): void {
      setScanResponse(ticketScanResponse);
      playResultTone(CHECK_IN_RESULT_STYLES[ticketScanResponse.resultCode].tone);
      void queryClient.invalidateQueries({ queryKey: checkInHistoryKey(cinemaId ?? 0) });
      void queryClient.invalidateQueries({ queryKey: checkInQueueKey(cinemaId ?? 0) });
   }

   const scanMutation: UseMutationResult<TicketScanResponse, unknown, TicketScanRequest> = useMutation<
      TicketScanResponse,
      unknown,
      TicketScanRequest
   >({
      mutationFn: scanTicket,
      onSuccess: handleResult,
   });
   const confirmMutation: UseMutationResult<TicketScanResponse, unknown, TicketCheckInRequest> = useMutation<
      TicketScanResponse,
      unknown,
      TicketCheckInRequest
   >({
      mutationFn: confirmCheckIn,
      onSuccess: handleResult,
   });
   const undoMutation: UseMutationResult<TicketScanResponse, unknown, TicketUndoRequest> = useMutation<
      TicketScanResponse,
      unknown,
      TicketUndoRequest
   >({
      mutationFn: undoCheckIn,
      onSuccess: handleResult,
   });
   const isBusy: boolean = scanMutation.isPending || confirmMutation.isPending || undoMutation.isPending;
   const errorSource: unknown = scanMutation.error ?? confirmMutation.error ?? undoMutation.error;

   const runScan: (code: string) => void = useCallback(
      (code: string): void => {
         const trimmedCode: string = code.trim();
         if (trimmedCode === '' || cinemaId === null || scanMutation.isPending) {
            return;
         }
         setActiveCode(trimmedCode);
         setManualCode('');
         scanMutation.mutate({ code: trimmedCode, cinemaId });
      },
      [cinemaId, scanMutation],
   );

   const { videoRef, isActive: isCameraActive, errorMessage: cameraErrorMessage, start, stop } = useQrScanner(runScan);

   function handleStartCamera(): void {
      void start();
   }

   function handleManualSubmit(): void {
      runScan(manualCode);
   }

   function handleConfirm(ticketIds: number[] | undefined): void {
      if (cinemaId === null) {
         return;
      }
      confirmMutation.mutate({ code: activeCode, cinemaId, ticketIds });
   }

   function handleUndo(ticketId: number): void {
      if (cinemaId === null || !window.confirm('Hoàn tác xác nhận vào rạp của ghế này?')) {
         return;
      }
      undoMutation.mutate({ code: activeCode, cinemaId, ticketIds: [ticketId] });
   }

   function handleReset(): void {
      setScanResponse(null);
      setActiveCode('');
      scanMutation.reset();
      confirmMutation.reset();
      undoMutation.reset();
      window.setTimeout(focusCodeInput, 0);
   }

   return (
      <div className="space-y-8">
         <header className="space-y-1">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Soát vé</h1>
            <p className="text-sm text-ink-700">
               Quét mã QR trên vé của khách, nhập mã đơn hoặc dùng máy quét mã vạch để cho khách vào phòng chiếu.
            </p>
         </header>

         <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <QrScannerPanel
               videoRef={videoRef}
               isCameraActive={isCameraActive}
               cameraErrorMessage={cameraErrorMessage}
               onStartCamera={handleStartCamera}
               onStopCamera={stop}
               manualCode={manualCode}
               isBusy={isBusy}
               inputContainerRef={inputContainerRef}
               onManualCodeChange={setManualCode}
               onManualSubmit={handleManualSubmit}
            />

            <div className="space-y-4">
               {errorSource !== null && errorSource !== undefined && (
                  <Alert variant="error">{getErrorMessage(errorSource)}</Alert>
               )}
               {scanResponse ? (
                  <CheckInResultCard
                     key={`${scanResponse.booking?.bookingId ?? 'none'}-${scanResponse.resultCode}-${scanResponse.pendingTicketCount}`}
                     scanResponse={scanResponse}
                     canUndo={canUndo}
                     isBusy={isBusy}
                     onConfirm={handleConfirm}
                     onUndo={handleUndo}
                     onReset={handleReset}
                  />
               ) : (
                  <div className="grid min-h-64 place-items-center rounded-2xl border-2 border-dashed border-ink-300 bg-white/60 p-8 text-center text-sm text-ink-600">
                     {isBusy
                        ? 'Đang kiểm tra vé...'
                        : 'Quét hoặc nhập mã vé để xem thông tin và xác nhận cho khách vào rạp.'}
                  </div>
               )}
            </div>
         </div>

         <section aria-labelledby="check-in-queue-heading" className="space-y-3">
            <h2 id="check-in-queue-heading" className="text-sm font-extrabold uppercase tracking-wider text-ink-500">
               Vé chờ soát trong 24 giờ tới
            </h2>
            <CheckInQueueList
               ticketQueueShowtimeGroups={queueQuery.data?.showtimes ?? []}
               isLoading={queueQuery.isPending && cinemaId !== null}
               isBusy={isBusy}
               onSelectBooking={runScan}
            />
         </section>

         <section aria-labelledby="check-in-history-heading" className="space-y-3">
            <h2 id="check-in-history-heading" className="text-sm font-extrabold uppercase tracking-wider text-ink-500">
               Lịch sử xác nhận vào rạp gần đây
            </h2>
            <CheckInHistoryList
               ticketScanLogs={historyQuery.data ?? []}
               isLoading={historyQuery.isPending && cinemaId !== null}
            />
         </section>
      </div>
   );
}

export default CheckInPage;
