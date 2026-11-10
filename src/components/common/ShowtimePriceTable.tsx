import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';
import { PRICE_RULE_TYPE_LABELS } from '@/lib/showtime/priceLabels';
import { cn } from '@/lib/common/utils';
import type { AppliedPriceRule, SeatTypePrice, ShowtimePrice } from '@/types/showtime/pricing';

interface ShowtimePriceTableProps {
   showtimePrice: ShowtimePrice;
   className?: string;
}

interface SurchargeColumn {
   label: string;
   amount: number;
}

const EMPTY_CELL: string = '—';

function formatSurcharge(amount: number): string {
   return amount > 0 ? `+${formatVnd(amount)}` : EMPTY_CELL;
}

function buildSurchargeColumns(showtimePrice: ShowtimePrice): SurchargeColumn[] {
   return [
      { label: 'Khung giờ', amount: showtimePrice.timeSlotSurcharge },
      { label: 'Lễ / cuối tuần', amount: showtimePrice.dayTypeSurcharge },
      { label: 'Loại phòng', amount: showtimePrice.screenTypeSurcharge },
   ];
}

export function ShowtimePriceTable({ showtimePrice, className }: ShowtimePriceTableProps): ReactElement {
   const surchargeColumns: SurchargeColumn[] = buildSurchargeColumns(showtimePrice);

   return (
      <div className={cn('space-y-3', className)}>
         <div className="overflow-x-auto rounded-xl ring-1 ring-ink-100">
            <table className="w-full min-w-[560px] border-collapse text-sm">
               <thead>
                  <tr className="bg-ink-50 text-left text-[11px] font-bold uppercase tracking-wider text-ink-500">
                     <th scope="col" className="px-3 py-2.5">
                        Loại ghế
                     </th>
                     <th scope="col" className="px-3 py-2.5 text-right">
                        Giá gốc
                     </th>
                     <th scope="col" className="px-3 py-2.5 text-right">
                        Phụ thu ghế
                     </th>
                     {surchargeColumns.map((surchargeColumn) => (
                        <th key={surchargeColumn.label} scope="col" className="px-3 py-2.5 text-right">
                           {surchargeColumn.label}
                        </th>
                     ))}
                     <th scope="col" className="px-3 py-2.5 text-right text-brand-700">
                        Giá vé
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {showtimePrice.seatTypePrices.map((seatTypePrice: SeatTypePrice) => (
                     <tr key={seatTypePrice.seatTypeCode} className="border-t border-ink-100">
                        <th scope="row" className="px-3 py-2.5 text-left font-semibold text-ink-900">
                           {seatTypePrice.seatTypeName}
                        </th>
                        <td className="px-3 py-2.5 text-right text-ink-700">{formatVnd(showtimePrice.basePrice)}</td>
                        <td className="px-3 py-2.5 text-right text-ink-700">
                           {formatSurcharge(seatTypePrice.seatSurcharge)}
                        </td>
                        {surchargeColumns.map((surchargeColumn) => (
                           <td key={surchargeColumn.label} className="px-3 py-2.5 text-right text-ink-700">
                              {formatSurcharge(surchargeColumn.amount)}
                           </td>
                        ))}
                        <td className="px-3 py-2.5 text-right text-base font-extrabold text-brand-700">
                           {formatVnd(seatTypePrice.totalPrice)}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {showtimePrice.appliedRules.length === 0 ? (
            <p className="text-xs text-ink-500">Suất chiếu này không có phụ thu theo khung giờ, ngày hay loại phòng.</p>
         ) : (
            <ul className="flex flex-wrap gap-2">
               {showtimePrice.appliedRules.map((appliedPriceRule: AppliedPriceRule) => (
                  <li
                     key={appliedPriceRule.ruleId}
                     className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100"
                  >
                     {appliedPriceRule.ruleName} ({PRICE_RULE_TYPE_LABELS[appliedPriceRule.ruleType]}) +
                     {formatVnd(appliedPriceRule.surchargeAmount)}
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}

export default ShowtimePriceTable;
