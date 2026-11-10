import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';
import { useSeatTypes } from '@/lib/cinema/useSeatTypes';
import type { SeatType } from '@/types/cinema/cinema';

export function SeatTypeSurchargeCard(): ReactElement {
   const seatTypesQuery: UseQueryResult<SeatType[]> = useSeatTypes();
   const seatTypes: SeatType[] = seatTypesQuery.data ?? [];

   return (
      <section className="space-y-4 rounded-lg bg-white p-5 shadow-card ring-1 ring-ink-200/80">
         <div>
            <h2 className="text-[15px] font-semibold text-ink-900">Phụ thu theo loại ghế</h2>
            <p className="mt-1 text-sm text-ink-500">
               Mức phụ thu gắn với từng loại ghế, luôn được cộng vào giá vé của ghế đó.
            </p>
         </div>
         {seatTypesQuery.isPending && <p className="text-sm text-ink-500">Đang tải...</p>}
         <ul className="grid gap-3 sm:grid-cols-3">
            {seatTypes.map((seatType) => (
               <li key={seatType.id} className="rounded-2xl bg-ink-50 px-4 py-3 ring-1 ring-ink-100">
                  <p className="text-sm font-bold text-ink-900">{seatType.name}</p>
                  <p className="mt-0.5 text-base font-semibold text-brand-700">
                     {seatType.defaultSurcharge > 0 ? `+${formatVnd(seatType.defaultSurcharge)}` : 'Không phụ thu'}
                  </p>
               </li>
            ))}
         </ul>
      </section>
   );
}

export default SeatTypeSurchargeCard;
