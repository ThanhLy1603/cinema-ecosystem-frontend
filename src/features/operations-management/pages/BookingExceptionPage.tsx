import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { RotateCcw, Search, TicketCheck, Undo2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { undoCheckIn } from '@/api/staff/checkInApi';
import { lookupBookingException, refundBooking, reissueBookingTicket } from '@/api/staff/operationsApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextAreaField from '@/components/ui/TextAreaField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatClockRange, formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import { PAYMENT_METHOD_LABELS } from '@/lib/staff/operationsLabels';
import type { BookingStatus, BookingTicket } from '@/types/booking/bookingDetail';
import type { BookingException, BookingExceptionActionRequest } from '@/types/staff/operations';

type PendingAction = 'REFUND' | 'REISSUE';

const STATUS_LABELS: Record<BookingStatus, string> = {
   PENDING: 'Chờ thanh toán',
   PAID: 'Đã thanh toán',
   EXPIRED: 'Hết hạn giữ chỗ',
   CANCELLED: 'Đã hủy',
   REFUND_REQUIRED: 'Chờ hoàn tiền',
   REFUNDED: 'Đã hoàn tiền',
};

export function BookingExceptionPage(): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const [codeInput, setCodeInput] = useState<string>('');
   const [bookingException, setBookingException] = useState<BookingException | null>(null);
   const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
   const [reason, setReason] = useState<string>('');
   const [notice, setNotice] = useState<string | null>(null);
   const lookupMutation: UseMutationResult<BookingException, unknown, string> = useMutation<
      BookingException,
      unknown,
      string
   >({
      mutationFn: lookupBookingException,
      onSuccess(foundBookingException: BookingException): void {
         setBookingException(foundBookingException);
         setPendingAction(null);
         setNotice(null);
      },
   });
   const actionMutation: UseMutationResult<
      BookingException,
      unknown,
      { action: PendingAction; request: BookingExceptionActionRequest }
   > = useMutation<BookingException, unknown, { action: PendingAction; request: BookingExceptionActionRequest }>({
      mutationFn(variables: {
         action: PendingAction;
         request: BookingExceptionActionRequest;
      }): Promise<BookingException> {
         const bookingCode: string = bookingException?.booking.bookingCode ?? '';
         return variables.action === 'REFUND'
            ? refundBooking(bookingCode, variables.request)
            : reissueBookingTicket(bookingCode, variables.request);
      },
      onSuccess(
         updatedBookingException: BookingException,
         variables: { action: PendingAction; request: BookingExceptionActionRequest },
      ): void {
         setBookingException(updatedBookingException);
         setPendingAction(null);
         setReason('');
         setNotice(
            variables.action === 'REFUND'
               ? 'Đã ghi nhận hoàn tiền và nhả ghế. Hãy trả tiền cho khách theo đúng phương thức đã thanh toán.'
               : 'Đã cấp lại vé. Mã QR cũ không còn dùng được.',
         );
         void queryClient.invalidateQueries({ queryKey: ['operations'] });
      },
   });
   const undoMutation: UseMutationResult<unknown, unknown, void> = useMutation<unknown, unknown, void>({
      mutationFn(): Promise<unknown> {
         const checkedInTicketIds: number[] = (bookingException?.booking.tickets ?? [])
            .filter((bookingTicket: BookingTicket) => bookingTicket.checkedIn)
            .map((bookingTicket: BookingTicket) => bookingTicket.ticketId);
         return undoCheckIn({
            code: bookingException?.booking.bookingCode ?? '',
            cinemaId: bookingException?.booking.showtime.cinemaId ?? 0,
            ticketIds: checkedInTicketIds,
         });
      },
      onSuccess(): void {
         setNotice('Đã hoàn tác soát vé cho các ghế đã vào rạp.');
         lookupMutation.mutate(bookingException?.booking.bookingCode ?? '');
      },
   });
   const trimmedReason: string = reason.trim();
   const isBusy: boolean = actionMutation.isPending || undoMutation.isPending;

   function handleLookup(): void {
      const trimmedCode: string = codeInput.trim();
      if (trimmedCode !== '') {
         actionMutation.reset();
         undoMutation.reset();
         lookupMutation.mutate(trimmedCode);
      }
   }

   function handleConfirmAction(): void {
      if (pendingAction !== null && trimmedReason !== '') {
         actionMutation.mutate({ action: pendingAction, request: { reason: trimmedReason } });
      }
   }

   function handleStartAction(action: PendingAction): void {
      setReason('');
      setPendingAction(action);
   }

   function renderTicket(bookingTicket: BookingTicket): ReactElement {
      return (
         <li key={bookingTicket.ticketId} className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-sm">
            <span className="font-bold text-ink-900">Ghế {bookingTicket.seatLabel}</span>
            <span className="flex items-center gap-2">
               {bookingTicket.checkedIn && (
                  <span className="rounded-md bg-accent-100 px-2 py-0.5 text-xs font-extrabold text-accent-700">
                     Đã vào rạp
                  </span>
               )}
               <span>{formatVnd(bookingTicket.price)}</span>
            </span>
         </li>
      );
   }

   function renderBooking(foundBookingException: BookingException): ReactElement {
      const { booking } = foundBookingException;
      const { showtime } = booking;
      return (
         <section className="space-y-5 rounded-xl bg-white p-5 ring-1 ring-ink-100">
            <header className="flex flex-wrap items-center gap-3">
               <h2 className="font-mono text-lg font-extrabold text-ink-900">{booking.bookingCode}</h2>
               <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-extrabold text-ink-800">
                  {STATUS_LABELS[booking.status]}
               </span>
               <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-800">
                  {foundBookingException.salesChannel === 'COUNTER' ? 'Bán tại quầy' : 'Bán online'}
               </span>
               {foundBookingException.paymentMethod && (
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-700">
                     {PAYMENT_METHOD_LABELS[foundBookingException.paymentMethod]}
                  </span>
               )}
            </header>

            <div className="space-y-0.5 text-sm text-ink-700">
               <p className="font-extrabold uppercase text-ink-900">{showtime.movieTitle}</p>
               <p>
                  {showtime.cinemaName} · {showtime.hallName} · {showtime.screenType}
               </p>
               <p>
                  {formatDisplayDate(toVietnamDate(showtime.startTime))} ·{' '}
                  <span className="font-bold">{formatClockRange(showtime.startTime, showtime.endTime)}</span>
               </p>
            </div>

            <ul className="divide-y divide-ink-100">{booking.tickets.map(renderTicket)}</ul>
            {booking.fnbLines.length > 0 && (
               <ul className="space-y-1 border-t border-dashed border-ink-300 pt-3 text-sm">
                  {booking.fnbLines.map((bookingFnbLine) => (
                     <li
                        key={`${bookingFnbLine.comboId ?? ''}-${bookingFnbLine.itemId ?? ''}`}
                        className="flex flex-wrap items-center justify-between gap-2"
                     >
                        <span>
                           {bookingFnbLine.quantity} × {bookingFnbLine.name}
                        </span>
                        <span className="flex items-center gap-2">
                           <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-700">
                              Đã giao {bookingFnbLine.deliveredQuantity} / {bookingFnbLine.quantity}
                           </span>
                           {formatVnd(bookingFnbLine.lineAmount)}
                        </span>
                     </li>
                  ))}
               </ul>
            )}
            <p className="flex items-center justify-between border-t border-ink-200 pt-3 text-sm font-bold text-ink-900">
               <span>Tổng thanh toán</span>
               <span className="text-xl font-extrabold text-brand-700">{formatVnd(booking.finalAmount)}</span>
            </p>

            {foundBookingException.refundedAt && (
               <Alert variant="info">
                  <span className="block font-bold">
                     Đã hoàn {formatVnd(foundBookingException.refundedAmount ?? 0)} lúc{' '}
                     {toVietnamTimeOfDay(foundBookingException.refundedAt)}{' '}
                     {formatDisplayDate(toVietnamDate(foundBookingException.refundedAt))}
                  </span>
                  <span className="block">Lý do: {foundBookingException.refundReason}</span>
               </Alert>
            )}

            {booking.qrCodeDataUrl && foundBookingException.canReissue && (
               <div className="flex items-center gap-4">
                  <img src={booking.qrCodeDataUrl} alt={`Mã QR đơn ${booking.bookingCode}`} className="size-28" />
                  <p className="text-xs text-ink-600">Mã QR hiện đang có hiệu lực của đơn này.</p>
               </div>
            )}

            {renderActions(foundBookingException)}
         </section>
      );
   }

   function renderActions(foundBookingException: BookingException): ReactElement {
      return (
         <div className="space-y-4 border-t border-ink-200 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Xử lý ngoại lệ</h3>
            <div className="flex flex-wrap gap-3">
               <Button
                  variant="secondary"
                  icon={<Undo2 className="size-4" aria-hidden="true" />}
                  disabled={foundBookingException.checkedInTicketCount === 0 || isBusy}
                  isLoading={undoMutation.isPending}
                  onClick={() => undoMutation.mutate()}
               >
                  Hoàn tác soát vé
                  <span className="ml-2 rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-extrabold">
                     {foundBookingException.checkedInTicketCount} ghế
                  </span>
               </Button>
               <Button
                  variant="secondary"
                  icon={<TicketCheck className="size-4" aria-hidden="true" />}
                  disabled={!foundBookingException.canReissue || isBusy}
                  onClick={() => handleStartAction('REISSUE')}
               >
                  Cấp lại vé
               </Button>
               <Button
                  variant="secondary"
                  icon={<RotateCcw className="size-4" aria-hidden="true" />}
                  disabled={!foundBookingException.canRefund || isBusy}
                  onClick={() => handleStartAction('REFUND')}
               >
                  Hoàn tiền
               </Button>
            </div>
            {!foundBookingException.canRefund && foundBookingException.refundBlockedReason && (
               <p className="text-xs text-ink-600">Hoàn tiền: {foundBookingException.refundBlockedReason}</p>
            )}
            {!foundBookingException.canReissue && foundBookingException.reissueBlockedReason && (
               <p className="text-xs text-ink-600">Cấp lại vé: {foundBookingException.reissueBlockedReason}</p>
            )}

            {pendingAction !== null && (
               <div className="space-y-3 rounded-xl bg-ink-50 p-4">
                  <p className="text-sm font-bold text-ink-900">
                     {pendingAction === 'REFUND'
                        ? `Hoàn ${formatVnd(foundBookingException.booking.finalAmount)} và nhả ${foundBookingException.booking.tickets.length} ghế`
                        : 'Cấp lại vé và vô hiệu mã QR cũ'}
                  </p>
                  {pendingAction === 'REFUND' && (
                     <p className="text-xs text-ink-600">
                        Hệ thống chỉ ghi nhận hoàn tiền, đổi trạng thái đơn và thu hồi điểm thưởng nếu có. Việc trả tiền
                        cho khách do bạn thực hiện theo phương thức khách đã dùng.
                     </p>
                  )}
                  <TextAreaField
                     id="exception-reason"
                     label="Lý do, bắt buộc ghi vào nhật ký"
                     value={reason}
                     onChange={setReason}
                     rows={2}
                     maxLength={500}
                  />
                  <div className="flex flex-wrap gap-3">
                     <Button
                        disabled={trimmedReason === ''}
                        isLoading={actionMutation.isPending}
                        onClick={handleConfirmAction}
                     >
                        {pendingAction === 'REFUND' ? 'Xác nhận hoàn tiền' : 'Xác nhận cấp lại vé'}
                     </Button>
                     <Button variant="secondary" disabled={isBusy} onClick={() => setPendingAction(null)}>
                        Hủy
                     </Button>
                  </div>
               </div>
            )}
         </div>
      );
   }

   return (
      <div className="space-y-5">
         <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink-900">Xử lý ngoại lệ</h1>
            <p className="text-sm text-ink-500">
               Tra đơn theo mã đơn rồi hoàn tác soát vé, cấp lại vé hoặc hoàn tiền. Mọi thao tác đều ghi nhật ký.
            </p>
         </header>

         <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-ink-100">
            <div className="min-w-0 flex-1">
               <TextField
                  id="exception-code"
                  label="Mã đơn"
                  value={codeInput}
                  onChange={setCodeInput}
                  icon={Search}
                  placeholder="Nhập mã đơn, ví dụ BK1A2B3C4D5E6F"
                  maxLength={100}
               />
            </div>
            <Button
               className="h-11"
               disabled={codeInput.trim() === ''}
               isLoading={lookupMutation.isPending}
               onClick={handleLookup}
            >
               Tra đơn
            </Button>
         </div>

         {lookupMutation.isError && <Alert variant="error">{getErrorMessage(lookupMutation.error)}</Alert>}
         {actionMutation.isError && <Alert variant="error">{getErrorMessage(actionMutation.error)}</Alert>}
         {undoMutation.isError && <Alert variant="error">{getErrorMessage(undoMutation.error)}</Alert>}
         {notice && <Alert variant="success">{notice}</Alert>}
         {bookingException && renderBooking(bookingException)}
      </div>
   );
}

export default BookingExceptionPage;
