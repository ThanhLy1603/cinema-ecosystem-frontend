import { useMutation, useQuery, useQueryClient, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, type ReactElement } from 'react';
import { Link, Navigate, useNavigate, useParams, type NavigateFunction } from 'react-router-dom';
import { getPendingBooking } from '@/api/bookingApi';
import { createVnpayPayment } from '@/api/paymentApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
   getFnbSelectionPath,
   getPaymentPath,
   getSeatSelectionPath,
   getShowtimeSelectionPath,
} from '@/lib/booking/bookingPaths';
import { mySeatHoldKey, pendingBookingKey, showtimeSeatMapKey } from '@/lib/booking/bookingQueryKeys';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { useBookingStore } from '@/stores/useBookingStore';
import type { BookingDetail } from '@/types/booking/bookingDetail';
import type { PaymentUrl } from '@/types/payment/payment';
import BookingStepper from '../components/BookingStepper';
import BookingSummaryAside, { type SummaryFnbLine, type SummarySeat } from '../components/BookingSummaryAside';
import { useHoldCountdown } from '../hooks/useHoldCountdown';
import { parsePositiveInteger } from '../utils/selectionParams';

const HOLD_LOST_CODES: string[] = ['NO_PENDING_BOOKING', 'HOLD_EXPIRING_SOON', 'SEAT_GAP_LEFT'];

