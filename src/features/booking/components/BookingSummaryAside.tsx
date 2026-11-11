import { CalendarDays, Clapperboard, Clock, MapPin, Armchair, UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatClockRange, formatDisplayDate, toVietnamDate } from '@/lib/common/vietnamTime';
import { formatDuration } from '@/lib/movie/movieFormat';
import type { ScreenType } from '@/types/cinema/cinema';
import type { AgeRating } from '@/types/movie/movie';

export interface SummarySeat {
   id: number;
   label: string;
   price: number;
}

export interface SummaryFnbLine {
   key: string;
   name: string;
   quantity: number;
   amount: number;
}

export interface SummaryShowtime {
   cinemaName: string | null;
   hallName: string;
   screenType: ScreenType;
   startTime: string;
   endTime: string;
}

interface BookingSummaryAsideProps {
   movieTitle: string;
   posterUrl: string | null;
   rated: AgeRating;
   durationMinutes: number;
   summaryShowtime: SummaryShowtime | null;
   priceFrom: number | null;
   summarySeats: SummarySeat[] | null;
   summaryFnbLines?: SummaryFnbLine[] | null;
   actionLabel?: string;
   actionTo?: string | null;
   actionHint?: string | null;
   footer?: ReactElement;
}

export function BookingSummaryAside({
   movieTitle,
   posterUrl,
   rated,
   durationMinutes,
   summaryShowtime,
   priceFrom,
   summarySeats,
   summaryFnbLines = null,
   actionLabel = '',
   actionTo = null,
   actionHint = null,
   footer,
}: BookingSummaryAsideProps): ReactElement {
   const ticketAmount: number = (summarySeats ?? []).reduce(
      (sumAmount, summarySeat) => sumAmount + summarySeat.price,
      0,
   );
   const fnbQuantity: number = (summaryFnbLines ?? []).reduce(
      (sumQuantity, summaryFnbLine) => sumQuantity + summaryFnbLine.quantity,
      0,
   );
   const fnbAmount: number = (summaryFnbLines ?? []).reduce(
      (sumAmount, summaryFnbLine) => sumAmount + summaryFnbLine.amount,
      0,
   );

   return (
      <aside
         aria-label="Thông tin đặt vé"
         className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs lg:sticky lg:top-24"
      >
         <div className="flex gap-4">
            <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
               {posterUrl ? (
                  <img src={posterUrl} alt={`Poster phim ${movieTitle}`} className="size-full object-cover" />
               ) : (
                  <span className="grid size-full place-items-center text-brand-300">
                     <Clapperboard className="size-8" aria-hidden="true" />
                  </span>
               )}
            </div>
            <div className="min-w-0 space-y-2">
               <h2 className="text-base font-extrabold uppercase leading-snug text-brand-700">{movieTitle}</h2>
               <div className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
                  <AgeRatingBadge ageRating={rated} />
                  <span>{formatDuration(durationMinutes)}</span>
               </div>
            </div>
         </div>

         {summaryShowtime ? (
            <ul className="space-y-3 border-t border-ink-100 pt-4 text-sm text-ink-700">
               <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>
                     {summaryShowtime.cinemaName && (
                        <span className="block font-semibold text-ink-900">{summaryShowtime.cinemaName}</span>
                     )}
                     {summaryShowtime.hallName} · {summaryShowtime.screenType}
                  </span>
               </li>
               <li className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>{formatDisplayDate(toVietnamDate(summaryShowtime.startTime))}</span>
               </li>
               <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>{formatClockRange(summaryShowtime.startTime, summaryShowtime.endTime)}</span>
               </li>
               {priceFrom !== null && (
                  <li className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-xs text-ink-700">
                     <span>Giá vé từ</span>
                     <span className="text-sm font-extrabold text-brand-700">{formatVnd(priceFrom)}</span>
                  </li>
               )}
            </ul>
         ) : (
            <p className="border-t border-ink-100 pt-4 text-sm text-ink-500">
               Chọn ngày và suất chiếu để xem thông tin vé.
            </p>
         )}

         {summarySeats !== null && (
            <div className="space-y-3 border-t border-ink-100 pt-4 text-sm">
               <h3 className="flex items-center gap-2 font-semibold text-ink-900">
                  <Armchair className="size-4 text-brand-600" aria-hidden="true" />
                  Ghế đã chọn ({summarySeats.length})
               </h3>
               {summarySeats.length === 0 ? (
                  <p className="text-ink-500">Chưa chọn ghế nào.</p>
               ) : (
                  <ul className="space-y-1.5">
                     {summarySeats.map((summarySeat) => (
                        <li key={summarySeat.id} className="flex items-center justify-between text-ink-700">
                           <span className="font-semibold">{summarySeat.label}</span>
                           <span>{formatVnd(summarySeat.price)}</span>
                        </li>
                     ))}
                  </ul>
               )}
               {summaryFnbLines === null && (
                  <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                     <span className="font-semibold text-ink-900">Tạm tính</span>
                     <span className="text-lg font-extrabold text-brand-700">{formatVnd(ticketAmount)}</span>
                  </div>
               )}
            </div>
         )}

         {summaryFnbLines !== null && (
            <div className="space-y-3 border-t border-ink-100 pt-4 text-sm">
               <h3 className="flex items-center gap-2 font-semibold text-ink-900">
                  <UtensilsCrossed className="size-4 text-brand-600" aria-hidden="true" />
                  Bắp nước ({fnbQuantity})
               </h3>
               {summaryFnbLines.length === 0 ? (
                  <p className="text-ink-500">Chưa chọn bắp nước.</p>
               ) : (
                  <ul className="space-y-1.5">
                     {summaryFnbLines.map((summaryFnbLine) => (
                        <li key={summaryFnbLine.key} className="flex items-start justify-between gap-3 text-ink-700">
                           <span>
                              <span className="font-semibold">{summaryFnbLine.quantity} ×</span> {summaryFnbLine.name}
                           </span>
                           <span className="shrink-0">{formatVnd(summaryFnbLine.amount)}</span>
                        </li>
                     ))}
                  </ul>
               )}
               <dl className="space-y-1.5 border-t border-ink-100 pt-3">
                  <div className="flex items-center justify-between text-ink-700">
                     <dt>Tiền vé</dt>
                     <dd>{formatVnd(ticketAmount)}</dd>
                  </div>
                  <div className="flex items-center justify-between text-ink-700">
                     <dt>Bắp nước</dt>
                     <dd>{formatVnd(fnbAmount)}</dd>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                     <dt className="font-semibold text-ink-900">Tổng cộng</dt>
                     <dd className="text-lg font-extrabold text-brand-700">{formatVnd(ticketAmount + fnbAmount)}</dd>
                  </div>
               </dl>
            </div>
         )}

         {footer ?? (
            <div className="space-y-2">
               {actionTo ? (
                  <LinkButton to={actionTo} fullWidth>
                     {actionLabel}
                  </LinkButton>
               ) : (
                  <Button fullWidth disabled>
                     {actionLabel}
                  </Button>
               )}
               {actionHint && <p className="text-center text-xs text-ink-500">{actionHint}</p>}
            </div>
         )}
      </aside>
   );
}

export default BookingSummaryAside;
