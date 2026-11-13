import { Minus, Plus, UtensilsCrossed } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import { toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type {
   FnbPickupBooking,
   FnbPickupDeliverLineRequest,
   FnbPickupLine,
   FnbPickupScanResponse,
} from '@/types/staff/fnbPickup';
import { CHECK_IN_TONE_CLASS_NAMES, type CheckInResultStyle } from '../utils/checkInLabels';
import { FNB_PICKUP_RESULT_STYLES } from '../utils/fnbPickupLabels';

interface FnbPickupResultCardProps {
   scanResponse: FnbPickupScanResponse;
   isBusy: boolean;
   onDeliver: (fnbPickupDeliverLineRequests: FnbPickupDeliverLineRequest[]) => void;
   onReset: () => void;
}

function buildInitialQuantities(fnbPickupBooking: FnbPickupBooking | null): Record<number, number> {
   const quantities: Record<number, number> = {};
   for (const fnbPickupLine of fnbPickupBooking?.lines ?? []) {
      quantities[fnbPickupLine.detailId] = fnbPickupLine.remainingQuantity;
   }
   return quantities;
}

export function FnbPickupResultCard({
   scanResponse,
   isBusy,
   onDeliver,
   onReset,
}: FnbPickupResultCardProps): ReactElement {
   const fnbPickupBooking: FnbPickupBooking | null = scanResponse.booking;
   const [deliverQuantities, setDeliverQuantities] = useState<Record<number, number>>(
      buildInitialQuantities(fnbPickupBooking),
   );
   const resultStyle: CheckInResultStyle = FNB_PICKUP_RESULT_STYLES[scanResponse.resultCode];
   const ResultIcon = resultStyle.icon;
   const selectedTotal: number = Object.values(deliverQuantities).reduce(
      (sumQuantity, quantity) => sumQuantity + quantity,
      0,
   );

   function changeQuantity(fnbPickupLine: FnbPickupLine, delta: number): void {
      setDeliverQuantities((previousQuantities) => {
         const nextQuantity: number = Math.min(
            fnbPickupLine.remainingQuantity,
            Math.max(0, (previousQuantities[fnbPickupLine.detailId] ?? 0) + delta),
         );
         return { ...previousQuantities, [fnbPickupLine.detailId]: nextQuantity };
      });
   }

   function handleDeliver(): void {
      const fnbPickupDeliverLineRequests: FnbPickupDeliverLineRequest[] = (fnbPickupBooking?.lines ?? [])
         .filter((fnbPickupLine) => (deliverQuantities[fnbPickupLine.detailId] ?? 0) > 0)
         .map((fnbPickupLine) => ({
            detailId: fnbPickupLine.detailId,
            quantity: deliverQuantities[fnbPickupLine.detailId],
         }));
      onDeliver(fnbPickupDeliverLineRequests);
   }

   function renderLine(fnbPickupLine: FnbPickupLine): ReactElement {
      const isDone: boolean = fnbPickupLine.remainingQuantity === 0;
      const deliverQuantity: number = deliverQuantities[fnbPickupLine.detailId] ?? 0;
      return (
         <li
            key={fnbPickupLine.detailId}
            className={cn('flex flex-wrap items-center gap-3 px-4 py-3 text-sm', isDone && 'bg-ink-50 text-ink-500')}
         >
            {fnbPickupLine.imageUrl ? (
               <img
                  src={fnbPickupLine.imageUrl}
                  alt={fnbPickupLine.name}
                  className={cn('size-12 shrink-0 rounded-lg bg-ink-50 object-contain', isDone && 'opacity-50')}
               />
            ) : (
               <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-300">
                  <UtensilsCrossed className="size-5" aria-hidden="true" />
               </span>
            )}
            <span className="min-w-0 flex-1">
               <span className="block font-bold text-ink-900">{fnbPickupLine.name}</span>
               {fnbPickupLine.composition && (
                  <span className="block text-xs font-semibold text-accent-700">{fnbPickupLine.composition}</span>
               )}
               <span className="block text-xs text-ink-500">
                  Đã giao {fnbPickupLine.deliveredQuantity}/{fnbPickupLine.quantity} ·{' '}
                  {formatVnd(fnbPickupLine.unitPrice)} / phần
               </span>
               {fnbPickupLine.deliveredAt && (
                  <span className="block text-xs text-ink-500">
                     Giao lần cuối {toVietnamTimeOfDay(fnbPickupLine.deliveredAt)}
                     {fnbPickupLine.deliveredByStaffName ? ` bởi ${fnbPickupLine.deliveredByStaffName}` : ''}
                  </span>
               )}
            </span>
            {isDone ? (
               <span className="rounded-md bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600">Đã nhận đủ</span>
            ) : (
               <span className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">Giao lần này:</span>
                  <button
                     type="button"
                     disabled={isBusy || !scanResponse.canDeliver || deliverQuantity === 0}
                     onClick={() => changeQuantity(fnbPickupLine, -1)}
                     aria-label={`Giảm số lượng ${fnbPickupLine.name}`}
                     className="grid size-8 place-items-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
                  >
                     <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="w-12 text-center text-base font-extrabold text-ink-900">
                     {deliverQuantity}/{fnbPickupLine.remainingQuantity}
                  </span>
                  <button
                     type="button"
                     disabled={isBusy || !scanResponse.canDeliver || deliverQuantity >= fnbPickupLine.remainingQuantity}
                     onClick={() => changeQuantity(fnbPickupLine, 1)}
                     aria-label={`Tăng số lượng ${fnbPickupLine.name}`}
                     className="grid size-8 place-items-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
                  >
                     <Plus className="size-4" aria-hidden="true" />
                  </button>
               </span>
            )}
         </li>
      );
   }

   function renderBooking(booking: FnbPickupBooking): ReactElement {
      return (
         <div className="space-y-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <h3 className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-extrabold uppercase tracking-wide text-ink-700">
               <span>Bắp nước / Combo</span>
               <span className="font-mono text-xs font-bold normal-case text-ink-600">
                  Mã đơn: {booking.bookingCode}
               </span>
            </h3>
            {booking.lines.length > 0 && (
               <div className="overflow-hidden rounded-xl border border-ink-200">
                  <ul className="divide-y divide-ink-100">{booking.lines.map(renderLine)}</ul>
                  {booking.remainingQuantity > 0 && (
                     <p className="flex items-center justify-between border-t border-ink-200 bg-ink-50 px-4 py-3 text-sm font-bold text-ink-900">
                        <span>Còn chưa giao</span>
                        <span className="text-lg font-extrabold text-brand-700">
                           {booking.remainingQuantity}/{booking.totalQuantity} phần
                        </span>
                     </p>
                  )}
               </div>
            )}
         </div>
      );
   }

   return (
      <section aria-live="polite" className="space-y-4">
         {!fnbPickupBooking && (
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
         )}

         {fnbPickupBooking && renderBooking(fnbPickupBooking)}

         <div className="flex flex-wrap gap-3">
            {scanResponse.canDeliver && (
               <Button onClick={handleDeliver} disabled={isBusy || selectedTotal === 0} className="h-12 px-6 text-base">
                  Xác nhận giao
                  <span className="ml-3 rounded-md bg-white/25 px-2 py-0.5 text-sm font-extrabold">
                     {selectedTotal} phần
                  </span>
               </Button>
            )}
            <Button variant="secondary" onClick={onReset} disabled={isBusy} className="h-12 px-6 text-base">
               Quét đơn tiếp
            </Button>
         </div>
      </section>
   );
}

export default FnbPickupResultCard;
