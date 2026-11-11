import { useQuery, useQueryClient, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { CheckCircle2, CircleAlert, CircleX, LoaderCircle } from 'lucide-react';
import { useEffect, type ReactElement } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPendingBooking } from '@/api/bookingApi';
import { getPaymentResult } from '@/api/paymentApi';
import Alert from '@/components/ui/Alert';
import LinkButton from '@/components/ui/LinkButton';
import { getPaymentPath, MY_TICKETS_PATH } from '@/lib/booking/bookingPaths';
import { paymentResultKey, pendingBookingKey } from '@/lib/booking/bookingQueryKeys';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { useBookingStore } from '@/stores/useBookingStore';
import type { BookingDetail } from '@/types/booking/bookingDetail';
import type { PaymentResult } from '@/types/payment/payment';

const POLL_INTERVAL_MILLISECONDS: number = 2000;
const MAX_POLL_ATTEMPTS: number = 10;

type ResultView = 'CONFIRMING' | 'PAID' | 'REFUND_REQUIRED' | 'FAILED';

function resolveResultView(paymentResult: PaymentResult): ResultView {
   if (paymentResult.paymentStatus === 'FAILED') {
      return 'FAILED';
   }
   if (paymentResult.paymentStatus === 'SUCCESS') {
      return paymentResult.bookingStatus === 'REFUND_REQUIRED' ? 'REFUND_REQUIRED' : 'PAID';
   }
   return 'CONFIRMING';
}

export function PaymentResultPage(): ReactElement {
   const [searchParams] = useSearchParams();
   const transactionRef: string = searchParams.get('vnp_TxnRef') ?? searchParams.get('txnRef') ?? '';
   const queryClient: QueryClient = useQueryClient();
   const clearBooking: () => void = useBookingStore((bookingState) => bookingState.clearBooking);
   const paymentResultQuery: UseQueryResult<PaymentResult> = useQuery<PaymentResult>({
      queryKey: paymentResultKey(transactionRef),
      queryFn: () => getPaymentResult(transactionRef),
      enabled: transactionRef !== '',
      retry: false,
      staleTime: 0,
      refetchInterval: (query) =>
         query.state.data?.paymentStatus === 'PENDING' && query.state.dataUpdateCount < MAX_POLL_ATTEMPTS
            ? POLL_INTERVAL_MILLISECONDS
            : false,
   });
   const paymentResult: PaymentResult | undefined = paymentResultQuery.data;
   const resultView: ResultView | null = paymentResult ? resolveResultView(paymentResult) : null;
   const pendingBookingQuery: UseQueryResult<BookingDetail | null> = useQuery<BookingDetail | null>({
      queryKey: pendingBookingKey(),
      queryFn: getPendingBooking,
      enabled: resultView === 'FAILED',
   });

   useEffect((): void => {
      if (resultView === 'PAID' || resultView === 'REFUND_REQUIRED') {
         clearBooking();
         void queryClient.invalidateQueries({ queryKey: ['seat-map'] });
         void queryClient.invalidateQueries({ queryKey: ['my-seat-hold'] });
         void queryClient.invalidateQueries({ queryKey: ['pending-fnb'] });
         void queryClient.invalidateQueries({ queryKey: ['pending-booking'] });
         void queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
         void queryClient.invalidateQueries({ queryKey: ['public-showtimes'] });
      }
   }, [resultView, clearBooking, queryClient]);

   if (transactionRef === '' || paymentResultQuery.isError) {
      return (
         <section className="mx-auto w-full max-w-xl space-y-4 px-4 py-16 text-center sm:px-6">
            <Alert variant="error">
               {transactionRef === '' ? 'Thiếu mã giao dịch.' : getErrorMessage(paymentResultQuery.error)}
            </Alert>
            <Link to={MY_TICKETS_PATH} className="text-sm font-semibold text-brand-700">
               Xem vé của tôi
            </Link>
         </section>
      );
   }

   const pendingBooking: BookingDetail | null = pendingBookingQuery.data ?? null;
   const isStillConfirming: boolean = resultView === null || resultView === 'CONFIRMING';
   const hasGivenUpPolling: boolean =
      isStillConfirming && !paymentResultQuery.isFetching && paymentResult !== undefined;

   return (
      <section className="mx-auto grid min-h-[60vh] w-full max-w-xl place-items-center px-4 py-16 text-center sm:px-6">
         <div className="w-full space-y-6 rounded-2xl border border-ink-200 bg-white p-8 shadow-xs">
            {isStillConfirming && (
               <>
                  <LoaderCircle className="mx-auto size-14 animate-spin text-brand-600" aria-hidden="true" />
                  <h1 className="text-2xl font-extrabold text-ink-900">Đang xác nhận thanh toán</h1>
                  <p className="text-ink-600">
                     {hasGivenUpPolling
                        ? 'Cổng thanh toán chưa phản hồi. Nếu tài khoản đã bị trừ tiền, vé sẽ xuất hiện trong mục Vé của tôi sau ít phút.'
                        : 'Vui lòng đợi trong giây lát, đừng đóng trang này.'}
                  </p>
               </>
            )}
            {resultView === 'PAID' && paymentResult && (
               <>
                  <CheckCircle2 className="mx-auto size-14 text-emerald-600" aria-hidden="true" />
                  <h1 className="text-2xl font-extrabold text-ink-900">Thanh toán thành công</h1>
                  <p className="text-ink-600">
                     Đã nhận {formatVnd(paymentResult.amount)}. Vé điện tử kèm mã QR đã được lưu trong tài khoản và gửi
                     tới email của bạn.
                  </p>
               </>
            )}
            {resultView === 'REFUND_REQUIRED' && (
               <>
                  <CircleAlert className="mx-auto size-14 text-amber-600" aria-hidden="true" />
                  <h1 className="text-2xl font-extrabold text-ink-900">Đã nhận tiền nhưng ghế không còn</h1>
                  <p className="text-ink-600">
                     Thanh toán đến sau khi thời gian giữ ghế kết thúc và ghế đã được nhả. Chúng tôi chưa phát hành vé
                     và sẽ hoàn tiền cho bạn. Đơn được lưu trong mục Vé của tôi.
                  </p>
               </>
            )}
            {resultView === 'FAILED' && (
               <>
                  <CircleX className="mx-auto size-14 text-danger-600" aria-hidden="true" />
                  <h1 className="text-2xl font-extrabold text-ink-900">Thanh toán không thành công</h1>
                  <p className="text-ink-600">
                     Giao dịch chưa hoàn tất và bạn chưa bị trừ tiền. Nếu còn thời gian giữ ghế, bạn có thể thử thanh
                     toán lại.
                  </p>
               </>
            )}
            <div className="flex flex-wrap justify-center gap-3">
               {resultView === 'FAILED' && pendingBooking && (
                  <LinkButton
                     to={getPaymentPath(pendingBooking.showtime.movieSlug, pendingBooking.showtime.showtimeId)}
                  >
                     Thử thanh toán lại
                  </LinkButton>
               )}
               {resultView === 'FAILED' && !pendingBooking && !pendingBookingQuery.isPending && (
                  <LinkButton to="/movies">Chọn lại suất chiếu</LinkButton>
               )}
               {(resultView === 'PAID' || resultView === 'REFUND_REQUIRED' || hasGivenUpPolling) && (
                  <LinkButton to={MY_TICKETS_PATH}>Xem vé của tôi</LinkButton>
               )}
               <LinkButton to="/" variant="secondary">
                  Về trang chủ
               </LinkButton>
            </div>
         </div>
      </section>
   );
}

export default PaymentResultPage;
