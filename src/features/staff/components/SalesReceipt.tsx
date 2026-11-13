import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import type { ReactElement } from 'react';
import { saveCounterReceiptFile } from '@/api/staff/ticketSalesApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatClockRange, formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type { BookingFnbLine } from '@/types/booking/bookingFnb';
import type { CounterReceipt, CounterReceiptFile } from '@/types/staff/ticketSales';
import { PAYMENT_METHOD_LABELS } from '@/lib/staff/operationsLabels';

interface SalesReceiptProps {
   counterReceipt: CounterReceipt;
   onNewSale: () => void;
}

interface ReceiptRowProps {
   label: string;
   value: string;
   isStrong?: boolean;
}

function ReceiptRow({ label, value, isStrong = false }: ReceiptRowProps): ReactElement {
   return (
      <div className="flex justify-between gap-4 text-sm">
         <dt className="text-ink-600">{label}</dt>
         <dd className={isStrong ? 'text-lg font-extrabold text-ink-900' : 'font-semibold text-ink-900'}>{value}</dd>
      </div>
   );
}

export function SalesReceipt({ counterReceipt, onNewSale }: SalesReceiptProps): ReactElement {
   const { booking } = counterReceipt;
   const { showtime } = booking;

   const saveReceiptFileMutation: UseMutationResult<CounterReceiptFile, unknown, void> = useMutation<
      CounterReceiptFile,
      unknown,
      void
   >({
      mutationFn: (): Promise<CounterReceiptFile> => saveCounterReceiptFile(booking.bookingCode),
   });

   function handlePrint(): void {
      saveReceiptFileMutation.mutate(undefined, {
         onSettled: (): void => {
            window.print();
         },
      });
   }

   return (
      <div className="space-y-5">
         <div className="rounded-xl border-l-4 border-brand-600 bg-brand-50 px-4 py-3 text-brand-800 print:hidden">
            <h2 className="text-base font-extrabold">Đã bán vé thành công</h2>
            <p className="text-xs font-medium">
               Đơn {booking.bookingCode} đã thanh toán {formatVnd(booking.finalAmount)}.
               {counterReceipt.changeAmount !== null && counterReceipt.changeAmount > 0
                  ? ` Thối lại khách ${formatVnd(counterReceipt.changeAmount)}.`
                  : ''}
            </p>
         </div>

         <article
            id="counter-receipt-print"
            className="mx-auto max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-md ring-1 ring-ink-100"
         >
            <header className="space-y-1 text-center">
               <p className="text-lg font-extrabold text-ink-900">CinemaSphere</p>
               <p className="text-sm text-ink-700">{showtime.cinemaName}</p>
               <p className="text-xs text-ink-500">Vé và hóa đơn bán tại quầy</p>
            </header>

            <section className="space-y-1 border-t border-dashed border-ink-300 pt-4">
               <h3 className="text-base font-extrabold uppercase text-ink-900">{showtime.movieTitle}</h3>
               <p className="text-sm text-ink-700">
                  {showtime.hallName} · {showtime.screenType}
               </p>
               <p className="text-sm text-ink-700">
                  {formatDisplayDate(toVietnamDate(showtime.startTime))} ·{' '}
                  <span className="font-bold">{formatClockRange(showtime.startTime, showtime.endTime)}</span>
               </p>
            </section>

            <section className="space-y-1 border-t border-dashed border-ink-300 pt-4">
               <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Ghế</h3>
               <ul className="space-y-1 text-sm text-ink-800">
                  {booking.tickets.map((bookingTicket) => (
                     <li key={bookingTicket.ticketId} className="flex justify-between gap-4">
                        <span>Ghế {bookingTicket.seatLabel}</span>
                        <span>{formatVnd(bookingTicket.price)}</span>
                     </li>
                  ))}
               </ul>
            </section>

            {booking.fnbLines.length > 0 && (
               <section className="space-y-1 border-t border-dashed border-ink-300 pt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Bắp nước</h3>
                  <ul className="space-y-1 text-sm text-ink-800">
                     {booking.fnbLines.map((bookingFnbLine: BookingFnbLine) => (
                        <li
                           key={`${bookingFnbLine.comboId ?? ''}-${bookingFnbLine.itemId ?? ''}`}
                           className="flex justify-between gap-4"
                        >
                           <span>
                              {bookingFnbLine.quantity} × {bookingFnbLine.name}
                           </span>
                           <span>{formatVnd(bookingFnbLine.lineAmount)}</span>
                        </li>
                     ))}
                  </ul>
               </section>
            )}

            <dl className="space-y-1.5 border-t border-dashed border-ink-300 pt-4">
               <ReceiptRow label="Tiền vé" value={formatVnd(booking.ticketAmount)} />
               <ReceiptRow label="Bắp nước" value={formatVnd(booking.fnbAmount)} />
               {booking.discountAmount > 0 && (
                  <ReceiptRow label="Giảm giá" value={`-${formatVnd(booking.discountAmount)}`} />
               )}
               <ReceiptRow label="Tổng thanh toán" value={formatVnd(booking.finalAmount)} isStrong />
               <ReceiptRow
                  label="Hình thức"
                  value={PAYMENT_METHOD_LABELS[counterReceipt.paymentMethod] ?? counterReceipt.paymentMethod}
               />
               {counterReceipt.cashReceived !== null && (
                  <ReceiptRow label="Tiền khách đưa" value={formatVnd(counterReceipt.cashReceived)} />
               )}
               {counterReceipt.changeAmount !== null && (
                  <ReceiptRow label="Tiền thối" value={formatVnd(counterReceipt.changeAmount)} />
               )}
            </dl>

            <section className="flex flex-col items-center gap-2 border-t border-dashed border-ink-300 pt-4 text-center">
               {booking.qrCodeDataUrl && (
                  <img src={booking.qrCodeDataUrl} alt={`Mã QR đơn ${booking.bookingCode}`} className="size-44" />
               )}
               <p className="font-mono text-base font-extrabold text-ink-900">{booking.bookingCode}</p>
               <p className="text-xs text-ink-600">
                  Một mã QR cho cả đơn. Đưa mã này cho nhân viên để soát vé và nhận bắp nước.
               </p>
            </section>

            <footer className="space-y-0.5 border-t border-dashed border-ink-300 pt-4 text-center text-xs text-ink-500">
               <p>
                  {toVietnamTimeOfDay(counterReceipt.paidAt)} ·{' '}
                  {formatDisplayDate(toVietnamDate(counterReceipt.paidAt))}
               </p>
               {counterReceipt.soldByStaffName && <p>Nhân viên bán: {counterReceipt.soldByStaffName}</p>}
               <p>Khách hàng: {counterReceipt.customerName ?? 'Khách vãng lai'}</p>
            </footer>
         </article>

         {saveReceiptFileMutation.isSuccess && (
            <div className="mx-auto max-w-md print:hidden">
               <Alert variant="success">
                  Đã lưu hóa đơn {saveReceiptFileMutation.data.fileName} vào thư mục
                  <span className="mt-0.5 block break-all font-mono text-xs">
                     {saveReceiptFileMutation.data.directory}
                  </span>
               </Alert>
            </div>
         )}
         {saveReceiptFileMutation.isError && (
            <div className="mx-auto max-w-md print:hidden">
               <Alert variant="error">{getErrorMessage(saveReceiptFileMutation.error)}</Alert>
            </div>
         )}

         <div className="flex flex-wrap justify-center gap-3 print:hidden">
            <Button
               className="h-12 px-6 text-base"
               icon={<Printer className="size-5" aria-hidden="true" />}
               isLoading={saveReceiptFileMutation.isPending}
               onClick={handlePrint}
            >
               In vé và hóa đơn
            </Button>
            <Button variant="secondary" className="h-12 px-6 text-base" onClick={onNewSale}>
               Bán đơn mới
            </Button>
         </div>
      </div>
   );
}

export default SalesReceipt;
