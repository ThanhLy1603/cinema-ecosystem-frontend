import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { FlaskConical } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { useNavigate, useSearchParams, type NavigateFunction } from 'react-router-dom';
import { simulateGatewayCallback } from '@/api/payment/paymentApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PAYMENT_RESULT_PATH } from '@/lib/booking/bookingPaths';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import type { GatewayCallbackResult, SimulatedPaymentOutcome } from '@/types/payment/payment';

const VNPAY_AMOUNT_FACTOR: number = 100;

interface CallbackLogEntry {
   outcome: SimulatedPaymentOutcome;
   gatewayCallbackResult: GatewayCallbackResult;
}

export function PaymentSimulatorPage(): ReactElement {
   const [searchParams] = useSearchParams();
   const navigate: NavigateFunction = useNavigate();
   const transactionRef: string = searchParams.get('vnp_TxnRef') ?? '';
   const amount: number = Number(searchParams.get('vnp_Amount') ?? '0') / VNPAY_AMOUNT_FACTOR;
   const orderInfo: string = searchParams.get('vnp_OrderInfo') ?? '';
   const [callbackLogEntries, setCallbackLogEntries] = useState<CallbackLogEntry[]>([]);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const callbackMutation: UseMutationResult<GatewayCallbackResult, unknown, SimulatedPaymentOutcome> = useMutation<
      GatewayCallbackResult,
      unknown,
      SimulatedPaymentOutcome
   >({
      mutationFn: (outcome: SimulatedPaymentOutcome) => simulateGatewayCallback({ transactionRef, outcome }),
      onError(error: unknown): void {
         setErrorMessage(getErrorMessage(error));
      },
   });

   function goToResult(responseCode: string): void {
      navigate(
         `${PAYMENT_RESULT_PATH}?vnp_TxnRef=${encodeURIComponent(transactionRef)}&vnp_ResponseCode=${responseCode}`,
      );
   }

   function handleComplete(outcome: SimulatedPaymentOutcome): void {
      setErrorMessage(null);
      callbackMutation.mutate(outcome, {
         onSuccess(): void {
            goToResult(outcome === 'SUCCESS' ? '00' : '24');
         },
      });
   }

   function handleResend(): void {
      setErrorMessage(null);
      callbackMutation.mutate('SUCCESS', {
         onSuccess(gatewayCallbackResult: GatewayCallbackResult): void {
            setCallbackLogEntries((previousCallbackLogEntries) => [
               ...previousCallbackLogEntries,
               { outcome: 'SUCCESS', gatewayCallbackResult },
            ]);
         },
      });
   }

   function handleCancel(): void {
      goToResult('24');
   }

   function handleSuccessClick(): void {
      handleComplete('SUCCESS');
   }

   function handleFailureClick(): void {
      handleComplete('FAILED');
   }

   if (transactionRef === '') {
      return (
         <section className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
            <Alert variant="error">Thiếu mã giao dịch.</Alert>
         </section>
      );
   }

   return (
      <section className="mx-auto w-full max-w-xl space-y-5 px-4 py-12 sm:px-6">
         <div className="space-y-5 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/50 p-6">
            <div className="flex items-center gap-3">
               <FlaskConical className="size-8 text-amber-600" aria-hidden="true" />
               <div>
                  <h1 className="text-xl font-extrabold text-ink-900">Cổng thanh toán giả lập</h1>
                  <p className="text-sm text-ink-600">Chỉ dùng để thử nghiệm, không có tiền thật được chuyển.</p>
               </div>
            </div>
            <dl className="space-y-2 rounded-xl bg-white p-4 text-sm">
               <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Mã giao dịch</dt>
                  <dd className="break-all font-semibold text-ink-900">{transactionRef}</dd>
               </div>
               <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Nội dung</dt>
                  <dd className="text-right text-ink-900">{orderInfo}</dd>
               </div>
               <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Số tiền</dt>
                  <dd className="text-lg font-extrabold text-brand-700">{formatVnd(amount)}</dd>
               </div>
            </dl>
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <div className="grid gap-3 sm:grid-cols-2">
               <Button isLoading={callbackMutation.isPending} onClick={handleSuccessClick}>
                  Thanh toán thành công
               </Button>
               <Button variant="secondary" disabled={callbackMutation.isPending} onClick={handleFailureClick}>
                  Giao dịch thất bại
               </Button>
            </div>
            <Button variant="ghost" fullWidth disabled={callbackMutation.isPending} onClick={handleCancel}>
               Hủy và quay lại
            </Button>
         </div>
         <div className="space-y-3 rounded-2xl border border-ink-200 bg-white p-5 text-sm">
            <h2 className="font-bold text-ink-900">Kiểm thử webhook idempotent</h2>
            <p className="text-ink-600">
               Gửi lại IPN thành công nhiều lần: hệ thống phải trả 00 mỗi lần nhưng chỉ phát vé và cộng điểm một lần.
            </p>
            <Button variant="secondary" size="sm" disabled={callbackMutation.isPending} onClick={handleResend}>
               Gửi lại IPN thành công
            </Button>
            {callbackLogEntries.length > 0 && (
               <ul className="space-y-1 font-mono text-xs text-ink-700">
                  {callbackLogEntries.map((callbackLogEntry, index) => (
                     <li key={index}>
                        #{index + 1} {callbackLogEntry.outcome} → RspCode{' '}
                        {callbackLogEntry.gatewayCallbackResult.RspCode} ·{' '}
                        {callbackLogEntry.gatewayCallbackResult.Message}
                     </li>
                  ))}
               </ul>
            )}
         </div>
      </section>
   );
}

export default PaymentSimulatorPage;
