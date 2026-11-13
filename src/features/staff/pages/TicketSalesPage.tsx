import {
   useMutation,
   useQuery,
   useQueryClient,
   type QueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { cancelPendingBooking, getPendingBooking } from '@/api/booking/bookingApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { pendingBookingKey } from '@/lib/booking/bookingQueryKeys';
import { getErrorMessage } from '@/lib/common/apiError';
import { cn } from '@/lib/common/utils';
import { formatClockRange } from '@/lib/common/vietnamTime';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import type { BookingDetail } from '@/types/booking/bookingDetail';
import type { CounterReceipt } from '@/types/staff/ticketSales';
import SalesFnbStep from '../components/SalesFnbStep';
import SalesPaymentStep from '../components/SalesPaymentStep';
import SalesReceipt from '../components/SalesReceipt';
import SalesSeatStep from '../components/SalesSeatStep';
import SalesShowtimeStep from '../components/SalesShowtimeStep';

type SalesStep = 'showtime' | 'seats' | 'fnb' | 'payment' | 'receipt';

interface StepLabel {
   step: Exclude<SalesStep, 'receipt'>;
   label: string;
}

const STEP_LABELS: StepLabel[] = [
   { step: 'showtime', label: 'Suất chiếu' },
   { step: 'seats', label: 'Chọn ghế' },
   { step: 'fnb', label: 'Bắp nước' },
   { step: 'payment', label: 'Thanh toán' },
];

export function TicketSalesPage(): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const cinemaId: number | null = staffBranchSelection.currentBranch?.cinemaId ?? null;
   const [step, setStep] = useState<SalesStep>('showtime');
   const [showtimeId, setShowtimeId] = useState<number | null>(null);
   const [counterReceipt, setCounterReceipt] = useState<CounterReceipt | null>(null);
   const pendingBookingQuery: UseQueryResult<BookingDetail | null> = useQuery<BookingDetail | null>({
      queryKey: pendingBookingKey(),
      queryFn: getPendingBooking,
      enabled: step === 'showtime',
      gcTime: 0,
   });
   const discardMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: cancelPendingBooking,
      onSuccess(): void {
         void queryClient.invalidateQueries({ queryKey: pendingBookingKey() });
      },
   });
   const pendingBooking: BookingDetail | null = pendingBookingQuery.data ?? null;
   const currentStepIndex: number = STEP_LABELS.findIndex((stepLabel) => stepLabel.step === step);

   function handleSelectShowtime(selectedShowtimeId: number): void {
      setShowtimeId(selectedShowtimeId);
      setStep('seats');
   }

   function handleResumePending(): void {
      if (pendingBooking !== null) {
         setShowtimeId(pendingBooking.showtime.showtimeId);
         setStep('seats');
      }
   }

   function handleDiscardPending(): void {
      discardMutation.mutate();
   }

   function handleChangeShowtime(): void {
      setShowtimeId(null);
      setStep('showtime');
   }

   function handlePaid(paidCounterReceipt: CounterReceipt): void {
      setCounterReceipt(paidCounterReceipt);
      setStep('receipt');
   }

   function handleNewSale(): void {
      setCounterReceipt(null);
      setShowtimeId(null);
      setStep('showtime');
   }

   function renderStepLabel(stepLabel: StepLabel, index: number): ReactElement {
      const isDone: boolean = index < currentStepIndex;
      const isCurrent: boolean = index === currentStepIndex;
      return (
         <li
            key={stepLabel.step}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
               'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold',
               isCurrent && 'bg-brand-600 text-white',
               isDone && 'bg-brand-100 text-brand-800',
               !isCurrent && !isDone && 'bg-ink-100 text-ink-500',
            )}
         >
            <span className="grid size-5 place-items-center rounded-full bg-white/30 text-xs">
               {isDone ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </span>
            {stepLabel.label}
         </li>
      );
   }

   function renderBody(workingCinemaId: number): ReactElement {
      if (step === 'receipt' && counterReceipt !== null) {
         return <SalesReceipt counterReceipt={counterReceipt} onNewSale={handleNewSale} />;
      }
      if (step === 'seats' && showtimeId !== null) {
         return (
            <SalesSeatStep
               showtimeId={showtimeId}
               onChangeShowtime={handleChangeShowtime}
               onContinue={() => setStep('fnb')}
            />
         );
      }
      if (step === 'fnb') {
         return <SalesFnbStep onBack={() => setStep('seats')} onContinue={() => setStep('payment')} />;
      }
      if (step === 'payment') {
         return <SalesPaymentStep cinemaId={workingCinemaId} onBack={() => setStep('fnb')} onPaid={handlePaid} />;
      }
      return (
         <div className="space-y-5">
            {pendingBooking !== null && (
               <Alert variant="info">
                  <span className="block font-bold">Có một đơn đang làm dở</span>
                  <span className="block">
                     {pendingBooking.showtime.movieTitle} ·{' '}
                     {formatClockRange(pendingBooking.showtime.startTime, pendingBooking.showtime.endTime)} ·{' '}
                     {pendingBooking.seats.length} ghế
                  </span>
                  <span className="mt-2 flex flex-wrap gap-2">
                     <Button size="sm" onClick={handleResumePending}>
                        Tiếp tục bán đơn này
                     </Button>
                     <Button
                        size="sm"
                        variant="secondary"
                        isLoading={discardMutation.isPending}
                        onClick={handleDiscardPending}
                     >
                        Hủy đơn, nhả ghế
                     </Button>
                  </span>
               </Alert>
            )}
            {discardMutation.isError && <Alert variant="error">{getErrorMessage(discardMutation.error)}</Alert>}
            <SalesShowtimeStep cinemaId={workingCinemaId} onSelectShowtime={handleSelectShowtime} />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <header className="space-y-1 print:hidden">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Bán vé</h1>
            <p className="text-sm text-ink-700">
               Chọn suất chiếu, chọn ghế, thêm bắp nước rồi thu tiền cho khách tại quầy.
            </p>
         </header>
         {step !== 'receipt' && (
            <ol className="flex flex-wrap gap-2 print:hidden" aria-label="Các bước bán vé">
               {STEP_LABELS.map(renderStepLabel)}
            </ol>
         )}
         {cinemaId === null ? (
            <Alert variant="error">
               {staffBranchSelection.isLoading
                  ? 'Đang tải chi nhánh làm việc...'
                  : 'Bạn chưa được gán chi nhánh nào để bán vé.'}
            </Alert>
         ) : (
            renderBody(cinemaId)
         )}
      </div>
   );
}

export default TicketSalesPage;
