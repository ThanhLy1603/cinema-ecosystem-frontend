import {
   useMutation,
   useQuery,
   useQueryClient,
   type QueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import { deliverFnbPickup, getFnbPickupHistory, getFnbPickupQueue, scanFnbPickup } from '@/api/staff/fnbPickupApi';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { fnbPickupHistoryKey, fnbPickupQueueKey } from '@/lib/staff/staffQueryKeys';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import type {
   FnbDeliveryLog,
   FnbPickupDeliverLineRequest,
   FnbPickupDeliverRequest,
   FnbPickupQueue,
   FnbPickupScanRequest,
   FnbPickupScanResponse,
} from '@/types/staff/fnbPickup';
import FnbPickupHistoryList from '../components/FnbPickupHistoryList';
import FnbPickupQueueList from '../components/FnbPickupQueueList';
import FnbPickupResultCard from '../components/FnbPickupResultCard';
import QrScannerPanel from '../components/QrScannerPanel';
import { useQrScanner } from '../hooks/useQrScanner';
import { FNB_PICKUP_RESULT_STYLES } from '../utils/fnbPickupLabels';
import { playResultTone } from '../utils/resultTone';

const QUEUE_REFRESH_INTERVAL_MILLISECONDS: number = 15000;

export function FnbPickupPage(): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const cinemaId: number | null = staffBranchSelection.currentBranch?.cinemaId ?? null;
   const [manualCode, setManualCode] = useState<string>('');
   const [activeCode, setActiveCode] = useState<string>('');
   const [scanResponse, setScanResponse] = useState<FnbPickupScanResponse | null>(null);
   const inputContainerRef = useRef<HTMLDivElement>(null);

   const queueQuery: UseQueryResult<FnbPickupQueue> = useQuery<FnbPickupQueue>({
      queryKey: fnbPickupQueueKey(cinemaId ?? 0),
      queryFn: () => getFnbPickupQueue(cinemaId ?? 0),
      enabled: cinemaId !== null,
      refetchInterval: QUEUE_REFRESH_INTERVAL_MILLISECONDS,
   });

   const historyQuery: UseQueryResult<FnbDeliveryLog[]> = useQuery<FnbDeliveryLog[]>({
      queryKey: fnbPickupHistoryKey(cinemaId ?? 0),
      queryFn: () => getFnbPickupHistory(cinemaId ?? 0),
      enabled: cinemaId !== null,
   });

   function focusCodeInput(): void {
      inputContainerRef.current?.querySelector('input')?.focus();
   }

   function handleResult(fnbPickupScanResponse: FnbPickupScanResponse): void {
      setScanResponse(fnbPickupScanResponse);
      playResultTone(FNB_PICKUP_RESULT_STYLES[fnbPickupScanResponse.resultCode].tone);
      void queryClient.invalidateQueries({ queryKey: fnbPickupQueueKey(cinemaId ?? 0) });
      void queryClient.invalidateQueries({ queryKey: fnbPickupHistoryKey(cinemaId ?? 0) });
   }

   const scanMutation: UseMutationResult<FnbPickupScanResponse, unknown, FnbPickupScanRequest> = useMutation<
      FnbPickupScanResponse,
      unknown,
      FnbPickupScanRequest
   >({
      mutationFn: scanFnbPickup,
      onSuccess: handleResult,
   });
   const deliverMutation: UseMutationResult<FnbPickupScanResponse, unknown, FnbPickupDeliverRequest> = useMutation<
      FnbPickupScanResponse,
      unknown,
      FnbPickupDeliverRequest
   >({
      mutationFn: deliverFnbPickup,
      onSuccess: handleResult,
      onError: handleDeliverError,
   });
   const isBusy: boolean = scanMutation.isPending || deliverMutation.isPending;
   const errorSource: unknown = scanMutation.error ?? deliverMutation.error;

   function handleDeliverError(): void {
      void queryClient.invalidateQueries({ queryKey: fnbPickupQueueKey(cinemaId ?? 0) });
   }

   const runScan: (code: string) => void = useCallback(
      (code: string): void => {
         const trimmedCode: string = code.trim();
         if (trimmedCode === '' || cinemaId === null || scanMutation.isPending) {
            return;
         }
         setActiveCode(trimmedCode);
         setManualCode('');
         deliverMutation.reset();
         scanMutation.mutate({ code: trimmedCode, cinemaId });
      },
      [cinemaId, scanMutation, deliverMutation],
   );

   const { videoRef, isActive: isCameraActive, errorMessage: cameraErrorMessage, start, stop } = useQrScanner(runScan);

   function handleStartCamera(): void {
      void start();
   }

   function handleManualSubmit(): void {
      runScan(manualCode);
   }

   function handleDeliver(fnbPickupDeliverLineRequests: FnbPickupDeliverLineRequest[]): void {
      if (cinemaId === null) {
         return;
      }
      deliverMutation.mutate({ code: activeCode, cinemaId, lines: fnbPickupDeliverLineRequests });
   }

   function handleRescanAfterError(): void {
      if (activeCode !== '') {
         runScan(activeCode);
      }
   }

   function handleReset(): void {
      setScanResponse(null);
      setActiveCode('');
      scanMutation.reset();
      deliverMutation.reset();
      window.setTimeout(focusCodeInput, 0);
   }

   return (
      <div className="space-y-8">
         <header className="space-y-1">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Giao bắp nước</h1>
            <p className="text-sm text-ink-700">
               Quét cùng mã QR trên vé của khách để xem combo và món đã đặt, rồi xác nhận giao toàn bộ hoặc từng phần.
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
                  <Alert variant="error">
                     {getErrorMessage(errorSource)}{' '}
                     {deliverMutation.error !== null && (
                        <button type="button" onClick={handleRescanAfterError} className="font-bold underline">
                           Quét lại đơn
                        </button>
                     )}
                  </Alert>
               )}
               {scanResponse ? (
                  <FnbPickupResultCard
                     key={`${scanResponse.booking?.bookingId ?? 'none'}-${scanResponse.resultCode}-${scanResponse.booking?.remainingQuantity ?? 0}`}
                     scanResponse={scanResponse}
                     isBusy={isBusy}
                     onDeliver={handleDeliver}
                     onReset={handleReset}
                  />
               ) : (
                  <div className="grid min-h-64 place-items-center rounded-2xl border-2 border-dashed border-ink-300 bg-white/60 p-8 text-center text-sm text-ink-600">
                     {isBusy
                        ? 'Đang kiểm tra đơn...'
                        : 'Quét hoặc nhập mã vé, hoặc chọn một đơn trong danh sách bên dưới để giao bắp nước.'}
                  </div>
               )}
            </div>
         </div>

         <section aria-labelledby="fnb-pickup-queue-heading" className="space-y-3">
            <h2 id="fnb-pickup-queue-heading" className="text-sm font-extrabold uppercase tracking-wider text-ink-500">
               Đơn chờ giao theo suất chiếu
            </h2>
            <FnbPickupQueueList
               fnbPickupShowtimeGroups={queueQuery.data?.showtimes ?? []}
               isLoading={queueQuery.isPending && cinemaId !== null}
               isBusy={isBusy}
               onSelectBooking={runScan}
            />
         </section>

         <section aria-labelledby="fnb-pickup-history-heading" className="space-y-3">
            <h2
               id="fnb-pickup-history-heading"
               className="text-sm font-extrabold uppercase tracking-wider text-ink-500"
            >
               Lịch sử giao gần đây
            </h2>
            <FnbPickupHistoryList
               fnbDeliveryLogs={historyQuery.data ?? []}
               isLoading={historyQuery.isPending && cinemaId !== null}
            />
         </section>
      </div>
   );
}

export default FnbPickupPage;
