import { Building2, CalendarDays, Circle, CircleCheck, Clock, DoorOpen, Undo2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import AgeRatingLabel from '@/components/common/AgeRatingLabel';
import SeatTypeIcon from '@/components/common/SeatTypeIcon';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import { formatClockRange, formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import Button from '@/components/ui/Button';
import type { ScanBooking, ScanTicket, TicketScanResponse } from '@/types/staff/checkIn';
import {
   CHECK_IN_RESULT_STYLES,
   CHECK_IN_TONE_CLASS_NAMES,
   PAYMENT_METHOD_LABELS,
   SCAN_BOOKING_STATUS_LABELS,
   SCAN_BOOKING_STATUS_TONES,
   type CheckInResultStyle,
} from '../utils/checkInLabels';

const SECTION_HEADING_CLASS_NAME: string = 'text-sm font-extrabold uppercase tracking-wide text-ink-700';
const TABLE_HEAD_CELL_CLASS_NAME: string = 'px-4 py-2.5 text-left text-xs font-bold text-ink-600';

interface CheckInResultCardProps {
   scanResponse: TicketScanResponse;
   canUndo: boolean;
   isBusy: boolean;
   onConfirm: (ticketIds: number[] | undefined) => void;
   onUndo: (ticketId: number) => void;
   onReset: () => void;
}

interface InfoRowProps {
   label: string;
   children: ReactElement | string;
}

function InfoRow({ label, children }: InfoRowProps): ReactElement {
   return (
      <div className="flex items-baseline justify-between gap-4 text-sm">
         <dt className="text-ink-500">{label}</dt>
         <dd className="text-right font-semibold text-ink-900">{children}</dd>
      </div>
   );
}

function collectPendingTicketIds(scanBooking: ScanBooking | null): number[] {
   return (scanBooking?.tickets ?? [])
      .filter((scanTicket) => !scanTicket.checkedIn)
      .map((scanTicket) => scanTicket.ticketId);
}

export function CheckInResultCard({
   scanResponse,
   canUndo,
   isBusy,
   onConfirm,
   onUndo,
   onReset,
}: CheckInResultCardProps): ReactElement {
   const pendingTicketIds: number[] = collectPendingTicketIds(scanResponse.booking);
   const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>(pendingTicketIds);
   const resultStyle: CheckInResultStyle = CHECK_IN_RESULT_STYLES[scanResponse.resultCode];
   const ResultIcon = resultStyle.icon;
   const scanBooking: ScanBooking | null = scanResponse.booking;
   const totalTicketCount: number = scanBooking?.tickets.length ?? 0;
   const ticketTotal: number = (scanBooking?.tickets ?? []).reduce(
      (sumAmount, scanTicket) => sumAmount + (scanTicket.price ?? 0),
      0,
   );
   const selectedPendingCount: number = selectedTicketIds.filter((ticketId) =>
      pendingTicketIds.includes(ticketId),
   ).length;

   function toggleTicket(ticketId: number): void {
      setSelectedTicketIds((previousTicketIds) =>
         previousTicketIds.includes(ticketId)
            ? previousTicketIds.filter((previousTicketId) => previousTicketId !== ticketId)
            : [...previousTicketIds, ticketId],
      );
   }

   function handleConfirm(): void {
      const isAllPendingSelected: boolean = selectedPendingCount === pendingTicketIds.length;
      onConfirm(
         isAllPendingSelected ? undefined : selectedTicketIds.filter((ticketId) => pendingTicketIds.includes(ticketId)),
      );
   }

   function renderSeatRow(scanTicket: ScanTicket): ReactElement {
      const isSelectable: boolean = scanResponse.canCheckIn && !scanTicket.checkedIn;
      const isSelected: boolean = isSelectable && selectedTicketIds.includes(scanTicket.ticketId);
      return (
         <tr
            key={scanTicket.ticketId}
            className={cn('border-t border-ink-100', scanTicket.checkedIn && 'bg-ink-50 text-ink-500')}
         >
            <td className="px-4 py-3">
               <span className="flex items-center gap-3">
                  <SeatTypeIcon
                     seatTypeCode={scanTicket.seatTypeCode}
                     className={cn('h-6 w-8 shrink-0 drop-shadow-sm', scanTicket.checkedIn && 'opacity-50')}
                  />
                  <span className="text-base font-extrabold">{scanTicket.seatLabel}</span>
               </span>
            </td>
            <td className="px-4 py-3">{scanTicket.seatTypeName ?? 'Ghế'}</td>
            <td className="px-4 py-3 font-semibold">{scanTicket.price === null ? '—' : formatVnd(scanTicket.price)}</td>
            <td className="px-4 py-3">
               <span
                  className={cn(
                     'inline-block rounded-md px-2.5 py-1 text-xs font-bold',
                     scanTicket.checkedIn ? 'bg-ink-100 text-ink-600' : 'bg-brand-100 text-brand-800',
                  )}
               >
                  {scanTicket.checkedIn
                     ? `Đã vào ${scanTicket.checkedInAt ? toVietnamTimeOfDay(scanTicket.checkedInAt) : ''}`
                     : 'Chưa vào'}
               </span>
            </td>
            <td className="px-4 py-3">
               <span className="flex items-center justify-end gap-3">
                  {isSelectable && (
                     <>
                        <button
                           type="button"
                           disabled={isBusy}
                           onClick={() => onConfirm([scanTicket.ticketId])}
                           className="rounded-md border border-brand-600 px-3 py-1 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-600 hover:text-white disabled:opacity-60"
                        >
                           Vào lẻ
                        </button>
                        <label className="cursor-pointer">
                           <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isBusy}
                              onChange={() => toggleTicket(scanTicket.ticketId)}
                              aria-label={`Chọn ghế ${scanTicket.seatLabel}`}
                              className="sr-only"
                           />
                           {isSelected ? (
                              <CircleCheck className="size-5 text-brand-600" aria-hidden="true" />
                           ) : (
                              <Circle className="size-5 text-ink-300" aria-hidden="true" />
                           )}
                        </label>
                     </>
                  )}
                  {scanTicket.checkedIn && canUndo && (
                     <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onUndo(scanTicket.ticketId)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100 disabled:opacity-60"
                     >
                        <Undo2 className="size-3.5" aria-hidden="true" />
                        Hoàn tác
                     </button>
                  )}
               </span>
            </td>
         </tr>
      );
   }

   function renderBookingDetails(booking: ScanBooking): ReactElement {
      const statusTone: string = CHECK_IN_TONE_CLASS_NAMES[SCAN_BOOKING_STATUS_TONES[booking.bookingStatus]];
      return (
         <div className="space-y-6 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <section aria-labelledby="check-in-detail-heading" className="space-y-3">
               <h3 id="check-in-detail-heading" className={SECTION_HEADING_CLASS_NAME}>
                  Chi tiết vé và khách hàng
               </h3>
               <div className="flex gap-4 rounded-xl border border-ink-200 p-4">
                  {booking.posterUrl ? (
                     <img
                        src={booking.posterUrl}
                        alt={`Poster phim ${booking.movieTitle}`}
                        className="aspect-[2/3] w-20 shrink-0 rounded-lg object-cover shadow-md"
                     />
                  ) : (
                     <span className="aspect-[2/3] w-20 shrink-0 rounded-lg bg-ink-100" />
                  )}
                  <div className="min-w-0 flex-1 space-y-3">
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h4 className="text-xl font-extrabold uppercase leading-tight text-ink-900">
                           {booking.movieTitle}
                        </h4>
                        <AgeRatingLabel ageRating={booking.rated} className="text-xs text-ink-700" />
                     </div>
                     <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
                        <ul className="space-y-1.5 text-sm text-ink-800">
                           <li className="flex items-center gap-2">
                              <Building2 className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                              {booking.cinemaName}
                           </li>
                           <li className="flex items-center gap-2">
                              <DoorOpen className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                              {booking.hallName} · {booking.screenType}
                           </li>
                           <li className="flex items-center gap-2">
                              <CalendarDays className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                              Ngày: {formatDisplayDate(toVietnamDate(booking.startTime))}
                           </li>
                           <li className="flex items-center gap-2 font-bold">
                              <Clock className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                              Suất: {formatClockRange(booking.startTime, booking.endTime)}
                           </li>
                        </ul>
                        <dl className="space-y-1.5">
                           <InfoRow label="Mã đơn:">{booking.bookingCode}</InfoRow>
                           <InfoRow label="Giờ đặt:">
                              {`${toVietnamTimeOfDay(booking.bookedAt)} ${formatDisplayDate(toVietnamDate(booking.bookedAt))}`}
                           </InfoRow>
                           <InfoRow label="Phương thức:">
                              {booking.paymentMethod
                                 ? (PAYMENT_METHOD_LABELS[booking.paymentMethod] ?? booking.paymentMethod)
                                 : '—'}
                           </InfoRow>
                           <div className="flex justify-end pt-1">
                              <span
                                 className={cn(
                                    'rounded-md border px-2.5 py-1 text-xs font-extrabold uppercase',
                                    statusTone,
                                 )}
                              >
                                 {SCAN_BOOKING_STATUS_LABELS[booking.bookingStatus]}
                              </span>
                           </div>
                        </dl>
                     </div>
                  </div>
               </div>
            </section>

            <section aria-labelledby="check-in-seats-heading" className="space-y-3">
               <h3 id="check-in-seats-heading" className={SECTION_HEADING_CLASS_NAME}>
                  Danh sách ghế
               </h3>
               <div className="overflow-x-auto rounded-xl border border-ink-200">
                  <table className="w-full min-w-[34rem] text-sm text-ink-800">
                     <thead className="bg-ink-50">
                        <tr>
                           <th className={TABLE_HEAD_CELL_CLASS_NAME}>Ghế</th>
                           <th className={TABLE_HEAD_CELL_CLASS_NAME}>Loại</th>
                           <th className={TABLE_HEAD_CELL_CLASS_NAME}>Đơn giá</th>
                           <th className={TABLE_HEAD_CELL_CLASS_NAME}>Trạng thái</th>
                           <th className={cn(TABLE_HEAD_CELL_CLASS_NAME, 'text-right')}>Hành động</th>
                        </tr>
                     </thead>
                     <tbody>{booking.tickets.map(renderSeatRow)}</tbody>
                  </table>
                  <p className="flex items-center justify-between border-t border-ink-200 bg-ink-50 px-4 py-3 text-sm font-bold text-ink-900">
                     <span className="flex items-center gap-2">
                        Tổng tiền vé
                        <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-800">
                           {totalTicketCount} ghế
                        </span>
                     </span>
                     <span className="text-lg font-extrabold text-brand-700">{formatVnd(ticketTotal)}</span>
                  </p>
               </div>
            </section>
         </div>
      );
   }

   return (
      <section aria-live="polite" className="space-y-4">
         <div
            className={cn(
               'flex items-center gap-3 rounded-xl border-l-4 px-4 py-3',
               CHECK_IN_TONE_CLASS_NAMES[resultStyle.tone],
            )}
         >
            {ResultIcon && <ResultIcon className="size-6 shrink-0" aria-hidden="true" />}
            <div className="min-w-0">
               <h2 className="text-base font-extrabold leading-tight">{resultStyle.title}</h2>
               <p className="text-xs font-medium leading-snug">{scanResponse.message}</p>
            </div>
         </div>

         {scanBooking && renderBookingDetails(scanBooking)}

         <div className="flex flex-wrap gap-3">
            {scanBooking && pendingTicketIds.length > 0 && (
               <Button
                  onClick={handleConfirm}
                  disabled={isBusy || !scanResponse.canCheckIn || selectedPendingCount === 0}
                  className="h-12 px-6 text-base"
               >
                  Xác nhận vào rạp
                  <span className="ml-3 rounded-md bg-white/25 px-2 py-0.5 text-sm font-extrabold">
                     {selectedPendingCount}/{pendingTicketIds.length} ghế
                  </span>
               </Button>
            )}
            <Button variant="secondary" onClick={onReset} disabled={isBusy} className="h-12 px-6 text-base">
               Quét vé tiếp
            </Button>
         </div>
      </section>
   );
}

export default CheckInResultCard;
