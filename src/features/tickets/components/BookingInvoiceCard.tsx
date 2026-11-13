import { CalendarDays, Clapperboard, Clock, MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatClockRange, formatDisplayDate, toVietnamDate } from '@/lib/common/vietnamTime';
import { cn } from '@/lib/common/utils';
import type { BookingDetail, BookingStatus } from '@/types/booking/bookingDetail';
import type { BookingFnbLine } from '@/types/booking/bookingFnb';

interface BookingInvoiceCardProps {
   bookingDetail: BookingDetail;
}

const STATUS_LABELS: Partial<Record<BookingStatus, string>> = {
   PAID: 'Đã thanh toán',
   REFUND_REQUIRED: 'Chờ hoàn tiền',
   REFUNDED: 'Đã hoàn tiền',
};

function formatFnbDeliveryStatus(bookingFnbLine: BookingFnbLine): string {
   if (bookingFnbLine.deliveredQuantity >= bookingFnbLine.quantity) {
      return 'Đã nhận';
   }
   if (bookingFnbLine.deliveredQuantity > 0) {
      return `Đã nhận ${bookingFnbLine.deliveredQuantity}/${bookingFnbLine.quantity}`;
   }
   return 'Chưa nhận';
}

export function BookingInvoiceCard({ bookingDetail }: BookingInvoiceCardProps): ReactElement {
   const { showtime } = bookingDetail;
   const isPaid: boolean = bookingDetail.status === 'PAID';

   return (
      <article className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs">
         <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 p-5">
            <div className="flex gap-4">
               <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  {showtime.posterUrl ? (
                     <img
                        src={showtime.posterUrl}
                        alt={`Poster phim ${showtime.movieTitle}`}
                        className="size-full object-cover"
                     />
                  ) : (
                     <span className="grid size-full place-items-center text-brand-300">
                        <Clapperboard className="size-6" aria-hidden="true" />
                     </span>
                  )}
               </div>
               <div className="space-y-1.5 text-sm text-ink-700">
                  <h2 className="text-base font-extrabold uppercase text-brand-700">{showtime.movieTitle}</h2>
                  <p className="flex items-center gap-2">
                     <MapPin className="size-4 text-brand-600" aria-hidden="true" />
                     {showtime.cinemaName} · {showtime.hallName} · {showtime.screenType}
                  </p>
                  <p className="flex items-center gap-2">
                     <CalendarDays className="size-4 text-brand-600" aria-hidden="true" />
                     {formatDisplayDate(toVietnamDate(showtime.startTime))}
                  </p>
                  <p className="flex items-center gap-2">
                     <Clock className="size-4 text-brand-600" aria-hidden="true" />
                     {formatClockRange(showtime.startTime, showtime.endTime)}
                  </p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-xs text-ink-500">Mã đơn</p>
               <p className="font-mono text-sm font-bold text-ink-900">{bookingDetail.bookingCode}</p>
               <span
                  className={cn(
                     'mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold',
                     isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                  )}
               >
                  {STATUS_LABELS[bookingDetail.status] ?? bookingDetail.status}
               </span>
            </div>
         </header>

         <div className="grid gap-6 p-5 md:grid-cols-[1fr_1fr]">
            <section aria-label="Hóa đơn" className="space-y-3 text-sm">
               <h3 className="font-bold text-ink-900">Hóa đơn</h3>
               <ul className="space-y-1.5 text-ink-700">
                  {bookingDetail.seats.map((bookingSeat) => (
                     <li key={bookingSeat.seatId} className="flex justify-between">
                        <span>
                           Ghế {bookingSeat.label}
                           {bookingSeat.seatTypeName ? ` (${bookingSeat.seatTypeName})` : ''}
                        </span>
                        <span>{formatVnd(bookingSeat.price)}</span>
                     </li>
                  ))}
                  {bookingDetail.fnbLines.map((bookingFnbLine) => (
                     <li
                        key={`${bookingFnbLine.comboId ?? ''}-${bookingFnbLine.itemId ?? ''}`}
                        className="flex justify-between"
                     >
                        <span>
                           {bookingFnbLine.quantity} × {bookingFnbLine.name}
                           {isPaid && (
                              <span
                                 className={cn(
                                    'ml-2 rounded-full px-2 py-0.5 text-xs font-bold',
                                    bookingFnbLine.deliveredQuantity >= bookingFnbLine.quantity
                                       ? 'bg-ink-100 text-ink-600'
                                       : 'bg-emerald-50 text-emerald-700',
                                 )}
                              >
                                 {formatFnbDeliveryStatus(bookingFnbLine)}
                              </span>
                           )}
                        </span>
                        <span>{formatVnd(bookingFnbLine.lineAmount)}</span>
                     </li>
                  ))}
               </ul>
               <dl className="space-y-1 border-t border-ink-100 pt-3">
                  <div className="flex justify-between text-ink-700">
                     <dt>Tiền vé</dt>
                     <dd>{formatVnd(bookingDetail.ticketAmount)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-700">
                     <dt>Bắp nước</dt>
                     <dd>{formatVnd(bookingDetail.fnbAmount)}</dd>
                  </div>
                  {bookingDetail.discountAmount > 0 && (
                     <div className="flex justify-between text-emerald-700">
                        <dt>Giảm giá</dt>
                        <dd>-{formatVnd(bookingDetail.discountAmount)}</dd>
                     </div>
                  )}
                  <div className="flex justify-between pt-1 text-base">
                     <dt className="font-semibold text-ink-900">Tổng thanh toán</dt>
                     <dd className="font-extrabold text-brand-700">{formatVnd(bookingDetail.finalAmount)}</dd>
                  </div>
               </dl>
               {!isPaid && (
                  <p className="rounded-xl bg-amber-50 p-3 text-amber-800">
                     Thanh toán đến khi ghế đã được nhả nên chưa phát hành vé. Chúng tôi sẽ hoàn tiền cho bạn.
                  </p>
               )}
            </section>

            {bookingDetail.tickets.length > 0 && (
               <section aria-label="Mã QR vào rạp" className="space-y-3">
                  <h3 className="text-sm font-bold text-ink-900">Mã QR vào rạp</h3>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-300 p-4 text-center">
                     {bookingDetail.qrCodeDataUrl && (
                        <img
                           src={bookingDetail.qrCodeDataUrl}
                           alt={`Mã QR đơn ${bookingDetail.bookingCode}`}
                           className="size-48"
                        />
                     )}
                     <p className="font-mono text-base font-extrabold text-ink-900">{bookingDetail.bookingCode}</p>
                     <p className="text-xs text-ink-600">
                        Một mã QR duy nhất cho cả đơn: {bookingDetail.tickets.length} ghế
                        {bookingDetail.fnbLines.length > 0 ? ' và bắp nước' : ''}. Đưa mã này cho nhân viên rạp để soát
                        vé và nhận bắp nước.
                     </p>
                     <ul className="flex flex-wrap justify-center gap-2">
                        {bookingDetail.tickets.map((bookingTicket) => (
                           <li
                              key={bookingTicket.ticketId}
                              className={cn(
                                 'rounded-full px-3 py-1 text-xs font-bold',
                                 bookingTicket.checkedIn ? 'bg-ink-100 text-ink-600' : 'bg-emerald-50 text-emerald-700',
                              )}
                           >
                              Ghế {bookingTicket.seatLabel} · {bookingTicket.checkedIn ? 'Đã sử dụng' : 'Chưa sử dụng'}
                           </li>
                        ))}
                     </ul>
                  </div>
               </section>
            )}
         </div>
      </article>
   );
}

export default BookingInvoiceCard;