export function PaymentPage(): ReactElement {
   const { movieSlug: movieSlugParam, showtimeId: showtimeIdParam } = useParams<{
      movieSlug: string;
      showtimeId: string;
   }>();
   const showtimeId: number | null = parsePositiveInteger(showtimeIdParam ?? null);
   const navigate: NavigateFunction = useNavigate();
   const queryClient: QueryClient = useQueryClient();
   const selectShowtime: (showtimeId: number) => void = useBookingStore((bookingState) => bookingState.selectShowtime);
   const setNotice: (notice: string | null) => void = useBookingStore((bookingState) => bookingState.setNotice);
   const notice: string | null = useBookingStore((bookingState) => bookingState.notice);
   const pendingBookingQuery: UseQueryResult<BookingDetail | null> = useQuery<BookingDetail | null>({
      queryKey: pendingBookingKey(),
      queryFn: getPendingBooking,
      refetchOnMount: 'always',
   });
   const pendingBooking: BookingDetail | null = pendingBookingQuery.data ?? null;
   const remainingSeconds: number | null = useHoldCountdown(
      pendingBooking?.expiresAt ?? null,
      pendingBooking?.serverTime ?? null,
      pendingBookingQuery.dataUpdatedAt,
   );

   function backToSeatSelection(notice: string): void {
      setNotice(notice);
      if (showtimeId !== null) {
         void queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId) });
         void queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId) });
      }
      navigate(getSeatSelectionPath(movieSlugParam ?? '', showtimeId ?? 0), { replace: true });
   }

   function handlePayFailure(error: unknown): void {
      const errorCode: string | null = getErrorCode(error);
      if (errorCode !== null && HOLD_LOST_CODES.includes(errorCode)) {
         backToSeatSelection(getErrorMessage(error));
         return;
      }
      setNotice(getErrorMessage(error));
   }

   const payMutation = useMutation<PaymentUrl, unknown, void>({
      mutationFn: createVnpayPayment,
      onSuccess(paymentUrl: PaymentUrl): void {
         window.location.assign(paymentUrl.paymentUrl);
      },
      onError: handlePayFailure,
   });

   useEffect((): void => {
      if (showtimeId !== null) {
         selectShowtime(showtimeId);
      }
   }, [showtimeId, selectShowtime]);

   useEffect((): void => {
      if (pendingBookingQuery.isSuccess && !pendingBookingQuery.isFetching && pendingBooking === null) {
         setNotice('Bạn chưa giữ ghế hoặc đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.');
         navigate(getSeatSelectionPath(movieSlugParam ?? '', showtimeId ?? 0), { replace: true });
      }
   }, [
      pendingBookingQuery.isSuccess,
      pendingBookingQuery.isFetching,
      pendingBooking,
      setNotice,
      navigate,
      movieSlugParam,
      showtimeId,
   ]);

   useEffect((): void => {
      if (remainingSeconds === 0 && pendingBooking?.expiresAt) {
         setNotice('Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.');
         void queryClient.invalidateQueries({ queryKey: pendingBookingKey() });
         navigate(getSeatSelectionPath(movieSlugParam ?? '', showtimeId ?? 0), { replace: true });
      }
   }, [remainingSeconds, pendingBooking, setNotice, queryClient, navigate, movieSlugParam, showtimeId]);

   const summarySeats: SummarySeat[] = useMemo(
      (): SummarySeat[] =>
         (pendingBooking?.seats ?? []).map((bookingSeat) => ({
            id: bookingSeat.seatId,
            label: bookingSeat.label,
            price: bookingSeat.price,
         })),
      [pendingBooking],
   );
   const summaryFnbLines: SummaryFnbLine[] = useMemo(
      (): SummaryFnbLine[] =>
         (pendingBooking?.fnbLines ?? []).map((bookingFnbLine) => ({
            key: bookingFnbLine.comboId !== null ? `combo-${bookingFnbLine.comboId}` : `item-${bookingFnbLine.itemId}`,
            name: bookingFnbLine.name,
            quantity: bookingFnbLine.quantity,
            amount: bookingFnbLine.lineAmount,
         })),
      [pendingBooking],
   );

   if (showtimeId === null) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">Đường dẫn suất chiếu không hợp lệ.</Alert>
            <Link to="/movies" className="text-sm font-semibold text-brand-700">
               Về danh sách phim
            </Link>
         </section>
      );
   }
   if (pendingBookingQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (pendingBookingQuery.isError) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">{getErrorMessage(pendingBookingQuery.error)}</Alert>
            <Link to="/movies" className="text-sm font-semibold text-brand-700">
               Về danh sách phim
            </Link>
         </section>
      );
   }
   if (pendingBooking === null) {
      return <FullPageSpinner />;
   }

   const bookingDetail: BookingDetail = pendingBooking;
   if (bookingDetail.showtime.movieSlug !== movieSlugParam || bookingDetail.showtime.showtimeId !== showtimeId) {
      return (
         <Navigate to={getPaymentPath(bookingDetail.showtime.movieSlug, bookingDetail.showtime.showtimeId)} replace />
      );
   }
   function handlePay(): void {
      setNotice(null);
      payMutation.mutate();
   }

   const footer: ReactElement = (
      <div className="space-y-2">
         <Button
            fullWidth
            isLoading={payMutation.isPending}
            onClick={handlePay}
            icon={<CreditCard className="size-4" />}
         >
            Thanh toán {formatVnd(bookingDetail.finalAmount)}
         </Button>
         <p className="text-center text-xs text-ink-500">Bạn sẽ được chuyển sang cổng thanh toán VNPay.</p>
      </div>
   );

   return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-28 pt-8 sm:px-6 lg:px-12 lg:pb-8">
         <div className="space-y-4">
            <Link
               to={getFnbSelectionPath(bookingDetail.showtime.movieSlug, bookingDetail.showtime.showtimeId)}
               className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Quay lại chọn bắp nước
            </Link>
            <h1 className="text-2xl font-extrabold text-ink-900">Thanh toán: {bookingDetail.showtime.movieTitle}</h1>
            <BookingStepper
               currentStepIndex={3}
               stepPaths={[
                  getShowtimeSelectionPath(bookingDetail.showtime.movieSlug, bookingDetail.showtime.showtimeId),
                  getSeatSelectionPath(bookingDetail.showtime.movieSlug, bookingDetail.showtime.showtimeId),
                  getFnbSelectionPath(bookingDetail.showtime.movieSlug, bookingDetail.showtime.showtimeId),
               ]}
            />
         </div>

         <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs sm:p-6">
               {notice && <Alert variant="error">{notice}</Alert>}
               <h2 className="text-lg font-bold text-ink-900">Phương thức thanh toán</h2>
               <div className="flex items-center gap-4 rounded-xl border-2 border-brand-500 bg-brand-50/40 p-4">
                  <span className="grid size-12 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-brand-100">
                     <CreditCard className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                     <p className="font-bold text-ink-900">VNPay</p>
                     <p className="text-sm text-ink-600">QR Pay, thẻ ATM nội địa, Visa / Mastercard</p>
                  </div>
               </div>
               <ul className="space-y-2 text-sm text-ink-600">
                  <li className="flex items-start gap-2">
                     <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                     Giao dịch được mã hóa và xác thực chữ ký số, chúng tôi không lưu thông tin thẻ của bạn.
                  </li>
                  <li className="flex items-start gap-2">
                     <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                     Vé điện tử kèm mã QR được lưu trong mục &quot;Vé của tôi&quot; và gửi qua email sau khi thanh toán
                     thành công.
                  </li>
               </ul>
            </section>

            <BookingSummaryAside
               movieTitle={bookingDetail.showtime.movieTitle}
               posterUrl={bookingDetail.showtime.posterUrl}
               rated={bookingDetail.showtime.rated}
               durationMinutes={bookingDetail.showtime.durationMinutes}
               summaryShowtime={{
                  cinemaName: bookingDetail.showtime.cinemaName,
                  hallName: bookingDetail.showtime.hallName,
                  screenType: bookingDetail.showtime.screenType,
                  startTime: bookingDetail.showtime.startTime,
                  endTime: bookingDetail.showtime.endTime,
               }}
               priceFrom={null}
               summarySeats={summarySeats}
               summaryFnbLines={summaryFnbLines}
               footer={footer}
               holdRemainingSeconds={remainingSeconds}
               collapsibleOnMobile
            />
         </div>
      </div>
   );
}

export default PaymentPage;
